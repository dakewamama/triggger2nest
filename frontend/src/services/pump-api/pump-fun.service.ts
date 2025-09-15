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
  volume_24h?: number;
  price_change_24h?: number;
  last_trade_timestamp?: number;
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

export interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  activeTokens: number;
  successfulGraduations: number;
  totalTokens?: number;
  last24Hours?: {
    newTokens?: number;
  };
}

class PumpFunApiService {
  // Use your backend as proxy - NO DIRECT CALLS to pump.fun
  private readonly API_BASE = ENV.API_URL || 'http://localhost:3000';
  
  private readonly axiosConfig = {
    timeout: 15000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };

  async getFeaturedTokens(limit = 10, offset = 0): Promise<PumpToken[]> {
    try {
      console.log(`[PumpFunAPI] Fetching featured tokens - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.API_BASE}/tokens/featured`, {
        ...this.axiosConfig,
        params: { limit, offset },
      });

      const tokens = response.data?.data || [];
      console.log(`[PumpFunAPI] Fetched ${tokens.length} featured tokens`);
      
      return this.processTokens(tokens);
    } catch (error) {
      console.error('[PumpFunAPI] Failed to fetch featured tokens:', error);
      return [];
    }
  }
  
  async getTrendingTokens(limit = 20, offset = 0): Promise<PumpToken[]> {
    try {
      console.log(`[PumpFunAPI] Fetching trending tokens - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.API_BASE}/tokens/trending`, {
        ...this.axiosConfig,
        params: { limit, offset },
      });

      const tokens = response.data?.data || [];
      console.log(`[PumpFunAPI] Fetched ${tokens.length} trending tokens`);
      
      return this.processTokens(tokens);
    } catch (error) {
      console.error('[PumpFunAPI] Failed to fetch trending tokens:', error);
      return [];
    }
  }
  
  async getNewTokens(limit = 20, offset = 0): Promise<PumpToken[]> {
    try {
      console.log(`[PumpFunAPI] Fetching new tokens - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.API_BASE}/tokens/new`, {
        ...this.axiosConfig,
        params: { limit, offset },
      });

      const tokens = response.data?.data || [];
      console.log(`[PumpFunAPI] Fetched ${tokens.length} new tokens`);
      
      return this.processTokens(tokens);
    } catch (error) {
      console.error('[PumpFunAPI] Failed to fetch new tokens:', error);
      return [];
    }
  }
  
  async searchTokens(query: string): Promise<PumpToken[]> {
    try {
      console.log(`[PumpFunAPI] Searching tokens with query: "${query}"`);
      
      const response = await axios.get(`${this.API_BASE}/tokens/search`, {
        ...this.axiosConfig,
        params: { q: query },
      });

      const tokens = response.data?.data || [];
      console.log(`[PumpFunAPI] Found ${tokens.length} tokens for query: "${query}"`);
      
      return this.processTokens(tokens);
    } catch (error) {
      console.error('[PumpFunAPI] Failed to search tokens:', error);
      return [];
    }
  }
  
  async getTokenDetails(mint: string): Promise<PumpToken | null> {
    try {
      console.log(`[PumpFunAPI] Fetching token details for mint: ${mint}`);
      
      const response = await axios.get(`${this.API_BASE}/tokens/${mint}`, this.axiosConfig);

      const token = response.data?.data;
      if (token) {
        console.log(`[PumpFunAPI] Fetched token details: ${token.name}`);
        return this.processToken(token);
      }
      
      return null;
    } catch (error) {
      console.error(`[PumpFunAPI] Failed to fetch token details for ${mint}:`, error);
      return null;
    }
  }

  async getTokenTrades(mint: string, limit = 50, offset = 0): Promise<TokenTrade[]> {
    try {
      console.log(`[PumpFunAPI] Fetching trades for token: ${mint} - limit: ${limit}, offset: ${offset}`);
      
      const response = await axios.get(`${this.API_BASE}/tokens/${mint}/trades`, {
        ...this.axiosConfig,
        params: { limit, offset },
      });

      const trades = response.data?.data || [];
      console.log(`[PumpFunAPI] Fetched ${trades.length} trades for token: ${mint}`);
      
      return trades;
    } catch (error) {
      console.error(`[PumpFunAPI] Failed to fetch trades for token ${mint}:`, error);
      return [];
    }
  }

  async getMarketStats(): Promise<MarketStats> {
    try {
      console.log('[PumpFunAPI] Fetching market stats');
      
      // Use the backend endpoint for market stats
      const response = await axios.get(`${this.API_BASE}/tokens/stats/market`, this.axiosConfig);
      
      if (response.data?.data) {
        console.log('[PumpFunAPI] Market stats fetched:', response.data.data);
        return response.data.data;
      }
      
      // Fallback calculation if endpoint fails
      const tokens = await this.getTrendingTokens(100);
      
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
      
      console.log('[PumpFunAPI] Market stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('[PumpFunAPI] Failed to fetch market stats:', error);
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        activeTokens: 0,
        successfulGraduations: 0,
        totalTokens: 0,
      };
    }
  }

  // Helper method to process tokens and add calculated fields
  private processTokens(tokens: any[]): PumpToken[] {
    return tokens.map(token => this.processToken(token));
  }

  private processToken(token: any): PumpToken {
    // Calculate price if not present
    const price = token.price || this.calculatePrice(token);
    
    // Ensure is_currently_live is set
    const is_currently_live = token.is_currently_live ?? (!token.complete && token.virtual_sol_reserves > 0);
    
    // Ensure last_trade_timestamp exists
    const last_trade_timestamp = token.last_trade_timestamp || token.created_timestamp;
    
    return {
      ...token,
      price,
      is_currently_live,
      last_trade_timestamp,
      // Ensure all required fields have defaults
      volume_24h: token.volume_24h || 0,
      price_change_24h: token.price_change_24h || 0,
    };
  }

  // UTILITY METHODS - All the formatting methods your components expect:

  formatPrice(price: number): string {
    if (price < 0.001) {
      return `$${price.toExponential(2)}`;
    } else if (price < 1) {
      return `$${price.toFixed(6)}`;
    } else if (price < 100) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  }

  formatMarketCap(marketCap: number): string {
    if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    } else if (marketCap >= 1_000) {
      return `$${(marketCap / 1_000).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  }

  formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp * 1000; // Convert to milliseconds
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }

  formatAddress(address: string, length: number = 6): string {
    if (!address) return '';
    if (address.length <= length * 2) {
      return address;
    }
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }

  getPumpFunUrl(mint: string): string {
    return `https://pump.fun/${mint}`;
  }

  getSolscanUrl(type: 'address' | 'token' | 'tx', value: string): string {
    const baseUrl = 'https://solscan.io';
    switch (type) {
      case 'address':
        return `${baseUrl}/account/${value}`;
      case 'token':
        return `${baseUrl}/token/${value}`;
      case 'tx':
        return `${baseUrl}/tx/${value}`;
      default:
        return baseUrl;
    }
  }

  calculatePrice(token: PumpToken): number {
    // Calculate price based on bonding curve formula
    const { virtual_sol_reserves, virtual_token_reserves } = token;
    
    if (!virtual_token_reserves || virtual_token_reserves === 0) return 0;
    
    return virtual_sol_reserves / virtual_token_reserves;
  }
}

export const pumpFunApi = new PumpFunApiService();