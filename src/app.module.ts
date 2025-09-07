import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PumpModule } from './pump/pump.module';
import { TokensModule } from './tokens/tokens.module';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    PumpModule,      
    TokensModule,    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}