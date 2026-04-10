# 🚀 GroupFlow Automator (V1.0)

Hệ thống tự động hóa Marketing trên Facebook Group: Auto-Post, Auto-Comment, Multi-Account & Real-time Monitoring.

## 🛠 Tech Stack
- **Monorepo:** Turborepo + pnpm
- **Frontend:** Next.js 14, TanStack Query, TailwindCSS
- **Backend:** NestJS, Prisma 6.4.1 (SQLite)
- **Automation:** Playwright (Chromium)

## 📦 Cấu trúc dự án
- `apps/frontend`: Dashboard quản lý UI.
- `apps/backend`: API xử lý dữ liệu và lưu trữ.
- `apps/worker`: Con bot chạy ngầm điều khiển trình duyệt.
- `packages/database`: Quản lý Prisma Schema dùng chung.
- `uploads/`: Nơi lưu trữ ảnh/video đính kèm bài viết.

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Node.js v18 trở lên.
- pnpm (`npm install -g pnpm`).

### 2. Cài đặt Dependencies
```bash
pnpm install
npx playwright install chromium
```

### 3. Cấu hình Database
- Copy file `.env.example` thành `.env` trong thư mục `apps/backend`.
- Tạo thư mục `uploads` ở thư mục gốc: `mkdir uploads`
- Chạy lệnh:
```bash
cd packages/database
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Chạy ứng dụng (Development)
```bash
pnpm dev
```
- Dashboard: `http://localhost:3000`
- API: `http://localhost:3001`

## 🛡️ Nguyên tắc an toàn (Anti-Ban)
- **Spintax:** Luôn sử dụng định dạng `{nội dung 1|nội dung 2}` để tránh trùng lặp nội dung.
- **Delay:** Worker đã được thiết lập nghỉ 20-30s giữa các bài viết. Không nên giảm thời gian này.
- **Proxy:** Gán proxy riêng cho từng tài khoản tại trang Quản lý tài khoản.

## 📝 Giấy phép
Bản quyền thuộc về SinhHT.