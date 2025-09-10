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
  // Use your backend URL instead of direct Pump API
  private apiUrl = ENV.API_URL; // This will use your ngrok URL
  
  async getFeaturedTokens(limit = 10, offset = 0): Promise<PumpToken[]> {
    try {
      // Call YOUR backend endpoint
      const response = await axios.get(`${this.apiUrl}/tokens/featured`, {
        params: { limit, offset },
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch featured tokens:', error);
      return [];
    }
  }
  
  async getTrendingTokens(limit = 20, offset = 0): Promise<PumpToken[]> {
    try {
      // Call YOUR backend endpoint
      const response = await axios.get(`${this.apiUrl}/tokens/trending`, {
        params: { limit, offset },
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch trending tokens:', error);
      return [];
    }
  }
  
  async getNewTokens(limit = 20, offset = 0): Promise<PumpToken[]> {
    try {
      // Call YOUR backend endpoint
      const response = await axios.get(`${this.apiUrl}/tokens/new`, {
        params: { limit, offset },
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch new tokens:', error);
      return [];
    }
  }
  
  async searchTokens(query: string): Promise<PumpToken[]> {
    try {
      // Call YOUR backend endpoint
      const response = await axios.get(`${this.apiUrl}/tokens/search`, {
        params: { q: query, limit: 20 },
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to search tokens:', error);
      return [];
    }
  }
  
  async getTokenDetails(mint: string): Promise<PumpToken | null> {
    try {
      // Call YOUR backend endpoint
      const response = await axios.get(`${this.apiUrl}/tokens/${mint}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to fetch token details:', error);
      return null;
    }
  }
  
  async getTokenTrades(mint: string, limit = 100, offset = 0): Promise<TokenTrade[]> {
    try {
      // Call YOUR backend endpoint
      const response = await axios.get(`${this.apiUrl}/tokens/${mint}/trades`, {
        params: { limit, offset },
      });
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch token trades:', error);
      return [];
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
      createdAt: new Date(token.created_timestamp),
      twitter: token.twitter,
      telegram: token.telegram,
      website: token.website,
    };
  }
}

export const pumpFunApi = new PumpFunApiService();