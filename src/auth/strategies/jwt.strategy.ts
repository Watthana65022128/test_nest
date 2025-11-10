import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

/**
 * JWT Strategy - ใช้ตรวจสอบ JWT token ที่ส่งมากับ request
 *
 * ขั้นตอนการทำงาน:
 * 1. ดึง JWT token จาก Header (Authorization: Bearer <token>)
 * 2. Verify token ด้วย secret key
 * 3. Extract payload จาก token
 * 4. เรียก validate() method เพื่อตรวจสอบและดึงข้อมูล user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // ดึง JWT จาก Authorization header แบบ Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // ห้าม ignore token ที่หมดอายุ (ถ้า true = ยอมรับ token หมดอายุ)
      ignoreExpiration: false,

      // Secret key สำหรับ verify token (อ่านจาก environment variable)
      secretOrKey: process.env.JWT_SECRET || 'default-secret-key',
    });
  }

  /**
   * Method นี้จะถูกเรียกอัตโนมัติหลังจาก token ถูก verify แล้ว
   *
   * @param payload - ข้อมูลที่ decode จาก JWT token
   * @returns User object ที่จะถูกแนบเข้ากับ request.user
   *
   * ขั้นตอน:
   * 1. ดึงข้อมูล user จาก payload
   * 2. Return user object เพื่อแนบเข้ากับ request.user
   */
  async validate(payload: any) {
    // payload จะมี: { sub: userId, email: userEmail, iat: issuedAt, exp: expiresAt }
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException();
    }

    // ค่าที่ return จะถูกแนบเข้ากับ request.user
    return user;
  }
}
