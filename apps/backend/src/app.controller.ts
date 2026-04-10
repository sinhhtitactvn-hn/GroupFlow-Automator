import { 
  Controller, Get, Post, Body, Delete, Param, Patch, 
  BadRequestException, UseInterceptors, UploadedFiles 
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { PrismaService } from './prisma.service';
import * as fs from 'fs';

const rootUploadsDir = join(process.cwd(), '../../uploads');
if (!fs.existsSync(rootUploadsDir)) {
  fs.mkdirSync(rootUploadsDir, { recursive: true });
}

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  // --- QUẢN LÝ TÀI KHOẢN ---
  @Get('accounts')
  async getAccounts() {
    return this.prisma.fbAccount.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('accounts')
  async createAccount(@Body() data: { cookie: string; token?: string; proxy?: string }) {
    if (!data.cookie) throw new BadRequestException('Cookie is required');
    const uidMatch = data.cookie.match(/c_user=(\d+)/);
    const uid = uidMatch ? uidMatch[1] : 'unknown_' + Date.now();
    return this.prisma.fbAccount.upsert({
      where: { uid },
      update: { ...data, status: 'UNCHECKED' },
      create: { ...data, uid, status: 'UNCHECKED' },
    });
  }

  @Patch('accounts/:id')
  async updateAccount(@Param('id') id: string, @Body() data: any) {
    return this.prisma.fbAccount.update({ where: { id }, data: { ...data, status: 'UNCHECKED' } });
  }

  @Delete('accounts/:id')
  async deleteAccount(@Param('id') id: string) {
    return this.prisma.fbAccount.delete({ where: { id } });
  }

  @Post('accounts/:id/check')
  async triggerCheck(@Param('id') id: string) {
    return this.prisma.fbAccount.update({ where: { id }, data: { status: 'UNCHECKED' } });
  }

  // --- QUẢN LÝ CHIẾN DỊCH POST (NÂNG CẤP LƯU ACCOUNT COUNT) ---
  @Post('campaigns')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: rootUploadsDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async createCampaign(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: { content: string; groupIds: string; scheduledAt?: string; accountCount?: string }
  ) {
    if (!data.content || !data.groupIds) throw new BadRequestException('Dữ liệu không đầy đủ');

    const cleanGroupIds = data.groupIds.split(',').map(id => id.trim()).filter(id => id.length > 0).join(',');
    const mediaPaths = files?.length > 0 ? files.map(f => f.path).join(',') : null;

    return this.prisma.campaign.create({
      data: {
        content: data.content,
        groupIds: cleanGroupIds,
        mediaPaths: mediaPaths,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : new Date(),
        // NEW: Lưu số lượng tài khoản (Ép kiểu từ string sang int vì FormData gửi string)
        accountCount: data.accountCount ? parseInt(data.accountCount) : 1,
        status: 'PENDING',
      },
    });
  }

  @Get('campaigns')
  async getCampaigns() {
    return this.prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    return this.prisma.campaign.delete({ where: { id } });
  }

  // --- MODULE AUTO-COMMENT (NÂNG CẤP LƯU ACCOUNT COUNT) ---
  @Get('comment-campaigns')
  async getCommentCampaigns() {
    return this.prisma.commentCampaign.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('comment-campaigns')
  async createCommentCampaign(@Body() data: { groupIds: string; keywords: string; commentText: string; accountCount?: number }) {
    return this.prisma.commentCampaign.create({
      data: {
        ...data,
        // NEW: Đảm bảo lưu accountCount cho chiến dịch comment
        accountCount: data.accountCount ? Number(data.accountCount) : 1,
        status: 'RUNNING',
      },
    });
  }

  @Delete('comment-campaigns/:id')
  async deleteCommentCampaign(@Param('id') id: string) {
    return this.prisma.commentCampaign.delete({ where: { id } });
  }

  // --- MODULE DASHBOARD ---
  @Get('stats')
  async getStats() {
    const [totalPosts, totalComments, failedActions, liveAccs] = await Promise.all([
      this.prisma.actionLog.count({ where: { type: 'POST', status: 'SUCCESS' } }),
      this.prisma.actionLog.count({ where: { type: 'COMMENT', status: 'SUCCESS' } }),
      this.prisma.actionLog.count({ where: { status: 'FAILED' } }),
      this.prisma.fbAccount.count({ where: { status: 'LIVE' } }),
    ]);
    return { totalPosts, totalComments, failedActions, liveAccs };
  }

  @Get('logs')
  async getLogs() {
    return this.prisma.actionLog.findMany({ take: 20, orderBy: { createdAt: 'desc' } });
  }
}