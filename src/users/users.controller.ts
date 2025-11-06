import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Users Controller
 *
 * จัดการ endpoints สำหรับดูข้อมูล users เท่านั้น
 * การสร้าง user ใหม่ทำได้ผ่าน /auth/register เท่านั้น
 */
@Controller('users')
@UseGuards(JwtAuthGuard) // ต้อง login ก่อนถึงจะดูข้อมูล users ได้
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * ดูรายการ users ทั้งหมด (เฉพาะที่ยังไม่ถูกลบ)
   */
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  /**
   * GET /users/:id
   * ดูข้อมูล user ตาม id
   */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(Number(id));
  }
}
