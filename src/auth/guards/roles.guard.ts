import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Roles Guard
 *
 * ใช้สำหรับตรวจสอบว่า user มีสิทธิ์ในการเข้าถึง endpoint หรือไม่
 * ทำงานร่วมกับ @Roles() decorator
 *
 * วิธีใช้งาน:
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async someAdminOnlyMethod() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ดึง roles ที่กำหนดไว้ใน @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // ถ้าไม่มีการกำหนด roles = อนุญาตให้เข้าถึงได้
    if (!requiredRoles) {
      return true;
    }

    // ดึง user จาก request (ถูกเพิ่มโดย JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // ตรวจสอบว่า user มี role ที่ตรงกับที่กำหนดไว้หรือไม่
    return requiredRoles.some((role) => user.role === role);
  }
}
