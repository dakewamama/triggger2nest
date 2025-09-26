// src/main.ts - Fixed CORS configuration
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get config service
  const configService = app.get(ConfigService);
  
  // IMPORTANT: Enable CORS for frontend - MUST be before other middleware
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set port to 8000
  const port = 8000;
  
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
  console.log(`📍 Tokens API: http://localhost:${port}/tokens`);
  console.log(`📍 CORS enabled for: http://localhost:5173`);
}

bootstrap();