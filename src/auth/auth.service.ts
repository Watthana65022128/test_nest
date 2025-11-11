import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
      throw new UnauthorizedException('ไม่พบข้อมูลผู้ใช้');
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('รหัสผ่านไม่ถูกต้อง');
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
    console.log(payload)
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

}
