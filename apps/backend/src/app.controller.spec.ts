import { Controller, Get, Post, Body, Delete, Param, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('accounts')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Lấy danh sách tài khoản
  @Get()
  async getAccounts() {
    return this.prisma.fbAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Thêm hoặc Cập nhật tài khoản (Upsert)
  @Post()
  async createAccount(@Body() data: { cookie: string; token?: string; proxy?: string }) {
    // Logic trích xuất UID từ Cookie (Staff Engineer Tip: Luôn validate ở Backend)
    const uidMatch = data.cookie.match(/c_user=(\d+)/);
    if (!uidMatch) {
      throw new BadRequestException('Cookie không hợp lệ (thiếu c_user)');
    }
    const uid = uidMatch[1];

    // Sử dụng upsert: Nếu trùng UID thì cập nhật Cookie/Token mới, nếu chưa có thì tạo mới
    return this.prisma.fbAccount.upsert({
      where: { uid },
      update: {
        cookie: data.cookie,
        token: data.token,
        proxy: data.proxy,
        status: 'LIVE', // Khi cập nhật cookie mới, mặc định coi là Live để check lại sau
      },
      create: {
        uid,
        cookie: data.cookie,
        token: data.token,
        proxy: data.proxy,
        status: 'LIVE',
      },
    });
  }

  // 3. Xóa tài khoản
  @Delete(':id')
  async deleteAccount(@Param('id') id: string) {
    return this.prisma.fbAccount.delete({
      where: { id },
    });
  }
}