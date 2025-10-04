import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PumpFunToken } from './entities/pump-fun-token.entity';
import { SearchResult, MarketStats, TokenTrade } from './types';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  private readonly PUMPPORTAL_BASE = 'https://pumpportal.fun/api';
  private readonly PUMP_API_BASE = 'https://frontend-api.pump.fun';
  private readonly PUMP_API_FALLBACKS = [
    'https://frontend-api-v2.pump.fun',
    'https://frontend-api-v3.pump.fun',
    'https://api.pump.fun/api'
  ];

  private tokenCache: Map<string, { tokens: PumpFunToken[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000;

  private async callPumpPortalAPI(endpoint: string, params: any = {}): Promise<any> {
    try {
      const response = await axios.get(`${this.PUMPPORTAL_BASE}${endpoint}`, {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PumpFunController/1.0'
        }
      });
      return response.data;
    } catch (error) {
      this.logger.error(`PumpPortal API call failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  private async callFallbackAPI(endpoint: string, params: any = {}): Promise<any> {
    try {
      this.logger.log(`Trying main API: ${this.PUMP_API_BASE}${endpoint}`);
      const response = await axios.get(`${this.PUMP_API_BASE}${endpoint}`, {
        params,
        timeout: 8000,
        headers: { 'Accept': 'application/json' }
      });
      this.logger.log(`Main API succeeded`);
      return response.data;
    } catch (error) {
      this.logger.warn(`Main API failed: ${error.message}`);
    }

    for (const baseUrl of this.PUMP_API_FALLBACKS) {
      try {
        this.logger.log(`Trying fallback API: ${baseUrl}${endpoint}`);
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          params,
          timeout: 8000,
        });
        this.logger.log(`Fallback API ${baseUrl} succeeded`);
        return response.data;
      } catch (fallbackError) {
        this.logger.warn(`Fallback API ${baseUrl} failed:`, fallbackError.message);
      }
    }

    throw new Error('All API endpoints failed');
  }

  private updateTokenCache(key: string, tokens: PumpFunToken[]): void {
    this.tokenCache.set(key, {
      tokens,
      timestamp: Date.now()
    });
  }

  private searchCachedTokens(query: string, limit: number): PumpFunToken[] {
    const searchTerm = query.toLowerCase();
    const allCachedTokens: PumpFunToken[] = [];
    const now = Date.now();
    let validCaches = 0;
    let expiredCaches = 0;
    
    for (const [key, cache] of this.tokenCache.entries()) {
      if (now - cache.timestamp < this.CACHE_DURATION) {
        allCachedTokens.push(...cache.tokens);
        validCaches++;
      } else {
        this.tokenCache.delete(key);
        expiredCaches++;
      }
    }
    
    this.logger.debug(`Cache status: ${validCaches} valid, ${expiredCaches} expired, ${allCachedTokens.length} total tokens`);
    
    const uniqueTokens = Array.from(
      new Map(allCachedTokens.map(token => [token.mint, token])).values()
    );
    
    const filteredTokens = uniqueTokens.filter(token => {
      const nameMatch = token.name?.toLowerCase().includes(searchTerm);
      const symbolMatch = token.symbol?.toLowerCase().includes(searchTerm);
      const descriptionMatch = token.description?.toLowerCase().includes(searchTerm);
      return nameMatch || symbolMatch || descriptionMatch;
    });
    
    this.logger.debug(`Cache search: Found ${filteredTokens.length} matches for "${query}"`);
    return filteredTokens.slice(0, limit);
  }

  async getFeaturedTokens(limit = 20, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching featured tokens - limit: ${limit}, offset: ${offset}`);
      
      try {
        const data = await this.callFallbackAPI('/coins/king-of-the-hill', {
          offset,
          limit,
          includeNsfw: false,
        });
        
        this.logger.log(`Fetched ${data.length} featured tokens`);
        this.updateTokenCache('featured', data);
        return { data };
      } catch (error) {
        this.logger.warn('Featured endpoint failed, using trending as fallback');
        return this.getTrendingTokens(limit, offset);
      }
    } catch (error) {
      this.logger.error('All featured token APIs failed:', error.message);
      const cached = this.searchCachedTokens('', limit);
      return { data: cached };
    }
  }

  async getTrendingTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching trending tokens - limit: ${limit}, offset: ${offset}`);
      
      const data = await this.callFallbackAPI('/coins', {
        offset,
        limit,
        sort: 'market_cap',
        order: 'DESC',
        includeNsfw: false,
      });
      
      this.updateTokenCache('trending', data);
      this.logger.log(`Fetched ${data.length} trending tokens`);
      return { data };
    } catch (error) {
      this.logger.error('All trending token APIs failed:', error.message);
      const cached = this.searchCachedTokens('', limit);
      return { data: cached };
    }
  }

  async getNewTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching new tokens - limit: ${limit}, offset: ${offset}`);
      
      const data = await this.callFallbackAPI('/coins', {
        offset,
        limit,
        sort: 'created_timestamp',
        order: 'DESC',
        includeNsfw: false,
      });
      
      this.updateTokenCache('new', data);
      this.logger.log(`Fetched ${data.length} new tokens`);
      return { data };
    } catch (error) {
      this.logger.error('All new token APIs failed:', error.message);
      const cached = this.searchCachedTokens('', limit);
      return { data: cached };
    }
  }

  async searchTokensAdvanced(query: string, limit = 20): Promise<SearchResult> {
    try {
      this.logger.log(`Advanced search: "${query}" | Limit: ${limit}`);
      
      if (!query || query.trim().length === 0) {
        return { 
          data: [],
          searchType: 'exact',
          totalMatches: 0
        };
      }

      const searchTerm = query.trim();
      const searchTermLower = searchTerm.toLowerCase();
      const results: SearchResult = {
        data: [],
        suggestions: [],
        relatedTokens: [],
        searchType: 'exact',
        totalMatches: 0
      };

      const looksLikeCa = /^[a-zA-Z0-9]{6,}$/.test(searchTerm) && searchTerm.length >= 6;

      if (looksLikeCa) {
        this.logger.log(`Searching by CA: ${searchTerm}`);
        try {
          const tokenData = await this.callFallbackAPI(`/coins/${searchTerm}`);
          if (tokenData) {
            results.data = [tokenData];
            results.searchType = searchTerm.length === 44 ? 'exact' : 'ca_partial';
            results.totalMatches = 1;
            return results;
          }
        } catch (error) {
          this.logger.debug(`CA lookup failed: ${error.message}`);
        }
      }

      try {
        const endpoints = ['/coins/search', '/search', '/coins'];
        
        for (const endpoint of endpoints) {
          try {
            const response = await this.callFallbackAPI(endpoint, {
              q: searchTerm,
              query: searchTerm,
              search: searchTerm,
              limit: limit * 2,
            });
            
            if (response && Array.isArray(response) && response.length > 0) {
              const processedResults = this.rankSearchResults(response, searchTermLower, looksLikeCa);
              results.data = processedResults.exact.concat(
                processedResults.high,
                processedResults.medium
              ).slice(0, limit);
              
              results.totalMatches = processedResults.exact.length + 
                                    processedResults.high.length + 
                                    processedResults.medium.length;
              
              if (processedResults.exact.length > 0) {
                results.searchType = 'exact';
              } else if (processedResults.high.length > 0) {
                results.searchType = 'fuzzy';
              } else {
                results.searchType = processedResults.medium.length > 0 ? 'partial' : 'exact';
              }
              
              results.relatedTokens = processedResults.low.slice(0, 5);
              return results;
            }
          } catch (endpointError) {
            this.logger.debug(`Search endpoint ${endpoint} failed:`, endpointError.message);
          }
        }
      } catch (apiError) {
        this.logger.warn(`Direct API search failed for "${query}":`, apiError.message);
      }

      this.logger.log(`Direct search failed. Fetching tokens for local search...`);
      
      const [trending, featured, newTokens] = await Promise.all([
        this.getTrendingTokens(200, 0).catch(() => ({ data: [] })),
        this.getFeaturedTokens(50, 0).catch(() => ({ data: [] })),
        this.getNewTokens(100, 0).catch(() => ({ data: [] })),
      ]);
      
      const allTokens = [...trending.data, ...featured.data, ...newTokens.data];
      const uniqueTokens = Array.from(
        new Map(allTokens.map(token => [token.mint, token])).values()
      );
      
      this.logger.log(`Fetched ${uniqueTokens.length} unique tokens for local search`);

      const rankedResults = this.rankSearchResults(uniqueTokens, searchTermLower, looksLikeCa);
      
      results.data = rankedResults.exact.concat(
        rankedResults.high,
        rankedResults.medium,
        rankedResults.low
      ).slice(0, limit);
      
      results.totalMatches = rankedResults.exact.length + 
                            rankedResults.high.length + 
                            rankedResults.medium.length;
      
      results.relatedTokens = rankedResults.low.slice(0, 5);
      
      if (rankedResults.exact.length > 0) {
        results.searchType = 'exact';
      } else if (rankedResults.high.length > 0) {
        results.searchType = 'fuzzy';
      } else if (rankedResults.medium.length > 0) {
        results.searchType = 'partial';
      }

      if (results.data.length === 0) {
        const suggestions = new Set<string>();
        uniqueTokens.slice(0, 50).forEach(token => {
          if (token.symbol && suggestions.size < 10) {
            suggestions.add(token.symbol);
          }
        });
        results.suggestions = Array.from(suggestions);
        this.logger.log(`No matches. Suggestions: ${results.suggestions.join(', ')}`);
      } else {
        this.logger.log(`Found ${results.data.length} results (type: ${results.searchType})`);
      }

      return results;
    } catch (error) {
      this.logger.error('Search failed:', error.message);
      return {
        data: [],
        suggestions: [],
        searchType: 'exact',
        totalMatches: 0
      };
    }
  }

  private rankSearchResults(
    tokens: PumpFunToken[],
    searchTerm: string,
    isContractAddress: boolean
  ): {
    exact: PumpFunToken[];
    high: PumpFunToken[];
    medium: PumpFunToken[];
    low: PumpFunToken[];
  } {
    const exact: PumpFunToken[] = [];
    const high: PumpFunToken[] = [];
    const medium: PumpFunToken[] = [];
    const low: PumpFunToken[] = [];

    for (const token of tokens) {
      const name = (token.name || '').toLowerCase();
      const symbol = (token.symbol || '').toLowerCase();
      const description = (token.description || '').toLowerCase();
      const mint = (token.mint || '').toLowerCase();

      if (isContractAddress && mint.includes(searchTerm)) {
        if (mint === searchTerm) {
          exact.push(token);
        } else if (mint.startsWith(searchTerm)) {
          high.push(token);
        } else {
          medium.push(token);
        }
      } else if (symbol === searchTerm || name === searchTerm) {
        exact.push(token);
      } else if (symbol.startsWith(searchTerm) || name.startsWith(searchTerm)) {
        high.push(token);
      } else if (symbol.includes(searchTerm) || name.includes(searchTerm)) {
        medium.push(token);
      } else if (description.includes(searchTerm)) {
        low.push(token);
      }
    }

    return { exact, high, medium, low };
  }

  async getTokenDetails(mint: string): Promise<{ data: PumpFunToken | null }> {
    try {
      this.logger.log(`Fetching token details for: ${mint}`);
      const data = await this.callFallbackAPI(`/coins/${mint}`);
      this.logger.log(`Fetched token details: ${data?.name || 'Unknown'}`);
      return { data };
    } catch (error) {
      this.logger.error(`Failed to fetch token details for ${mint}:`, error.message);
      return { data: null };
    }
  }

  async getTokenTrades(mint: string, limit = 50, offset = 0): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching trades for token: ${mint} - limit: ${limit}, offset: ${offset}`);
      const data = await this.callFallbackAPI(`/trades/all/${mint}`, { offset, limit });
      this.logger.log(`Fetched ${data.length} trades`);
      return { data };
    } catch (error) {
      this.logger.error(`Failed to fetch trades for ${mint}:`, error.message);
      return { data: [] };
    }
  }

  async getMarketStats(): Promise<{ data: MarketStats | null }> {
    try {
      this.logger.log('Fetching market statistics');
      
      const [trending, newTokens] = await Promise.all([
        this.getTrendingTokens(100, 0).catch(() => ({ data: [] })),
        this.getNewTokens(50, 0).catch(() => ({ data: [] })),
      ]);
      
      const allTokens = [...trending.data, ...newTokens.data];
      const uniqueTokens = Array.from(
        new Map(allTokens.map(token => [token.mint, token])).values()
      );
      
      const stats: MarketStats = {
        totalMarketCap: uniqueTokens.reduce((acc, token) => acc + (token.usd_market_cap || 0), 0),
        totalVolume24h: uniqueTokens.reduce((acc, token) => acc + (token.volume_24h || 0), 0),
        activeTokens: uniqueTokens.filter(token => token.is_currently_live).length,
        successfulGraduations: uniqueTokens.filter(token => token.complete).length,
        totalTokens: uniqueTokens.length,
      };
      
      this.logger.log('Market stats calculated');
      return { data: stats };
    } catch (error) {
      this.logger.error('Failed to fetch market stats:', error.message);
      return { data: null };
    }
  }

  async getLatestTrades(limit = 20): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching latest trades - limit: ${limit}`);
      const data = await this.callFallbackAPI('/trades/latest', { limit });
      this.logger.log(`Fetched ${data.length} latest trades`);
      return { data };
    } catch (error) {
      this.logger.error('Failed to fetch latest trades:', error.message);
      return { data: [] };
   
    }
  }
  async getSolPrice(): Promise<{ data: { price: number; timestamp: number } }> {
  try {
    this.logger.log('Fetching SOL price from CoinGecko');
    
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'solana',
        vs_currencies: 'usd'
      },
      timeout: 5000
    });
    
    const price = response.data?.solana?.usd || 0;
    
    this.logger.log(`SOL price: $${price}`);
    
    return {
      data: {
        price,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    this.logger.error('Failed to fetch SOL price:', error.message);
    return {
      data: {
        price: 140,
        timestamp: Date.now()
      }
     };
   }
 }
}