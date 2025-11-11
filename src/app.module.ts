import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.midleware';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // ตั้งค่า Rate Limiting แบบ Global
    // ttl = Time To Live (เวลาที่จำกัด) หน่วยเป็น milliseconds
    // limit = จำนวน requests สูงสุดในช่วงเวลา ttl
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,  // 1 วินาที
          limit: 3,   // จำกัด 3 requests ต่อ 1 วินาที
        },
        {
          name: 'medium',
          ttl: 10000, // 10 วินาที
          limit: 20,  // จำกัด 20 requests ต่อ 10 วินาที
        },
        {
          name: 'long',
          ttl: 60000, // 1 นาที (60000 ms)
          limit: 100, // จำกัด 100 requests ต่อ 1 นาที
        },
      ],
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User],
      synchronize: true, // dev เท่านั้น
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // เปิดใช้งาน CustomThrottlerGuard แบบ Global
    // Guard นี้จะทำงานกับทุก endpoints โดยอัตโนมัติ
    // และแสดง error message ที่อ่านง่ายกว่า default
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure Global Middleware
   * Apply LoggerMiddleware to ALL routes in the application
   *
   * ข้อดี:
   * - ไม่ต้อง import LoggerMiddleware ในทุก module
   * - Apply middleware ที่เดียว ใช้ได้ทั้ง project
   * - ง่ายต่อการจัดการ middleware ส่วนกลาง
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Apply กับทุก routes (wildcard)
  }
}
