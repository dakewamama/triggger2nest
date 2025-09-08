import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Basic root endpoint
  app.use('/', (req, res, next) => {
    if (req.path === '/' && req.method === 'GET') {
      res.json({ 
        message: 'Pump Fun API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          tokens: '/api/tokens',
          wallet: '/api/wallet',
          trading: '/api/trading'
        }
      });
    } else {
      next();
    }
  });

  // Proxy for pump.fun API to avoid CORS issues
  app.use('/proxy/pump-fun', createProxyMiddleware({
    target: 'https://frontend-api.pump.fun',
    changeOrigin: true,
    pathRewrite: {
      '^/proxy/pump-fun': '',
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add any necessary headers
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error', message: err.message });
    },
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📌 Health check: http://localhost:${port}/health`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
