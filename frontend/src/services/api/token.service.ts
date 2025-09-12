import axios from 'axios';
import { ENV } from '../../config/env';

export interface PumpToken {
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
  inverted: boolean;
  username?: string;
  profile_image?: string;
  usd_market_cap: number;
  price?: number;
  is_currently_live: boolean;
  last_trade_timestamp: number;
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

class PumpFunApiService {
  private apiUrl = ENV.API_URL;
  
  async getFeaturedTokens(limit = 10, offset = 0): Promise<PumpToken[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/tokens/featured`, {
        params: { limit, offset },
        timeout: 15000,
      });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Failed to fetch featured tokens:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch featured tokens');
    }
  }
  
  async getTrendingTokens(limit = 20, offset = 0): Promise<PumpToken[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/tokens/trending`, {
        params: { limit, offset },
        timeout: 15000,
      });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Failed to fetch trending tokens:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch trending tokens');
    }
  }
  
  async getNewTokens(limit = 20, offset = 0): Promise<PumpToken[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/tokens/new`, {
        params: { limit, offset },
        timeout: 15000,
      });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Failed to fetch new tokens:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch new tokens');
    }
  }
  
  async searchTokens(query: string): Promise<PumpToken[]> {
    try {
      if (!query.trim()) {
        return [];
      }
      
      const response = await axios.get(`${this.apiUrl}/tokens/search`, {
        params: { q: query },
        timeout: 15000,
      });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Failed to search tokens:', error);
      throw new Error(error.response?.data?.error || 'Failed to search tokens');
    }
  }
  
  async getTokenDetails(mint: string): Promise<PumpToken | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/tokens/${mint}`, {
        timeout: 10000,
      });
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      
      console.error('Failed to fetch token details:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch token details');
    }
  }
  
  async getTokenTrades(mint: string, limit = 100, offset = 0): Promise<TokenTrade[]> {
    try {
      // Since pump.fun doesn't have a direct trades endpoint in their public API,
      // we'll try to get this from our backend or return empty array
      const response = await axios.get(`${this.apiUrl}/tokens/${mint}/trades`, {
        params: { limit, offset },
        timeout: 10000,
      });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch token trades:', error);
      return []; // Return empty array instead of throwing for trades
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/tokens/stats/overview`, {
        timeout: 15000,
      });
      
      if (response.data?.success) {
        return response.data.data;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Failed to fetch market stats:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch market stats');
    }
  }

  /**
   * Get user's token holdings
   */
  async getUserHoldings(walletAddress: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/pump/wallet/${walletAddress}/balances`, {
        timeout: 15000,
      });
      
      if (response.data?.success) {
        return response.data.data.tokenHoldings || [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch user holdings:', error);
      return [];
    }
  }

  /**
   * Get user's transaction history
   */
  async getUserTransactions(walletAddress: string, limit = 50): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/pump/wallet/${walletAddress}/transactions`, {
        params: { limit },
        timeout: 15000,
      });
      
      if (response.data?.success) {
        return response.data.data || [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch user transactions:', error);
      return [];
    }
  }

  /**
   * Get health status of the service
   */
  async getHealthStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/tokens/health`, {
        timeout: 5000,
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Health check failed:', error);
      throw new Error('Service unavailable');
    }
  }
  
  // Helper method to calculate price from reserves
  calculatePrice(token: PumpToken): number {
    if (!token.virtual_sol_reserves || !token.virtual_token_reserves) return 0;
    return token.virtual_sol_reserves / token.virtual_token_reserves;
  }
  
  // Helper to format token for display
  formatToken(token: PumpToken) {
    const price = this.calculatePrice(token);
    return {
      mint: token.mint,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      image: token.image_uri,
      price,
      marketCap: token.usd_market_cap,
      creator: token.creator,
      isComplete: token.complete,
      isLive: token.is_currently_live,
      createdAt: new Date(token.created_timestamp * 1000),
      lastTradeAt: new Date(token.last_trade_timestamp * 1000),
      twitter: token.twitter,
      telegram: token.telegram,
      website: token.website,
      raydiumPool: token.raydium_pool,
      virtualSolReserves: token.virtual_sol_reserves,
      virtualTokenReserves: token.virtual_token_reserves,
      totalSupply: token.total_supply,
    };
  }
}

export const pumpFunApi = new PumpFunApiService();