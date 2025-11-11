import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

/**
 * AuthModule - รวมทุกอย่างที่เกี่ยวกับ Authentication
 */
@Module({
  imports: [
    // Import UsersModule เพื่อใช้ UsersService
    UsersModule,

    // Import PassportModule สำหรับ authentication strategies
    PassportModule,

    // ตั้งค่า JWT Module แบบ async เพื่อให้ ConfigService โหลดก่อน
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'default-secret-key',
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],

  // Controllers ที่ใช้ใน module นี้
  controllers: [AuthController],

  // Providers (Services, Strategies) ที่ใช้ใน module นี้
  providers: [
    AuthService,    // Business logic สำหรับ auth
    JwtStrategy,    // Strategy สำหรับ verify JWT
  ],

  // Export AuthService ถ้า module อื่นต้องการใช้
  exports: [AuthService],
})
export class AuthModule {
  // ไม่ต้อง configure middleware ที่นี่แล้ว
  // เพราะ AppModule จัดการให้แบบ global แล้ว
}
