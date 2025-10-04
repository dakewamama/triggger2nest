import { apiClient } from './client';
import { Token, Trade, MarketStats, SearchResult } from '@/types';

export interface DashboardData {
  featuredTokens: Token[];
  trendingTokens: Token[];
  newTokens: Token[];
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

  async getFeaturedTokens(limit = 20, offset = 0): Promise<Token[]> {
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

  async getTrendingTokens(limit = 50, offset = 0): Promise<Token[]> {
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

  async getNewTokens(limit = 50, offset = 0): Promise<Token[]> {
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

  async searchTokens(query: string, filters?: any): Promise<SearchResult> {
    try {
      console.log(`[TokensService] Searching tokens with query: "${query}"`);
      
      const url = `${this.baseUrl}/search`;
      
      const params = {
        q: query, 
        limit: filters?.limit || 50,
        sortBy: filters?.sortBy || 'trending'
      };
      
      console.log('[TokensService] Request URL:', url);
      console.log('[TokensService] Request params:', params);
      
      const { data } = await apiClient.api.get(url, { params });
      
      console.log('[TokensService] Search response:', data);
      
      if (data?.success === false) {
        console.error('[TokensService] Search failed:', data.error);
        return { 
          data: [],
          error: data.error
        };
      }
      
      return {
        data: data?.data || [],
        totalMatches: data?.count || 0,
        query: query,
        suggestions: data?.suggestions || []
      };
    } catch (error: any) {
      console.error('[TokensService] Failed to search tokens:', error);
      return { 
        data: [],
        error: error.message || 'Search failed'
      };
    }
  }

  async getTokenDetails(mintAddress: string): Promise<Token | null> {
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

  async getTokenTrades(mintAddress: string, limit = 50): Promise<Trade[]> {
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

  async getLatestTrades(limit = 20): Promise<Trade[]> {
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

  async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('[TokensService] Fetching dashboard data');
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/dashboard`);
      
      if (data?.success) {
        return data.data;
      }
      
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

  private processTokens(tokens: any[]): Token[] {
    return tokens.filter(token => token && token.mint).map(token => ({
      ...token,
      price: token.price || 0,
      volume24h: token.volume_24h || 0,
      change24h: token.price_change_24h || 0,
    }));
  }
}

export const tokensService = new TokensService();
export default tokensService;