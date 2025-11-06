# API Usage Guide

## สรุปการใช้งาน API

### 1. สมัครสมาชิก (Register)
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 25
  }'
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25
    }
  }
}
```

---

### 2. เข้าสู่ระบบ (Login)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25
    }
  }
}
```

---

### 3. ดูข้อมูล Profile ของตัวเอง (ต้อง login)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "createdAt": "2025-11-06T07:00:00.000Z",
    "deletedAt": null
  }
}
```

---

### 4. ดูรายการ Users ทั้งหมด (ต้อง login)
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "status": "ok",
  "result": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 25,
      "createdAt": "2025-11-06T07:00:00.000Z",
      "deletedAt": null
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "age": 30,
      "createdAt": "2025-11-06T08:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

---

### 5. ดูข้อมูล User ตาม ID (ต้อง login)
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "createdAt": "2025-11-06T07:00:00.000Z",
    "deletedAt": null
  }
}
```

---

### 6. ออกจากระบบ (Logout)
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "status": "ok",
  "result": {
    "message": "Logged out successfully"
  }
}
```

---

## สิ่งสำคัญที่ต้องจำ

### ✅ Endpoints ที่ไม่ต้อง login:
- `POST /auth/register` - สมัครสมาชิก
- `POST /auth/login` - เข้าสู่ระบบ

### 🔒 Endpoints ที่ต้อง login (ต้องส่ง Authorization header):
- `GET /auth/profile` - ดูข้อมูลตัวเอง
- `POST /auth/logout` - ออกจากระบบ
- `GET /users` - ดูรายการ users ทั้งหมด
- `GET /users/:id` - ดูข้อมูล user ตาม id

### การส่ง Authorization Header:
```bash
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

โดย `YOUR_ACCESS_TOKEN` คือ token ที่ได้จากการ register หรือ login

---

## ตัวอย่างการใช้งานแบบต่อเนื่อง

```bash
# 1. Register และเก็บ token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"pass123","age":20}' \
  | jq -r '.result.access_token')

# 2. ใช้ token เพื่อดูรายการ users
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $TOKEN"

# 3. ใช้ token เพื่อดู profile
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Responses

### 401 Unauthorized (ไม่มี token หรือ token ไม่ถูกต้อง)
```json
{
  "success": false,
  "timestamp": "2025-11-06T07:00:00.000Z",
  "path": "/users",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 409 Conflict (Email ซ้ำ)
```json
{
  "success": false,
  "timestamp": "2025-11-06T07:00:00.000Z",
  "path": "/auth/register",
  "statusCode": 409,
  "message": "Email already exists"
}
```

### 400 Bad Request (ข้อมูลไม่ครบ)
```json
{
  "success": false,
  "timestamp": "2025-11-06T07:00:00.000Z",
  "path": "/auth/register",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be an email",
    "password should not be empty"
  ]
}
```
