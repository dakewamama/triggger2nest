import { Controller, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('api/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':address/balance')
  async getBalance(@Param('address') address: string) {
    const balance = await this.walletService.getBalance(address);
    return { address, balance };
  }
}
