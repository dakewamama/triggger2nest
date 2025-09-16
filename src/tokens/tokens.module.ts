import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

@Module({
  imports: [HttpModule], 
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}