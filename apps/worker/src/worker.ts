import { PrismaClient } from '@repo/database';
import { chromium, BrowserContext } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { parseSpintax } from './utils/spintax';

const dbPath = path.resolve(__dirname, '../../../packages/database/prisma/dev.db');
const prisma = new PrismaClient({
  datasourceUrl: `file:${dbPath}`,
} as any);

/**
 * STAFF ENGINEER UTILITY: Lấy danh sách tài khoản LIVE ngẫu nhiên theo số lượng
 */
async function getRandomLiveAccounts(count: number) {
  const allLive = await prisma.fbAccount.findMany({ where: { status: 'LIVE' } });
  if (allLive.length === 0) return [];
  
  // Trộn ngẫu nhiên (Shuffle)
  const shuffled = allLive.sort(() => 0.5 - Math.random());
  
  // Lấy ra số lượng yêu cầu (không vượt quá số lượng đang có)
  return shuffled.slice(0, Math.min(count, allLive.length));
}

async function logAction(type: 'POST' | 'COMMENT' | 'CHECK_ACC', status: 'SUCCESS' | 'FAILED' | 'BLOCKED', uid: string, message: string, target?: string) {
  try {
    await prisma.actionLog.create({
      data: { type, status, uid, message, target: target ? String(target) : null }
    });
  } catch (e) {
    console.error('❌ Lỗi ghi log:', e);
  }
}

async function injectCookies(context: BrowserContext, cookieStr: string) {
  const cleanCookie = cookieStr.trim().replace(/;+$/, "");
  const cookieItems = cleanCookie.split(';').map(pair => {
    const parts = pair.trim().split('=');
    if (parts.length < 2) return null;
    const name = parts[0];
    const value = parts.slice(1).join('=');
    return { name: name.trim(), value: value.trim(), domain: '.facebook.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' as any };
  }).filter(Boolean) as any[];
  await context.addCookies(cookieItems);
}

// Biến khóa ngăn chạy chồng chéo
let isChecking = false;
let isPosting = false;
let isCommenting = false;

/**
 * MODULE 1: CHECK LIVE/DIE (GIỮ NGUYÊN)
 */
async function checkAccountStatus() {
  if (isChecking) return;

  // STAFF ENGINEER TIP: 
  // Chúng ta bốc các tài khoản có trạng thái UNCHECKED (do vừa ấn nút trên Web)
  // HOẶC tài khoản đã quá 30 phút chưa kiểm tra (để bảo trì dàn nick)
  const accounts = await prisma.fbAccount.findMany({
    where: {
      OR: [
        { status: 'UNCHECKED' },
        { updatedAt: { lte: new Date(Date.now() - 30 * 60 * 1000) } } 
      ]
    }
  });

  // Nếu DB không có tài khoản nào cần check, thoát ngay để tiết kiệm tài nguyên
  if (accounts.length === 0) return;

  isChecking = true;
  console.log(`⚡ [Priority Check] Đang kiểm tra ${accounts.length} tài khoản...`);

  for (const acc of accounts) {
    // SỬ DỤNG LẠI CHÍNH XÁC LOGIC KIỂM TRA MÀ BẠN ĐÃ XÁC NHẬN CHẠY TỐT
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ 
      viewport: { width: 414, height: 896 }, 
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1' 
    });

    try {
      await injectCookies(context, acc.cookie);
      const page = await context.newPage();
      
      // Sử dụng lại domain m.facebook.com như bạn mong muốn
      await page.goto('https://m.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);

      const hasComposer = await page.locator('text="Đăng cập nhật trạng thái"').count() > 0 
                       || await page.locator('text="Bạn đang nghĩ gì?"').count() > 0;
      
      const isLoginPage = await page.locator('input[name="pass"]').count() > 0;
      
      const finalStatus = (hasComposer && !isLoginPage) ? 'LIVE' : 'DIE';

      await prisma.fbAccount.update({ 
        where: { id: acc.id }, 
        data: { status: finalStatus, updatedAt: new Date() } 
      });

      console.log(`📡 [Account] UID ${acc.uid} is ${finalStatus}.`);
      await logAction('CHECK_ACC', finalStatus === 'LIVE' ? 'SUCCESS' : 'FAILED', acc.uid, `Kiểm tra tài khoản: ${finalStatus}`);

    } catch (e: any) { 
      console.error(`❌ Lỗi check ${acc.uid}:`, e.message); 
      await logAction('CHECK_ACC', 'FAILED', acc.uid, `Lỗi: ${e.message}`);
    } finally { 
      await browser.close(); 
    }
  }
  isChecking = false;
}

