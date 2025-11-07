import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { TokenBlacklist } from './entities/token-blacklist.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepository: Repository<TokenBlacklist>,
  ) {}

  /**
   * สมัครสมาชิกใหม่
   * 1. ตรวจสอบว่า email ซ้ำหรือไม่
   * 2. สร้าง user ใหม่ (password จะถูก hash ใน UsersService)
   * 3. สร้าง JWT token
   */
  async register(registerDto: RegisterDto) {
    // ตรวจสอบว่า email ซ้ำหรือไม่
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // สร้าง user ใหม่
    const user = await this.usersService.create(registerDto);

    // สร้าง JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    };
  }

  /**
   * เข้าสู่ระบบ
   * 1. ค้นหา user จาก email
   * 2. ตรวจสอบรหัสผ่าน
   * 3. สร้าง JWT token
   */
  async login(loginDto: LoginDto) {
    // ค้นหา user จาก email (ดึง password มาด้วย)
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // สร้าง JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    };
  }

  /**
   * ตรวจสอบและดึงข้อมูล user จาก JWT payload
   * ใช้โดย JWT Strategy
   */
  async validateUser(payload: any): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  /**
   * Logout - เพิ่ม token เข้า blacklist
   *
   * @param token - JWT token ที่ต้องการ logout
   * @param userId - User ID จาก token payload
   *
   * ขั้นตอน:
   * 1. Decode token เพื่อดึง expiration time
   * 2. บันทึก token เข้า blacklist พร้อม expiration time
   * 3. Token นี้จะไม่สามารถใช้งานได้อีกต่อไป
   */
  async logout(token: string, userId: number): Promise<void> {
    // Decode token เพื่อดึง payload (ไม่ verify เพราะเราแค่ต้องการ exp)
    const decoded = this.jwtService.decode(token) as any;

    if (!decoded || !decoded.exp) {
      throw new UnauthorizedException('Invalid token');
    }

    // แปลง exp (unix timestamp) เป็น Date object
    const expiresAt = new Date(decoded.exp * 1000);

    // บันทึก token เข้า blacklist
    const blacklistedToken = this.tokenBlacklistRepository.create({
      token,
      userId,
      expiresAt,
    });

    await this.tokenBlacklistRepository.save(blacklistedToken);
  }

  /**
   * ตรวจสอบว่า token อยู่ใน blacklist หรือไม่
   *
   * @param token - JWT token ที่ต้องการตรวจสอบ
   * @returns true ถ้าอยู่ใน blacklist, false ถ้าไม่อยู่
   *
   * ใช้โดย JwtStrategy ก่อนที่จะอนุญาตให้เข้าถึง protected routes
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });

    return !!blacklisted; // แปลงเป็น boolean
  }

  /**
   * ลบ tokens ที่หมดอายุแล้วออกจาก blacklist
   * ควรเรียกใช้ผ่าน cron job เป็นระยะ
   *
   * เช่น: ทุก ๆ 24 ชั่วโมง
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.tokenBlacklistRepository
      .createQueryBuilder()
      .delete()
      .from(TokenBlacklist)
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
