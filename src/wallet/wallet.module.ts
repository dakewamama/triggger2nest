import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [ConfigModule],
  controllers: [WalletController],
  providers: [WalletService, PortfolioService],
  exports: [WalletService, PortfolioService],
})
export class WalletModule {}