import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Users Controller
 *
 * จัดการ endpoints สำหรับดูข้อมูล users เท่านั้น
 * การสร้าง user ใหม่ทำได้ผ่าน /auth/register เท่านั้น
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard) // ต้อง login ก่อนถึงจะดูข้อมูล users ได้
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * ดูรายการ users ทั้งหมด (เฉพาะ ADMIN เท่านั้น)
   */
  @Get()
  @Roles(UserRole.ADMIN) // เฉพาะ Admin เท่านั้น
  @UseGuards(JwtAuthGuard, RolesGuard) // ต้องใช้ทั้ง JwtAuthGuard และ RolesGuard
  @ApiOperation({ summary: 'ดูรายการ Users ทั้งหมด (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'ดึงรายการ users สำเร็จ',
    schema: {
      example: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
          role: 'member',
          createdAt: '2024-01-01T00:00:00.000Z'
        },
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'ไม่มี Token หรือ Token ไม่ถูกต้อง' })
  @ApiResponse({ status: 403, description: 'ไม่มีสิทธิ์เข้าถึง (ต้องเป็น Admin)' })
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * GET /users/:id
   * ดูข้อมูล user ตาม id
   * @throws NotFoundException (404) ถ้าไม่พบ user
   */
  @Get(':id')
  @ApiOperation({ summary: 'ดูข้อมูล User ตาม ID' })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูล user สำเร็จ',
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
  @ApiResponse({ status: 404, description: 'ไม่พบ User ที่มี ID นี้' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(Number(id));
  }
}
