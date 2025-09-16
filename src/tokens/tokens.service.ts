import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface PumpFunToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image_uri?: string;
  metadata_uri?: string;
  twitter?: string;
  telegram?: string;
  bonding_curve: string;
  associated_bonding_curve: string;
  creator: string;
  created_timestamp: number;
  raydium_pool?: string;
  complete: boolean;
  virtual_sol_reserves: number;
  virtual_token_reserves: number;
  total_supply: number;
  website?: string;
  show_name: boolean;
  king_of_the_hill_timestamp?: number;
  market_cap: number;
  reply_count: number;
  last_reply: number;
  nsfw: boolean;
  market_id?: string;
  inverted?: boolean;
  is_currently_live: boolean;
  username?: string;
  profile_image?: string;
  usd_market_cap: number;
  volume_24h?: number;
  price_change_24h?: number;
  price?: number;
}

export interface TokenTrade {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  tx_index: number;
  username?: string;
  profile_image?: string;
}

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  
  // Using PumpPortal - reliable third-party API
  private readonly PUMPPORTAL_BASE = 'https://pumpportal.fun/api';
  
  // Fallback APIs if needed
  private readonly PUMP_API_FALLBACKS = [
    'https://frontend-api-v2.pump.fun',
    'https://frontend-api-v3.pump.fun',
    'https://api.pump.fun/api'
  ];

  private async callPumpPortalAPI(endpoint: string, params: any = {}): Promise<any> {
    try {
      const response = await axios.get(`${this.PUMPPORTAL_BASE}${endpoint}`, {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'YourPumpApp/1.0'
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`PumpPortal API call failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  private async callFallbackAPI(endpoint: string, params: any = {}): Promise<any> {
    for (const baseUrl of this.PUMP_API_FALLBACKS) {
      try {
        this.logger.log(`Trying fallback API: ${baseUrl}${endpoint}`);
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          params,
          timeout: 8000,
        });
        this.logger.log(`Fallback API ${baseUrl} succeeded`);
        return response.data;
      } catch (error) {
        this.logger.warn(`Fallback API ${baseUrl} failed:`, error.message);
        continue;
      }
    }
    throw new Error('All fallback APIs failed');
  }



  async getFeaturedTokens(limit = 20, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching featured tokens - limit: ${limit}, offset: ${offset}`);
      
      // Try PumpPortal first - though they don't have a direct "featured" endpoint
      // We'll try to get trending/popular tokens instead
      try {
        // Since PumpPortal doesn't have featured endpoint, we'll simulate with trending
        const trendingResult = await this.getTrendingTokens(limit, offset);
        return trendingResult;
      } catch (pumpPortalError) {
        this.logger.warn('PumpPortal featured tokens failed, trying fallback APIs');
        
        // Try fallback APIs
        const data = await this.callFallbackAPI('/coins/king-of-the-hill', {
          offset,
          limit,
          includeNsfw: false,
        });
        
        this.logger.log(`Fetched ${data.length} featured tokens from fallback`);
        return { data };
      }
    } catch (error) {
      this.logger.error('All featured token APIs failed:', error.message);
      return { data: [] };
    }
  }

  async getTrendingTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching trending tokens - limit: ${limit}, offset: ${offset}`);
      
      // Try fallback APIs first since PumpPortal doesn't have trending endpoint
      try {
        const data = await this.callFallbackAPI('/coins', {
          offset,
          limit,
          sort: 'market_cap',
          order: 'DESC',
          includeNsfw: false,
        });
        
        this.logger.log(`Fetched ${data.length} trending tokens from fallback API`);
        return { data };
      } catch (fallbackError) {
        this.logger.error('All trending token APIs failed:', fallbackError.message);
        return { data: [] };
      }
    } catch (error) {
      this.logger.error('All trending token APIs failed:', error.message);
      return { data: [] };
    }
  }

  async getNewTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching new tokens - limit: ${limit}, offset: ${offset}`);
      
      // Try fallback APIs
      try {
        const data = await this.callFallbackAPI('/coins', {
          offset,
          limit,
          sort: 'created_timestamp',
          order: 'DESC',
          includeNsfw: false,
        });
        
        this.logger.log(`Fetched ${data.length} new tokens from fallback API`);
        return { data };
      } catch (fallbackError) {
        this.logger.error('All new token APIs failed:', fallbackError.message);
        return { data: [] };
      }
    } catch (error) {
      this.logger.error('All new token APIs failed:', error.message);
      return { data: [] };
    }
  }

  async searchTokens(query: string, limit = 20): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Searching tokens with query: "${query}" - limit: ${limit}`);
      
      // Try fallback APIs
      try {
        const data = await this.callFallbackAPI('/coins/search', {
          q: query,
          limit,
          includeNsfw: false,
        });
        
        this.logger.log(`Found ${data.length} tokens for query: "${query}" from fallback API`);
        return { data };
      } catch (fallbackError) {
        this.logger.error(`Search failed for query "${query}":`, fallbackError.message);
        return { data: [] };
      }
    } catch (error) {
      this.logger.error(`Search failed for query "${query}":`, error.message);
      return { data: [] };
    }
  }

  async getTokenDetails(mint: string): Promise<{ data: PumpFunToken | null }> {
    try {
      this.logger.log(`Fetching token details for mint: ${mint}`);
      
      // Try fallback APIs
      try {
        const data = await this.callFallbackAPI(`/coins/${mint}`, {});
        this.logger.log(`Fetched token details: ${data?.name || 'Unknown'} from fallback API`);
        return { data };
      } catch (fallbackError) {
        this.logger.error(`Token ${mint} not found in any API`);
        return { data: null };
      }
    } catch (error) {
      this.logger.error(`Failed to fetch token details for ${mint}:`, error.message);
      return { data: null };
    }
  }

  async getTokenTrades(mint: string, limit = 50, offset = 0): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching trades for token: ${mint} - limit: ${limit}, offset: ${offset}`);
      
      // Try fallback APIs
      try {
        const data = await this.callFallbackAPI(`/trades/all/${mint}`, {
          offset,
          limit,
        });
        
        this.logger.log(`Fetched ${data.length} trades for token: ${mint} from fallback API`);
        return { data };
      } catch (fallbackError) {
        this.logger.warn(`No trades found for token ${mint}, returning empty array`);
        return { data: [] };
      }
    } catch (error) {
      this.logger.error(`Failed to fetch trades for token ${mint}:`, error.message);
      return { data: [] };
    }
  }

  async getLatestTrades(limit = 100): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching latest trades - limit: ${limit}`);
      
      // Try fallback APIs
      try {
        const data = await this.callFallbackAPI('/trades/latest', { limit });
        this.logger.log(`Fetched ${data.length} latest trades from fallback API`);
        return { data };
      } catch (fallbackError) {
        this.logger.warn('No latest trades available, returning empty array');
        return { data: [] };
      }
    } catch (error) {
      this.logger.error('Failed to fetch latest trades:', error.message);
      return { data: [] };
    }
  }

  async getSolPrice(): Promise<{ data: { price: number } }> {
    try {
      this.logger.log('Fetching SOL price');
      
      // Try CoinGecko directly (most reliable)
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
          timeout: 5000,
        });
        
        const price = response.data?.solana?.usd || 0;
        this.logger.log(`SOL price from CoinGecko: $${price}`);
        return { data: { price } };
      } catch (coinGeckoError) {
        this.logger.warn('CoinGecko failed, trying fallback APIs');
        
        // Try fallback APIs
        try {
          const response = await this.callFallbackAPI('/sol-price', {});
          const price = response?.price || 0;
          this.logger.log(`SOL price from fallback: ${price}`);
          return { data: { price } };
        } catch (fallbackError) {
          this.logger.error('All SOL price APIs failed');
          return { data: { price: 0 } };
        }
      }
    } catch (error) {
      this.logger.error('Failed to fetch SOL price:', error.message);
      return { data: { price: 0 } };
    }
  }

  async getMarketStats(): Promise<{ data: any }> {
    try {
      this.logger.log('Calculating market stats from real token data');
      
      // Get trending tokens to calculate stats
      const trendingResult = await this.getTrendingTokens(100);
      const tokens = trendingResult.data;
      
      if (tokens.length === 0) {
        this.logger.warn('No tokens available for stats calculation');
        return {
          data: {
            totalMarketCap: 0,
            totalVolume24h: 0,
            activeTokens: 0,
            successfulGraduations: 0,
            totalTokens: 0,
          }
        };
      }
      
      const totalMarketCap = tokens.reduce((sum, token) => sum + (token.usd_market_cap || 0), 0);
      const activeTokens = tokens.filter(token => token.is_currently_live).length;
      const successfulGraduations = tokens.filter(token => token.complete).length;
      const totalVolume24h = tokens.reduce((sum, token) => sum + (token.volume_24h || 0), 0);
      
      const stats = {
        totalMarketCap,
        totalVolume24h,
        activeTokens,
        successfulGraduations,
        totalTokens: tokens.length,
      };
      
      this.logger.log(`Market stats calculated: ${JSON.stringify(stats)}`);
      return { data: stats };
    } catch (error) {
      this.logger.error('Failed to calculate market stats:', error.message);
      return {
        data: {
          totalMarketCap: 0,
          totalVolume24h: 0,
          activeTokens: 0,
          successfulGraduations: 0,
          totalTokens: 0,
        }
      };
    }
  }
}