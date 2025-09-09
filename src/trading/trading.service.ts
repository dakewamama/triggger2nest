import { Injectable } from '@nestjs/common';

@Injectable()
export class TradingService {
  async buyToken(params: any) {
    return {
      success: true,
      message: 'Buy transaction prepared',
      tokenMint: params.tokenMint,
      amount: params.amount,
    };
  }

  async sellToken(params: any) {
    return {
      success: true,
      message: 'Sell transaction prepared',
      tokenMint: params.tokenMint,
      amount: params.amount,
    };
  }
}
