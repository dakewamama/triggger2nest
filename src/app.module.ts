import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';  // Comment this line
import { TokensModule } from './tokens/tokens.module';
import { WalletModule } from './wallet/wallet.module';
import { TradingModule } from './trading/trading.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRoot({                    // Comment out this entire block
    //   type: 'postgres',
    //   url: process.env.DATABASE_URL,
    //   autoLoadEntities: true,
    //   synchronize: process.env.NODE_ENV === 'development',
    //   logging: process.env.NODE_ENV === 'development',
    // }),
    TokensModule,
    WalletModule,
    TradingModule,
  ],
})
export class AppModule {}