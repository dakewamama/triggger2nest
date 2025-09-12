import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TokensModule } from './tokens/tokens.module';
import { WalletModule } from './wallet/wallet.module';
import { TradingModule } from './trading/trading.module';
import { PumpModule } from './pump/pump.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MulterModule.register({
      dest: './uploads',
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    PumpModule,      // Main pump.fun operations
    TokensModule,    // Token data and listings
    WalletModule,    // Wallet utilities
    TradingModule,   // Trading operations
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}