import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'ชื่อผู้ใช้',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'อีเมล์ของผู้ใช้',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'รหัสผ่าน (ต้องมีอย่างน้อย 6 ตัวอักษร)',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'อายุของผู้ใช้ (ไม่บังคับ)',
    example: 25,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  age?: number;
}
