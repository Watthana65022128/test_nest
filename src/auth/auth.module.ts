import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { TokenBlacklist } from './entities/token-blacklist.entity';

/**
 * AuthModule - รวมทุกอย่างที่เกี่ยวกับ Authentication
 */
@Module({
  imports: [
    // Import TypeORM feature สำหรับ TokenBlacklist entity
    TypeOrmModule.forFeature([TokenBlacklist]),

    // Import UsersModule เพื่อใช้ UsersService
    UsersModule,

    // Import PassportModule สำหรับ authentication strategies
    PassportModule,

    // ตั้งค่า JWT Module
    JwtModule.register({
      // Secret key สำหรับ sign และ verify JWT
      // ในการใช้งานจริง ควรเก็บใน environment variable
      secret: 'your-secret-key-here', // TODO: ย้ายไป .env

      // ตั้งค่าเวลาหมดอายุของ token
      signOptions: {
        expiresIn: '1d', // token หมดอายุใน 1 วัน
        // อื่นๆ: '60s', '1h', '7d', '30d'
      },
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
