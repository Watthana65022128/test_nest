# คู่มือการใช้งาน Role-Based Access Control (RBAC)

## สรุปการทำงาน

ระบบมี 2 Roles:
- `ADMIN` - ผู้ดูแลระบบ (สร้างผ่าน Seed เท่านั้น)
- `MEMBER` - สมาชิกทั่วไป (ได้จากการ register)

## ข้อมูล Admin User (จาก Seed)

```
Email: admin@example.com
Password: Admin@123456
Role: admin
```

## วิธีการใช้งาน Roles Guard

### 1. Import ที่จำเป็น

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
```

### 2. ใช้งานใน Controller

#### ตัวอย่าง: Endpoint สำหรับ Admin เท่านั้น

```typescript
@Get('admin-only')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
async adminOnlyEndpoint() {
  return { message: 'This is admin only endpoint' };
}
```

#### ตัวอย่าง: Endpoint สำหรับทั้ง Admin และ Member

```typescript
@Get('all-users')
@Roles(UserRole.ADMIN, UserRole.MEMBER)
@UseGuards(JwtAuthGuard, RolesGuard)
async allUsersEndpoint() {
  return { message: 'This endpoint allows both admin and member' };
}
```

#### ตัวอย่าง: Endpoint ไม่ต้องตรวจสอบ Role (แค่ login)

```typescript
@Get('authenticated-only')
@UseGuards(JwtAuthGuard)
async authenticatedOnlyEndpoint() {
  return { message: 'Any authenticated user can access' };
}
```

## การทดสอบ API

### 1. Register User ใหม่ (ได้ role = MEMBER)

```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "age": 25
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "role": "member"  // ← role เป็น member
  }
}
```

### 2. Login ด้วย Admin

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123456"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "age": 30,
    "role": "admin"  // ← role เป็น admin
  }
}
```

### 3. ทดสอบเข้าถึง Admin-only Endpoint

```bash
# ใช้ Admin Token - ✅ สำเร็จ
GET http://localhost:3000/users
Authorization: Bearer <admin_token>

# Response: 200 OK
[
  {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "age": 30,
    "role": "admin",
    ...
  },
  ...
]
```

```bash
# ใช้ Member Token - ❌ ไม่มีสิทธิ์
GET http://localhost:3000/users
Authorization: Bearer <member_token>

# Response: 403 Forbidden
```

## สิ่งที่ได้สร้าง

### 1. Roles Decorator
`src/auth/decorators/roles.decorator.ts` - ใช้กำหนด role ที่อนุญาต

### 2. Roles Guard
`src/auth/guards/roles.guard.ts` - ตรวจสอบว่า user มี role ที่ถูกต้องหรือไม่

### 3. User Entity (อัพเดท)
`src/users/entities/user.entity.ts` - เพิ่ม role column

### 4. Migration
`src/database/migrations/1699999999999-AddRoleToUser.ts` - เพิ่ม role column ใน database

### 5. Seed
`src/database/seeds/admin.seed.ts` - สร้าง admin user

### 6. UsersService (อัพเดท)
`src/users/users.service.ts` - บังคับให้ register ได้ role = MEMBER เท่านั้น

## หมายเหตุสำคัญ

1. **RolesGuard ต้องใช้ร่วมกับ JwtAuthGuard เสมอ**
   - JwtAuthGuard ดึง user มาเก็บใน request
   - RolesGuard ตรวจสอบ role จาก user object

2. **ลำดับการเขียน Decorator สำคัญ**
   ```typescript
   @Roles(UserRole.ADMIN)        // ← เขียนก่อน
   @UseGuards(JwtAuthGuard, RolesGuard)  // ← เขียนทีหลัง
   ```

3. **Admin สร้างได้ผ่าน Seed เท่านั้น**
   - ไม่สามารถสร้าง admin ผ่าน register API ได้
   - UsersService.create() บังคับให้ role = MEMBER

4. **Role จะถูก return ใน response**
   - Register และ Login จะ return role ของ user
   - ใช้สำหรับแสดงผลใน frontend
