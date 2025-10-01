// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  const configService = app.get(ConfigService);
  
  logger.log('🚀 Starting Pump.fun Trading Bot Backend...');
  
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', 
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  logger.log('✅ CORS enabled for frontend origins');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  const port = 8000;
  
  await app.listen(port, '0.0.0.0');
  
  logger.log('');
  logger.log('='.repeat(60));
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📍 Health check: http://localhost:${port}/health`);
  logger.log(`📍 Pump API: http://localhost:${port}/pump/health`);
  logger.log(`📍 Buy Token: http://localhost:${port}/pump/buy-token`);
  logger.log(`📍 Sell Token: http://localhost:${port}/pump/sell-token`);
  logger.log(`📍 Tokens API: http://localhost:${port}/tokens/trending`);
  logger.log(`🌐 CORS enabled for: http://localhost:5173`);
  logger.log(`⚡ Network: ${configService.get('SOLANA_NETWORK') || 'mainnet-beta'}`);
  logger.log('='.repeat(60));
  logger.log('');
}

bootstrap().catch(err => {
  console.error('💥 Failed to start application:', err);
  process.exit(1);
});