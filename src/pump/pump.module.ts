import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PumpController } from './pump.controller';
import { PumpService } from './pump.service';
import { PumpDirectService } from './pump-direct.service';
import { PumpIdlService } from './pump-idl.service';

@Module({
  imports: [ConfigModule],
  controllers: [PumpController],
  providers: [
    PumpService, 
    PumpDirectService,
    PumpIdlService, 
  ],
  exports: [
    PumpService, 
    PumpDirectService,
    PumpIdlService, 
  ],
})
export class PumpModule {}