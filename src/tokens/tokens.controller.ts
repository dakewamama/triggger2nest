import { Controller, Get, Query, Param, Logger } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  private readonly logger = new Logger(TokensController.name);

  constructor(private readonly tokensService: TokensService) {}

  @Get('health')
  async getServiceHealth() {
    try {
      // Test the service by fetching a small number of tokens
      const result = await this.tokensService.getTrendingTokens(1, 0);
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'tokens-service',
        externalApi: {
          pumpFun: result.data.length > 0 ? 'connected' : 'limited',
          dataCount: result.data.length
        }
      };
    } catch (error) {
      this.logger.error('Tokens service health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'tokens-service',
        error: error.message
      };
    }
  }

  @Get('featured')
  async getFeaturedTokens(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    try {
      this.logger.log(`Fetching featured tokens - limit: ${limit}, offset: ${offset}`);
      
      const result = await this.tokensService.getFeaturedTokens(Number(limit), Number(offset));
      
      this.logger.log(`Returned ${result.data.length} featured tokens`);
      
      return {
        success: true,
        data: result.data,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: result.data.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch featured tokens:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch featured tokens',
        data: [],
      };
    }
  }

  @Get('trending')
  async getTrendingTokens(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    try {
      this.logger.log(`Fetching trending tokens - limit: ${limit}, offset: ${offset}`);
      
      const result = await this.tokensService.getTrendingTokens(Number(limit), Number(offset));
      
      this.logger.log(`Returned ${result.data.length} trending tokens`);
      
      return {
        success: true,
        data: result.data,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: result.data.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch trending tokens:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch trending tokens',
        data: [],
      };
    }
  }

  @Get('new')
  async getNewTokens(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    try {
      this.logger.log(`Fetching new tokens - limit: ${limit}, offset: ${offset}`);
      
      const result = await this.tokensService.getNewTokens(Number(limit), Number(offset));
      
      this.logger.log(`Returned ${result.data.length} new tokens`);
      
      return {
        success: true,
        data: result.data,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: result.data.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch new tokens:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch new tokens',
        data: [],
      };
    }
  }

  @Get('search')
  async searchTokens(@Query('q') query: string, @Query('limit') limit = 20) {
    try {
      if (!query || query.trim().length === 0) {
        return {
          success: false,
          error: 'Query parameter is required',
          data: [],
        };
      }

      this.logger.log(`Searching tokens with query: "${query}" - limit: ${limit}`);
      
      const result = await this.tokensService.searchTokens(query.trim(), Number(limit));
      
      this.logger.log(`Found ${result.data.length} tokens for query: "${query}"`);
      
      return {
        success: true,
        data: result.data,
        query: query.trim(),
        pagination: {
          limit: Number(limit),
          total: result.data.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to search tokens:', error);
      return {
        success: false,
        error: error.message || 'Failed to search tokens',
        data: [],
      };
    }
  }

  @Get(':mint')
  async getTokenByMint(@Param('mint') mint: string) {
    try {
      if (!mint || mint.trim().length === 0) {
        return {
          success: false,
          error: 'Mint address is required',
          data: null,
        };
      }

      this.logger.log(`Fetching token details for mint: ${mint}`);
      
      const result = await this.tokensService.getTokenDetails(mint.trim());
      
      if (result.data) {
        this.logger.log(`Found token: ${result.data.name || 'Unknown'}`);
        return {
          success: true,
          data: result.data,
        };
      } else {
        this.logger.log(`Token not found for mint: ${mint}`);
        return {
          success: false,
          error: 'Token not found',
          data: null,
        };
      }
    } catch (error) {
      this.logger.error(`Failed to fetch token ${mint}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to fetch token details',
        data: null,
      };
    }
  }

  @Get(':mint/trades')
  async getTokenTrades(
    @Param('mint') mint: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    try {
      if (!mint || mint.trim().length === 0) {
        return {
          success: false,
          error: 'Mint address is required',
          data: [],
        };
      }

      this.logger.log(`Fetching trades for token: ${mint} - limit: ${limit}, offset: ${offset}`);
      
      const result = await this.tokensService.getTokenTrades(mint.trim(), Number(limit), Number(offset));
      
      this.logger.log(`Found ${result.data.length} trades for token: ${mint}`);
      
      return {
        success: true,
        data: result.data,
        mint: mint.trim(),
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: result.data.length,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch trades for token ${mint}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to fetch token trades',
        data: [],
      };
    }
  }

  @Get('trades/latest')
  async getLatestTrades(@Query('limit') limit = 100) {
    try {
      this.logger.log(`Fetching latest trades - limit: ${limit}`);
      
      const result = await this.tokensService.getLatestTrades(Number(limit));
      
      this.logger.log(`Found ${result.data.length} latest trades`);
      
      return {
        success: true,
        data: result.data,
        pagination: {
          limit: Number(limit),
          total: result.data.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to fetch latest trades:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch latest trades',
        data: [],
      };
    }
  }

  @Get('stats/market')
  async getMarketStats() {
    try {
      this.logger.log('Fetching market statistics');
      
      const result = await this.tokensService.getMarketStats();
      
      this.logger.log('Market stats calculated successfully');
      
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Failed to fetch market stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch market stats',
        data: {
          totalMarketCap: 0,
          totalVolume24h: 0,
          activeTokens: 0,
          successfulGraduations: 0,
          totalTokens: 0,
        },
      };
    }
  }

  @Get('price/sol')
  async getSolPrice() {
    try {
      this.logger.log('Fetching SOL price');
      
      const result = await this.tokensService.getSolPrice();
      
      this.logger.log(`SOL price: $${result.data.price}`);
      
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      this.logger.error('Failed to fetch SOL price:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch SOL price',
        data: { price: 0 },
      };
    }
  }

  @Get('analytics/dashboard')
  async getDashboardData() {
    try {
      this.logger.log('Fetching dashboard analytics data');
      
      // Fetch multiple data sources concurrently
      const [featuredResult, trendingResult, newResult] = await Promise.all([
        this.tokensService.getFeaturedTokens(10),
        this.tokensService.getTrendingTokens(20),
        this.tokensService.getNewTokens(20),
      ]);

      const totalFeatured = featuredResult.data.length;
      const totalTrending = trendingResult.data.length;
      const totalNew = newResult.data.length;
      
      // Combine unique tokens
      const allTokens = [...featuredResult.data, ...trendingResult.data];
      const uniqueTokens = allTokens.filter((token, index, arr) => 
        arr.findIndex(t => t.mint === token.mint) === index
      );

      const analytics = {
        featuredTokens: featuredResult.data,
        trendingTokens: trendingResult.data,
        newTokens: newResult.data,
        summary: {
          totalFeatured,
          totalTrending,
          totalNew,
          totalUnique: uniqueTokens.length,
        },
      };

      this.logger.log(`Dashboard data prepared: ${totalFeatured} featured, ${totalTrending} trending, ${totalNew} new`);
      
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      this.logger.error('Failed to fetch dashboard data:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch dashboard data',
        data: {
          featuredTokens: [],
          trendingTokens: [],
          newTokens: [],
          summary: {
            totalFeatured: 0,
            totalTrending: 0,
            totalNew: 0,
            totalUnique: 0,
          },
        },
      };
    }
  }
}