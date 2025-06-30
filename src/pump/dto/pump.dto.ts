import { IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateTokenDto {
  [x: string]: any;
  @IsString()
  readonly name: string;

  @IsString()
  readonly symbol: string;

  @IsOptional()
  @IsNumber()
  readonly buyAmountSol?: number;
}

export class BuyTokenDto {
  @IsString()
  readonly mintAddress: string;

  @IsNumber()
  readonly amountSol: number;
}

export class SellTokenDto {
  @IsString()
  readonly mintAddress: string;

  @IsNumber()
  readonly amountTokens: number;
}
