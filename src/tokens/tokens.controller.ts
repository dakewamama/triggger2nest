import { Controller, Get, Post, Body, Param, Query, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { TokensService } from './tokens.service';

export interface PumpFunToken {
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  price?: number;
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website?: string;
  telegram?: string;
  twitter?: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  market_cap: number;
  reply_count: number;
  last_reply: number;
  nsfw: boolean;
  market_id?: string;
  inverted?: boolean;
  is_currently_live: boolean;
  king_of_the_hill_timestamp?: number;
  show_name: boolean;
  last_trade_timestamp: number;
  usd_market_cap: number;
}

@Controller('tokens')
export class TokensController {
  private readonly logger = new Logger(TokensController.name);

  constructor(private readonly tokensService: TokensService) {}

  @Get('health')
  getHealth() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'tokens'
    };
  }

  @Get('trending')
  async getTrendingTokens(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      this.logger.log(`Fetching trending tokens with limit: ${limit || 50}, offset: ${offset || 0}`);
      
      const tokens = await this.tokensService.getTrendingTokens({
        limit: limit || 50,
        offset: offset || 0,
      });

      return {
        success: true,
        data: tokens,
        count: tokens.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching trending tokens:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch trending tokens',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async searchTokens(@Query('q') query: string) {
    try {
      if (!query || query.trim().length === 0) {
        throw new HttpException('Query parameter is required', HttpStatus.BAD_REQUEST);
      }

      this.logger.log(`Searching tokens with query: ${query}`);
      const tokens = await this.tokensService.searchTokens(query);

      return {
        success: true,
        data: tokens,
        query,
        count: tokens.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error searching tokens:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to search tokens',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':mintAddress')
  async getTokenDetails(@Param('mintAddress') mintAddress: string) {
    try {
      this.logger.log(`Fetching token details for: ${mintAddress}`);
      
      const token = await this.tokensService.getTokenByMint(mintAddress);
      
      if (!token) {
        throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        data: token,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error fetching token ${mintAddress}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch token details',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  async getMarketOverview() {
    try {
      this.logger.log('Fetching market overview');
      
      const stats = await this.tokensService.getMarketStats();
      
      return {
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error fetching market overview:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch market overview',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}