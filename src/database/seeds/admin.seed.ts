import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // ตรวจสอบว่ามี admin อยู่แล้วหรือไม่
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  // สร้าง admin user
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = userRepository.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    age: 30,
    role: UserRole.ADMIN,
  });

  await userRepository.save(admin);
  console.log('Admin user created successfully');
  console.log('Email: admin@example.com');
  console.log('Password: Admin@123456');
}
