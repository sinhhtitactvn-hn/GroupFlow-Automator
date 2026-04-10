import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 
  await app.listen(3001, '0.0.0.0'); // Thêm '0.0.0.0' để chắc chắn Windows nhận diện port
  console.log(`🚀 Backend is ALIVE on: http://localhost:3001`);
}
bootstrap();