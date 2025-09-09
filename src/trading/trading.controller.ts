import { Controller, Post, Body } from '@nestjs/common';
import { TradingService } from './trading.service';

@Controller('api/trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('buy')
  async buyToken(@Body() body: any) {
    return this.tradingService.buyToken(body);
  }

  @Post('sell')
  async sellToken(@Body() body: any) {
    return this.tradingService.sellToken(body);
  }
}
