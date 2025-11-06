import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard - ใช้ป้องกัน route ที่ต้องการ authentication
 *
 * วิธีใช้งาน:
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * getProfile(@Request() req) {
 *   return req.user; // user ที่ได้จาก JWT Strategy
 * }
 *
 * การทำงาน:
 * 1. ตรวจสอบว่ามี JWT token ใน Authorization header หรือไม่
 * 2. เรียก JwtStrategy เพื่อ verify token
 * 3. ถ้า verify สำเร็จ = อนุญาตให้เข้าถึง route
 * 4. ถ้า verify ไม่สำเร็จ = return 401 Unauthorized
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // AuthGuard('jwt') จะเรียกใช้ strategy ที่ชื่อ 'jwt'
  // ซึ่งคือ JwtStrategy ที่เราสร้างไว้
}
