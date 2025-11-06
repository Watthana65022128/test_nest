import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'อีเมล์ของผู้ใช้',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
