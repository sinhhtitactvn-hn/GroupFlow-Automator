import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Để trống, Prisma 6 sẽ tự động đọc DATABASE_URL từ file .env
    super();
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ [System] Database connected via Prisma 6.4.1');
  }
}