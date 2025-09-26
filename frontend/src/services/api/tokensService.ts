// frontend/src/services/api/tokensService.ts
import { apiClient } from './client';

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
    volume?: number;
    trades?: number;
  };
}

export interface SearchResult {
  data: PumpToken[];
  suggestions?: string[];
  relatedTokens?: PumpToken[];
  searchType?: string;
  totalMatches?: number;
}

export interface DashboardData {
  featuredTokens: PumpToken[];
  trendingTokens: PumpToken[];
  newTokens: PumpToken[];
  marketStats: MarketStats | null;
  summary: {
    totalFeatured: number;
    totalTrending: number;
    totalNew: number;
    totalUnique: number;
  };
}

class TokensService {
  private readonly baseUrl = '/tokens';
  
  /**
   * Get featured tokens
   */
  async getFeaturedTokens(limit = 20, offset = 0): Promise<PumpToken[]> {
    try {
      console.log(`[TokensService] Fetching featured tokens - limit: ${limit}, offset: ${offset}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/featured`, {
        params: { limit, offset }
      });

      const tokens = data?.data || [];
      console.log(`[TokensService] Fetched ${tokens.length} featured tokens`);
      
      return this.processTokens(tokens);
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch featured tokens:', error);
      return [];
    }
  }

  /**
   * Get trending tokens
   */
  async getTrendingTokens(limit = 50, offset = 0): Promise<PumpToken[]> {
    try {
      console.log(`[TokensService] Fetching trending tokens - limit: ${limit}, offset: ${offset}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/trending`, {
        params: { limit, offset }
      });

      const tokens = data?.data || [];
      console.log(`[TokensService] Fetched ${tokens.length} trending tokens`);
      
      return this.processTokens(tokens);
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch trending tokens:', error);
      return [];
    }
  }

  /**
   * Get new tokens
   */
  async getNewTokens(limit = 50, offset = 0): Promise<PumpToken[]> {
    try {
      console.log(`[TokensService] Fetching new tokens - limit: ${limit}, offset: ${offset}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/new`, {
        params: { limit, offset }
      });

      const tokens = data?.data || [];
      console.log(`[TokensService] Fetched ${tokens.length} new tokens`);
      
      return this.processTokens(tokens);
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch new tokens:', error);
      return [];
    }
  }

  /**
   * Search tokens
   */
  async searchTokens(query: string, filters?: any): Promise<SearchResult> {
    try {
      console.log(`[TokensService] Searching tokens with query: ${query}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/search`, {
        params: { query, ...filters }
      });

      if (data?.success) {
        return data.data || { data: [] };
      }
      
      return { data: [] };
    } catch (error: any) {
      console.error('[TokensService] Failed to search tokens:', error);
      return { data: [] };
    }
  }

  /**
   * Get token details
   */
  async getTokenDetails(mintAddress: string): Promise<PumpToken | null> {
    try {
      console.log(`[TokensService] Fetching token details for: ${mintAddress}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/${mintAddress}`);
      
      if (data?.success) {
        return data.data;
      }
      
      throw new Error('Token not found');
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch token details:', error);
      return null;
    }
  }

  /**
   * Get token trades
   */
  async getTokenTrades(mintAddress: string, limit = 50): Promise<TokenTrade[]> {
    try {
      console.log(`[TokensService] Fetching trades for token: ${mintAddress}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/${mintAddress}/trades`, {
        params: { limit }
      });
      
      if (data?.success) {
        return data.data || [];
      }
      
      return [];
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch token trades:', error);
      return [];
    }
  }

  /**
   * Get market stats
   */
  async getMarketStats(): Promise<MarketStats | null> {
    try {
      console.log('[TokensService] Fetching market stats');
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/stats/market`);
      
      if (data?.success) {
        return data.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch market stats:', error);
      return null;
    }
  }

  /**
   * Get latest trades across all tokens
   */
  async getLatestTrades(limit = 20): Promise<TokenTrade[]> {
    try {
      console.log('[TokensService] Fetching latest trades');
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/trades/latest`, {
        params: { limit }
      });
      
      if (data?.success) {
        return data.data || [];
      }
      
      return [];
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch latest trades:', error);
      return [];
    }
  }

  /**
   * Get dashboard data (featured, trending, new tokens and stats)
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('[TokensService] Fetching dashboard data');
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/dashboard`);
      
      if (data?.success) {
        return data.data;
      }
      
      // Fallback: fetch individually
      const [featured, trending, newTokens, marketStats] = await Promise.all([
        this.getFeaturedTokens(10),
        this.getTrendingTokens(20),
        this.getNewTokens(20),
        this.getMarketStats()
      ]);
      
      return {
        featuredTokens: featured,
        trendingTokens: trending,
        newTokens: newTokens,
        marketStats: marketStats,
        summary: {
          totalFeatured: featured.length,
          totalTrending: trending.length,
          totalNew: newTokens.length,
          totalUnique: new Set([...featured, ...trending, ...newTokens].map(t => t.mint)).size
        }
      };
    } catch (error: any) {
      console.error('[TokensService] Failed to fetch dashboard data:', error);
      
      return {
        featuredTokens: [],
        trendingTokens: [],
        newTokens: [],
        marketStats: null,
        summary: {
          totalFeatured: 0,
          totalTrending: 0,
          totalNew: 0,
          totalUnique: 0
        }
      };
    }
  }

  /**
   * Process and validate tokens
   */
  private processTokens(tokens: any[]): PumpToken[] {
    return tokens.filter(token => token && token.mint).map(token => ({
      ...token,
      price: token.price || 0,
      volume_24h: token.volume_24h || 0,
      price_change_24h: token.price_change_24h || 0,
      last_trade_timestamp: token.last_trade_timestamp || Date.now()
    }));
  }
}

export const tokensService = new TokensService();
export default tokensService;