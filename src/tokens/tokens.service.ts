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
  
  // Official pump.fun frontend API
  private readonly PUMP_API_BASE = 'https://frontend-api.pump.fun';
  // Alternative: https://frontend-api-v2.pump.fun or https://frontend-api-v3.pump.fun
  
  // PumpPortal for additional data
  private readonly PUMPPORTAL_BASE = 'https://pumpportal.fun/api';

  async getFeaturedTokens(limit = 20, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching featured tokens (King of the Hill) - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/coins/king-of-the-hill`, {
        params: {
          offset,
          limit,
          includeNsfw: false,
        },
        timeout: 10000,
      });

      const tokens = response.data || [];
      this.logger.log(`Fetched ${tokens.length} featured tokens`);
      
      return { data: tokens };
    } catch (error) {
      this.logger.error('Failed to fetch featured tokens:', error.message);
      return { data: [] };
    }
  }

  async getTrendingTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching trending tokens - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/coins`, {
        params: {
          offset,
          limit,
          sort: 'market_cap',
          order: 'DESC',
          includeNsfw: false,
        },
        timeout: 10000,
      });

      const tokens = response.data || [];
      this.logger.log(`Fetched ${tokens.length} trending tokens`);
      
      return { data: tokens };
    } catch (error) {
      this.logger.error('Failed to fetch trending tokens:', error.message);
      
      // Fallback to latest coins if trending fails
      try {
        this.logger.log('Trying fallback to latest coins...');
        return await this.getNewTokens(limit, offset);
      } catch (fallbackError) {
        this.logger.error('Fallback also failed:', fallbackError.message);
        return { data: [] };
      }
    }
  }

  async getNewTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching new tokens - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/coins`, {
        params: {
          offset,
          limit,
          sort: 'created_timestamp',
          order: 'DESC',
          includeNsfw: false,
        },
        timeout: 10000,
      });

      const tokens = response.data || [];
      this.logger.log(`Fetched ${tokens.length} new tokens`);
      
      return { data: tokens };
    } catch (error) {
      this.logger.error('Failed to fetch new tokens:', error.message);
      return { data: [] };
    }
  }

  async searchTokens(query: string, limit = 20): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Searching tokens with query: "${query}" - limit: ${limit}`);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/coins/search`, {
        params: {
          q: query,
          limit,
          includeNsfw: false,
        },
        timeout: 10000,
      });

      const tokens = response.data || [];
      this.logger.log(`Found ${tokens.length} tokens for query: "${query}"`);
      
      return { data: tokens };
    } catch (error) {
      this.logger.error(`Failed to search tokens for query "${query}":`, error.message);
      return { data: [] };
    }
  }

  async getTokenDetails(mint: string): Promise<{ data: PumpFunToken | null }> {
    try {
      this.logger.log(`Fetching token details for mint: ${mint}`);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/coins/${mint}`, {
        timeout: 10000,
      });

      const token = response.data;
      this.logger.log(`Fetched token details: ${token?.name || 'Unknown'}`);
      
      return { data: token };
    } catch (error) {
      this.logger.error(`Failed to fetch token details for ${mint}:`, error.message);
      return { data: null };
    }
  }

  async getTokenTrades(mint: string, limit = 50, offset = 0): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching trades for token: ${mint} - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/trades/all/${mint}`, {
        params: {
          offset,
          limit,
        },
        timeout: 10000,
      });

      const trades = response.data || [];
      this.logger.log(`Fetched ${trades.length} trades for token: ${mint}`);
      
      return { data: trades };
    } catch (error) {
      this.logger.error(`Failed to fetch trades for token ${mint}:`, error.message);
      return { data: [] };
    }
  }

  async getLatestTrades(limit = 100): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching latest trades - limit: ${limit}`);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/trades/latest`, {
        params: { limit },
        timeout: 10000,
      });

      const trades = response.data || [];
      this.logger.log(`Fetched ${trades.length} latest trades`);
      
      return { data: trades };
    } catch (error) {
      this.logger.error('Failed to fetch latest trades:', error.message);
      return { data: [] };
    }
  }

  async getSolPrice(): Promise<{ data: { price: number } }> {
    try {
      this.logger.log('Fetching SOL price');
      
      // Try pump.fun API first
      const response = await axios.get(`${this.PUMP_API_BASE}/sol-price`, {
        timeout: 5000,
      });

      const price = response.data?.price || 0;
      this.logger.log(`SOL price: $${price}`);
      
      return { data: { price } };
    } catch (error) {
      this.logger.error('Failed to fetch SOL price from pump.fun, trying fallback');
      
      // Fallback to CoinGecko
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
          timeout: 5000,
        });
        
        const price = response.data?.solana?.usd || 0;
        this.logger.log(`SOL price (fallback): $${price}`);
        
        return { data: { price } };
      } catch (fallbackError) {
        this.logger.error('Failed to fetch SOL price from fallback:', fallbackError.message);
        return { data: { price: 0 } };
      }
    }
  }

  async getMarketStats(): Promise<{ data: any }> {
    try {
      this.logger.log('Calculating market stats from real token data');
      
      // Get trending tokens to calculate stats
      const trendingResult = await this.getTrendingTokens(100);
      const tokens = trendingResult.data;
      
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