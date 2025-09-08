import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TradingService } from './trading.service';

@Controller('api/trading')
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post('buy')
  async buyToken(@Body() body: {
    tokenMint: string;
    amount: number;
    slippage: number;
    walletAddress: string;
  }) {
    return this.tradingService.buyToken(body);
  }

  @Post('sell')
  async sellToken(@Body() body: {
    tokenMint: string;
    amount: number;
    slippage: number;
    walletAddress: string;
  }) {
    return this.tradingService.sellToken(body);
  }

  @Get('quote')
  async getQuote(
    @Query('tokenMint') tokenMint: string,
    @Query('amount') amount: string,
    @Query('isBuy') isBuy: string,
  ) {
    return this.tradingService.getQuote(
      tokenMint,
      parseFloat(amount),
      isBuy === 'true'
    );
  }
}