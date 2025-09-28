import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PumpController } from './pump.controller';
import { PumpService } from './pump.service';
import { PumpDirectService } from './pump-direct.service';

@Module({
  imports: [ConfigModule],
  controllers: [PumpController],
  providers: [PumpService, PumpDirectService],
  exports: [PumpService, PumpDirectService],
})
export class PumpModule {}