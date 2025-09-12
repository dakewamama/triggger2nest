import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): any {
    return {
      message: this.appService.getHello(),
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        pump: '/pump',
        tokens: '/tokens',
        wallet: '/wallet',
        trading: '/trading',
      },
    };
  }

  @Get('health')
  getHealth(): any {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'pump-fun-backend',
      version: '1.0.0',
    };
  }
}