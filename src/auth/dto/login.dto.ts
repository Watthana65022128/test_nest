import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    description: 'อีเมล์ของผู้ใช้',
    example: 'john@example.com',
  })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล์' })
  @IsEmail({}, { message: 'รูปแบบอีเมล์ไม่ถูกต้อง' })
  @MaxLength(255, { message: 'อีเมล์ต้องไม่เกิน 255 ตัวอักษร' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'รหัสผ่าน',
    example: 'SecurePass123!',
  })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MaxLength(128, { message: 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร' })
  password: string;
}
