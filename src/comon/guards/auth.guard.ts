import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // ตัวอย่างง่าย ๆ: ตรวจว่าใน header มี key ชื่อ 'auth' หรือไม่
    const authHeader = request.headers['auth'];
    if (authHeader === 'secret123') {
      return true; // อนุญาตให้ผ่าน
    }
    return false; // ปฏิเสธการเข้าถึง
  }
}
