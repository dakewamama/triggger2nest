import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Serve static files from frontend build in production
  if (process.env.NODE_ENV === 'production') {
    app.useStaticAssets(join(__dirname, '..', 'frontend', 'dist'));
    app.setBaseViewsDir(join(__dirname, '..', 'frontend', 'dist'));
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 TRIGGER2NEST Backend running on: http://localhost:${port}`);
  console.log(`📡 API endpoints available at: http://localhost:${port}/api`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
}

bootstrap();
