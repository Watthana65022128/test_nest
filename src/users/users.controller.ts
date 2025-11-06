import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
   * ดูรายการ users ทั้งหมด (เฉพาะที่ยังไม่ถูกลบ)
   */
  @Get()
  @ApiOperation({ summary: 'ดูรายการ Users ทั้งหมด' })
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
          createdAt: '2024-01-01T00:00:00.000Z'
        },
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'ไม่มี Token หรือ Token ไม่ถูกต้อง' })
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
