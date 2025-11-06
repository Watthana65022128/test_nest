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

      // Secret key สำหรับ verify token (ควรเก็บใน environment variable)
      secretOrKey: 'your-secret-key-here', // TODO: ย้ายไป .env

      // Pass request object เข้า validate() method
      // เพื่อให้เข้าถึง headers และดึง token ออกมาตรวจสอบ blacklist
      passReqToCallback: true,
    });
  }

  /**
   * Method นี้จะถูกเรียกอัตโนมัติหลังจาก token ถูก verify แล้ว
   *
   * @param req - Request object (เพราะเรา set passReqToCallback: true)
   * @param payload - ข้อมูลที่ decode จาก JWT token
   * @returns User object ที่จะถูกแนบเข้ากับ request.user
   *
   * ขั้นตอน:
   * 1. ดึง token จาก Authorization header
   * 2. ตรวจสอบว่า token อยู่ใน blacklist หรือไม่
   * 3. ถ้าอยู่ใน blacklist = ปฏิเสธ
   * 4. ถ้าไม่อยู่ใน blacklist = ดึงข้อมูล user และ allow
   */
  async validate(req: any, payload: any) {
    // ดึง token จาก Authorization header
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // ตรวจสอบว่า token อยู่ใน blacklist หรือไม่
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);

    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked (logged out)');
    }

    // payload จะมี: { sub: userId, email: userEmail, iat: issuedAt, exp: expiresAt }
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException();
    }

    // ค่าที่ return จะถูกแนบเข้ากับ request.user
    return user;
  }
}
