import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * AuthController - จัดการ endpoints ที่เกี่ยวกับ authentication
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * สมัครสมาชิกใหม่
   *
   * Request Body:
   * {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "password": "password123",
   *   "age": 25
   * }
   *
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": {
   *     "id": 1,
   *     "name": "John Doe",
   *     "email": "john@example.com",
   *     "age": 25
   *   }
   * }
   */
  @Post('register')
  @ApiOperation({ summary: 'สมัครสมาชิกใหม่' })
  @ApiResponse({
    status: 201,
    description: 'สมัครสมาชิกสำเร็จ และได้รับ JWT token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          age: 25
        }
      }
    }
  })
  @ApiResponse({ status: 409, description: 'Email นี้ถูกใช้งานแล้ว' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * เข้าสู่ระบบ
   *
   * Request Body:
   * {
   *   "email": "john@example.com",
   *   "password": "password123"
   * }
   *
   * Response:
   * {
   *   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *   "user": {
   *     "id": 1,
   *     "name": "John Doe",
   *     "email": "john@example.com",
   *     "age": 25
   *   }
   * }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)  // บังคับให้ส่ง status 200 แทน 201
  @ApiOperation({ summary: 'เข้าสู่ระบบ' })
  @ApiResponse({
    status: 200,
    description: 'เข้าสู่ระบบสำเร็จ และได้รับ JWT token',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          age: 25
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Email หรือ Password ไม่ถูกต้อง' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/profile
   * ดึงข้อมูล profile ของ user ที่ login อยู่
   * ต้องส่ง JWT token มาใน Authorization header
   *
   * Request Header:
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * Response:
   * {
   *   "id": 1,
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "age": 25,
   *   "createdAt": "2024-01-01T00:00:00.000Z"
   * }
   */
  @UseGuards(JwtAuthGuard)  // ป้องกัน route นี้ด้วย JWT
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ดึงข้อมูล Profile ของผู้ใช้ที่ login อยู่' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูล Profile สำเร็จ',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'ไม่มี Token หรือ Token ไม่ถูกต้อง' })
  getProfile(@Request() req) {
    // req.user มาจาก JwtStrategy.validate()
    return req.user;
  }

  /**
   * POST /auth/logout
   * ออกจากระบบ
   * ต้องส่ง JWT token มาใน Authorization header
   *
   * Request Header:
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *
   * Response:
   * {
   *   "message": "Logged out successfully"
   * }
   *
   * หลังจาก logout:
   * - Token จะถูกเพิ่มเข้า blacklist
   * - Token นี้จะไม่สามารถใช้งานได้อีกต่อไป
   * - การเรียก API ที่ต้องใช้ token นี้จะถูกปฏิเสธ (401 Unauthorized)
   */
  @UseGuards(JwtAuthGuard)  // ต้อง login ก่อนถึงจะ logout ได้
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'ออกจากระบบ' })
  @ApiResponse({
    status: 200,
    description: 'ออกจากระบบสำเร็จ',
    schema: {
      example: {
        message: 'Logged out successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'ไม่มี Token หรือ Token ไม่ถูกต้อง' })
  async logout(@Request() req) {
    // ดึง token จาก Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return { message: 'No token provided' };
    }

    // ดึง user id จาก req.user (มาจาก JwtStrategy)
    const userId = req.user.id;

    // เพิ่ม token เข้า blacklist
    await this.authService.logout(token, userId);

    return {
      message: 'Logged out successfully',
    };
  }
}
