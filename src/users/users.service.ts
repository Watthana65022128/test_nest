import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * Users Service
 *
 * จัดการ business logic เกี่ยวกับ users
 * - การสร้าง user (ใช้โดย AuthService สำหรับการ register)
 * - การค้นหา user (findAll, findOne, findByEmail)
 * - การ validate password (ใช้โดย AuthService สำหรับการ login)
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * ค้นหา user ตาม id
   * @throws NotFoundException ถ้าไม่พบ user
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * ค้นหา user จาก email
   * ใช้โดย AuthService สำหรับการ register และ login
   */
  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'age', 'createdAt', 'deletedAt']
    });
  }

  /**
   * สร้าง user ใหม่
   * ใช้โดย AuthService สำหรับการ register เท่านั้น
   * Password จะถูก hash ก่อนบันทึกลงฐานข้อมูล
   */
  async create(userData: Partial<User>): Promise<User> {
    // Hash password ถ้ามี password ใน userData
    if (userData.password) {
      const saltRounds = 10; // จำนวนรอบในการสร้าง salt (ยิ่งมากยิ่งปลอดภัย แต่ช้ากว่า)
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  /**
   * ตรวจสอบความถูกต้องของ password
   * ใช้โดย AuthService สำหรับการ login
   *
   * @param plainPassword - รหัสผ่านที่ user กรอกเข้ามา
   * @param hashedPassword - รหัสผ่านที่ hash แล้วจากฐานข้อมูล
   * @returns true ถ้า password ตรงกัน, false ถ้าไม่ตรง
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
