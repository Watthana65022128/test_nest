import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ลบ properties ที่ไม่ได้กำหนดใน DTO ออกโดยอัตโนมัติ
      forbidNonWhitelisted: true, // ส่ง error ถ้ามี properties ที่ไม่ได้กำหนดใน DTO
      transform: true, // แปลง payload เป็น DTO instance โดยอัตโนมัติ
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('My NestJS API')
    .setDescription('API Documentation for my first NestJS project')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controllers
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs available at: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
