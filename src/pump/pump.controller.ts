import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PumpService } from './pump.service';
import { CreateTokenDto, SellTokenDto } from './dto/pump.dto';

@Controller('pump')
export class PumpController {
  constructor(private readonly pumpService: PumpService) {}

  /**
   * API endpoint to create a new token on Pump.fun.
   * @param createTokenDto Data Transfer Object containing token details.
   * @returns Transaction ID if successful.
   */
  @Post('create-token')
  async createToken(@Body() createTokenDto: CreateTokenDto) {
    try {
      const txId = await this.pumpService.createToken(createTokenDto);
      return {
        message: 'Token creation transaction sent successfully',
        transactionId: txId,
      };
    } catch (error) {
      console.error('Error creating token:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to create token',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
     * API endpoint to buy a token on Pump.fun.
     * @param buyTokenDto Data Transfer Object containing token and amount details.
     * @returns Transaction ID if successful.
     */
    @Post('buy-token')
    async buyToken(@Body() buyTokenDto: import('./dto/pump.dto').BuyTokenDto) {
      try {
        const txId = await this.pumpService.buyToken(buyTokenDto);
        return {
          message: 'Token buy transaction sent successfully',
          transactionId: txId,
        };
      } catch (error) {
        console.error('Error buying token:', error);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: error.message || 'Failed to buy token',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

  /**
   * API endpoint to sell a token on Pump.fun.
   * @param sellTokenDto Data Transfer Object containing token and amount details.
   * @returns Transaction ID if successful.
   */
  @Post('sell-token')
  async sellToken(@Body() sellTokenDto: SellTokenDto) {
    try {
      const txId = await this.pumpService.sellToken(sellTokenDto);
      return {
        message: 'Token sell transaction sent successfully',
        transactionId: txId,
      };
    } catch (error) {
      console.error('Error selling token:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to sell token',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Placeholder for getting token information.
   * Pump.fun SDK might not directly provide a "get token info" method,
   * you'd typically use Solana's web3.js for this (e.g., getAccountInfo).
   * @param mintAddress The public key of the token mint.
   * @returns Basic token info (placeholder).
   */
  @Get('token-info/:mintAddress')
  async getTokenInfo(@Param('mintAddress') mintAddress: string) {
    try {
      // In a real application, you'd use @solana/web3.js to fetch token data
      // For example:
      // const tokenInfo = await this.pumpService.getTokenInfo(mintAddress);
      return {
        message: `Placeholder for token info for ${mintAddress}`,
        mintAddress: mintAddress,
        // Add actual token data here
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to retrieve token info',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO: Add more Pump.fun instruction endpoints here,
  // e.g., burn, mint (if applicable to pump.fun's specific token lifecycle),
  // update authority, etc., based on the @pump-fun/sdk capabilities.
}