import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PumpService } from './pump.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { BuyTokenDto } from './dto/buy-token.dto';
import { SellTokenDto } from './dto/sell-token.dto';

@Controller('pump')
export class PumpController {
  constructor(private readonly pumpService: PumpService) {}

  @Post('create-token')
  @UseInterceptors(FileInterceptor('image'))
  async createToken(
    @Body() createTokenDto: CreateTokenDto,
    @UploadedFile() file?: any,
  ) {
    return this.pumpService.createToken(createTokenDto, file);
  }

  @Get('health')
  async healthCheck() {
    return this.pumpService.healthCheck();
  }

  @Post('buy-token')
  async buyToken(@Body() buyTokenDto: BuyTokenDto) {
    return this.pumpService.buyToken(buyTokenDto);
  }

  @Post('sell-token')
  async sellToken(@Body() sellTokenDto: SellTokenDto) {
    return this.pumpService.sellToken(sellTokenDto);
  }

  @Get('token-info/:mintAddress')
  async getTokenInfo(@Param('mintAddress') mintAddress: string) {
    return this.pumpService.getTokenInfo(mintAddress);
  }

  @Get('quote/:mint')
  async getQuote(
    @Param('mint') mint: string,
    @Query('amount') amount: number,
    @Query('action') action: 'buy' | 'sell',
  ) {
    return this.pumpService.getQuote(mint, Number(amount), action);
  }

  @Get('wallet/:address/balances')
  async getWalletBalances(@Param('address') address: string) {
    return {
      success: true,
      data: {
        solBalance: 0,
        tokenBalances: [],
        portfolioValue: 0
      }
    };
  }

  @Get('wallet/:address/transactions')
  async getWalletTransactions(
    @Param('address') address: string,
    @Query('limit') limit = 50
  ) {
    return {
      success: true,
      data: []
    };
  }
}