import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[Logger] ${req.method} ${req.originalUrl}`);
    next(); // <-- ต้องเรียก next() เพื่อให้ไปต่อ controller
  }
}
