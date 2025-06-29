import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

/**
 * DTO for creating a new token.
 */
export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

/**
 * DTO for buying tokens.
 */
export class BuyTokenDto {
  @IsString()
  @IsNotEmpty()
  mintAddress: string;

  @IsNumber()
  @Min(0.000000001) // Smallest possible amount to ensure it's positive
  amountSol: number; // Required for buying
}

/**
 * DTO for selling tokens.
 */
export class SellTokenDto {
  @IsString()
  @IsNotEmpty()
  mintAddress: string;

  @IsNumber()
  @Min(0.000000001) // Smallest possible amount to ensure it's positive
  amountTokens: number; // Required for selling
}