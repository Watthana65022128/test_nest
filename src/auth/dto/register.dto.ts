import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: 'ชื่อผู้ใช้',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ' })
  @IsString({ message: 'ชื่อต้องเป็นข้อความ' })
  @MinLength(2, { message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' })
  @MaxLength(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'อีเมล์ของผู้ใช้ (ต้องเป็นรูปแบบอีเมล์ที่ถูกต้อง)',
    example: 'john@example.com',
  })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล์' })
  @IsEmail({}, { message: 'รูปแบบอีเมล์ไม่ถูกต้อง' })
  @MaxLength(255, { message: 'อีเมล์ต้องไม่เกิน 255 ตัวอักษร' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: `รหัสผ่าน (มาตรฐานความปลอดภัย):
- ความยาวอย่างน้อย 8 ตัวอักษร
- มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)
- มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว (a-z)
- มีตัวเลขอย่างน้อย 1 ตัว (0-9)
- มีอักขระพิเศษอย่างน้อย 1 ตัว (!@#$%^&*...)`,
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @IsString({ message: 'รหัสผ่านต้องเป็นข้อความ' })
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  @MaxLength(128, { message: 'รหัสผ่านต้องไม่เกิน 128 ตัวอักษร' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'รหัสผ่านต้องประกอบด้วย: ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ (@$!%*?&)',
    },
  )
  password: string;

  @ApiProperty({
    description: 'อายุของผู้ใช้ (ไม่บังคับ, ต้องอยู่ระหว่าง 1-150 ปี)',
    example: 25,
    required: false,
    minimum: 1,
    maximum: 150,
  })
  @IsOptional()
  @IsNumber({}, { message: 'อายุต้องเป็นตัวเลข' })
  @Min(1, { message: 'อายุต้องมากกว่า 0' })
  @Max(150, { message: 'อายุต้องไม่เกิน 150' })
  age?: number;
}