/**
 * MODULE 2: AUTO-POST (NÂNG CẤP MULTI-ACCOUNT)
 */
async function runPendingCampaigns() {
  if (isPosting) return;
  isPosting = true;
  const now = new Date();
  const campaign = await prisma.campaign.findFirst({
    where: { status: 'PENDING', scheduledAt: { lte: now } }
  });

  if (!campaign) { isPosting = false; return; }

  // STAFF ENGINEER LOGIC: Lấy danh sách N tài khoản ngẫu nhiên
  const selectedAccounts = await getRandomLiveAccounts(campaign.accountCount || 1);
  
  if (selectedAccounts.length === 0) {
    console.log('⚠️ Không có tài khoản LIVE để chạy.');
    isPosting = false; 
    return; 
  }

  console.log(`🚀 [Post] Chiến dịch ${campaign.id} sẽ chạy với ${selectedAccounts.length} tài khoản.`);
  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: 'RUNNING' } });

  // Lặp qua từng tài khoản (Chạy tuần tự để an toàn IP)
  for (const account of selectedAccounts) {
    console.log(`👤 Tài khoản ${account.uid} đang thực hiện bài đăng...`);
    const browser = await chromium.launch({ headless: false }); 
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    try {
      await injectCookies(context, account.cookie);
      const page = await context.newPage();
      for (const gid of campaign.groupIds.split(',')) {
        const groupId = gid.trim();
        try {
          await page.goto(`https://www.facebook.com/groups/${groupId}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForTimeout(7000);
          await page.locator('text=/Bạn viết gì đi/i').first().click({ delay: 500 });
          const modal = page.locator('div[role="dialog"]');
          await modal.waitFor({ state: 'visible', timeout: 15000 });
          const editor = modal.locator('div[role="textbox"]').first();
          await editor.focus();
          await page.keyboard.insertText(parseSpintax(campaign.content));

          if (campaign.mediaPaths) {
            const fileChooserPromise = page.waitForEvent('filechooser');
            await modal.locator('div[aria-label="Ảnh/video"]').first().click();
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles(campaign.mediaPaths.split(','));
            await page.waitForTimeout(15000); 
          }

          await modal.locator('div[aria-label="Đăng"]').or(modal.locator('div[aria-label="Post"]')).first().click({ force: true });
          await logAction('POST', 'SUCCESS', account.uid, `Đăng thành công lên Group: ${groupId}`, groupId);
          await page.waitForTimeout(10000); 
        } catch (err: any) {
          await logAction('POST', 'FAILED', account.uid, `Lỗi tại nhóm ${groupId}: ${err.message}`, groupId);
        }
      }
    } finally { 
      await browser.close(); 
      await new Promise(r => setTimeout(r, 5000)); // Nghỉ 5s giữa các Acc
    }
  }

  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: 'COMPLETED' } });
  isPosting = false;
}

/**
 * MODULE 3: AUTO-COMMENT (NÂNG CẤP CHẠY NHIỀU ACC CHO 1 BÀI)
 */
async function runCommentCampaigns() {
  if (isCommenting) return;
  isCommenting = true;

  try {
    const campaigns = await prisma.commentCampaign.findMany({ where: { status: 'RUNNING' } });
    if (campaigns.length === 0) return;

    for (const cp of campaigns) {
      // 1. Bốc ngẫu nhiên N tài khoản theo cấu hình chiến dịch
      const selectedAccounts = await getRandomLiveAccounts(cp.accountCount || 1);
      if (selectedAccounts.length === 0) continue;

      console.log(`💬 [Comment] Chiến dịch ${cp.id} chạy với ${selectedAccounts.length} tài khoản.`);

      // 2. Chạy tuần tự từng tài khoản
      for (const account of selectedAccounts) {
        console.log(`👤 Tài khoản ${account.uid} bắt đầu đi quét...`);
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
        
        try {
          await injectCookies(context, account.cookie);
          const page = await context.newPage();
          for (const gid of cp.groupIds.split(',')) {
            // STAFF ENGINEER TIP: Truyền cả UID của acc hiện tại vào hàm quét
            await scanAndCommentGroup(page, gid.trim(), cp, account.uid);
          }
        } catch (err: any) {
          console.error(`❌ Lỗi tại tài khoản ${account.uid}:`, err.message);
        } finally {
          await browser.close();
          await new Promise(r => setTimeout(r, 5000)); // Nghỉ 5s để đổi acc khác
        }
      }
    }
  } finally {
    isCommenting = false;
  }
}

/**
 * Logic quét bài: Check trùng theo PostID + UID
 */
async function scanAndCommentGroup(page: any, groupId: string, cp: any, accountUid: string) {
  console.log(`🔍 [Scanning] Group: ${groupId} | Account: ${accountUid}`);
  
  await page.goto(`https://www.facebook.com/groups/${groupId}/?sorting_setting=CHRONOLOGICAL`, { 
    waitUntil: 'domcontentloaded', 
    timeout: 60000 
  });

  await page.waitForTimeout(10000);
  // Cuộn 1 đoạn để load bài viết
  await page.mouse.wheel(0, 1500);
  await page.waitForTimeout(4000);

  const keywords = cp.keywords.split(',').map((k: string) => k.trim().toLowerCase());
  const messageBlocks = page.locator('div[dir="auto"]');
  const count = await messageBlocks.count();

  for (let i = 0; i < count; i++) {
    try {
      const block = messageBlocks.nth(i);
      const text = await block.innerText();
      
      if (!text || text.length < 5) continue;
      if (!keywords.some(k => text.toLowerCase().includes(k))) continue;

      // STAFF ENGINEER TIP: Tạo ID bài viết dựa trên nội dung (Unique Hash)
      const postId = text.substring(0, 100).replace(/\s+/g, '_');

      // KIỂM TRA TRÙNG LẶP: (Cặp Bài viết + Tài khoản)
      const alreadyCommented = await prisma.scannedPost.findFirst({
        where: { postId, uid: accountUid }
      });

      if (alreadyCommented) {
        console.log(`⏭️ UID ${accountUid} đã làm bài này. Bỏ qua.`);
        continue;
      }

      console.log(`🎯 [Match] UID ${accountUid} phát hiện: "${text.substring(0, 20)}..."`);
      
      // Di chuyển tới bài viết
      await block.scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000); // Đợi UI ổn định sau khi scroll

      const blockBox = await block.boundingBox();
      if (!blockBox) continue;

      // Tìm ô nhập liệu gần nhất
      const allInputs = page.locator('div[role="textbox"]')
          .or(page.locator('[aria-label*="bình luận"]'))
          .or(page.locator('text="Viết bình luận..."'));

      const inputCount = await allInputs.count();
      let targetInput: any = null;
      let minDistance = 1200;

      for (let j = 0; j < inputCount; j++) {
        const input = allInputs.nth(j);
        const inputBox = await input.boundingBox();
        if (inputBox && inputBox.y > blockBox.y) {
          const dist = inputBox.y - blockBox.y;
          if (dist < minDistance) {
            minDistance = dist;
            targetInput = input;
          }
        }
      }

      if (targetInput && await targetInput.isVisible()) {
        console.log(`🖱️ Click comment (Distance: ${Math.round(minDistance)}px)`);
        await targetInput.click({ force: true, delay: 500 });
        await page.waitForTimeout(2500);

        const myComment = parseSpintax(cp.commentText);
        console.log(`⌨️ Acc ${accountUid} đang gõ: ${myComment}`);
        
        await page.keyboard.type(myComment, { delay: 100 });
        await page.waitForTimeout(2000);
        await page.keyboard.press('Enter');
        
        // Đợi 5 giây để Facebook gửi xong trước khi lưu DB
        await page.waitForTimeout(5000);

        // THOÁT TRẠNG THÁI FOCUS
        await page.keyboard.press('Escape');
        await page.keyboard.press('Escape');

        // LƯU DB: Chỉ lưu sau khi đã thực hiện các bước tương tác
        await prisma.scannedPost.create({ 
          data: { postId, uid: accountUid, campaignId: cp.id } 
        });

        await logAction('COMMENT', 'SUCCESS', accountUid, `Đã comment bài: ${text.substring(0, 15)}`, postId);
        console.log(`✅ [SUCCESS] UID ${accountUid} đã hoàn tất bài viết này.`);

        // Nghỉ 20s giữa các bài viết của cùng 1 tài khoản
        await page.waitForTimeout(20000);
      } else {
        console.log(`⚠️ UID ${accountUid} không tìm thấy ô comment ở gần bài viết này.`);
      }

    } catch (err: any) {
      console.error(`❌ Lỗi tại block ${i}:`, err.message);
      await page.keyboard.press('Escape');
    }
  }
}

console.log('📡 [Worker] System Online.');
setInterval(checkAccountStatus, 10000); 
setInterval(runPendingCampaigns, 20000); 
setInterval(runCommentCampaigns, 60000);
checkAccountStatus();