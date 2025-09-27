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

export interface SearchResult {
  data: PumpFunToken[];
  suggestions?: string[];
  relatedTokens?: PumpFunToken[];
  searchType?: 'exact' | 'fuzzy' | 'partial' | 'ca' | 'ca_partial';
  totalMatches?: number;
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

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  
  // Using PumpPortal - reliable third-party API
  private readonly PUMPPORTAL_BASE = 'https://pumpportal.fun/api';
  
  // Official pump.fun API endpoints
  private readonly PUMP_API_BASE = 'https://frontend-api.pump.fun';
  
  // Fallback APIs if needed
  private readonly PUMP_API_FALLBACKS = [
    'https://frontend-api-v2.pump.fun',
    'https://frontend-api-v3.pump.fun',
    'https://api.pump.fun/api'
  ];

  // Cache for tokens (for fallback search and performance)
  private tokenCache: Map<string, { tokens: PumpFunToken[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Call PumpPortal API with error handling
   */
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

  /**
   * Call pump.fun API with automatic fallback
   */
  private async callFallbackAPI(endpoint: string, params: any = {}): Promise<any> {
    // Try main API first
    try {
      this.logger.log(`Trying main API: ${this.PUMP_API_BASE}${endpoint}`);
      const response = await axios.get(`${this.PUMP_API_BASE}${endpoint}`, {
        params,
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
        }
      });
      this.logger.log(`Main API succeeded`);
      return response.data;
    } catch (error) {
      this.logger.warn(`Main API failed: ${error.message}`);
    }

    // Try fallback APIs
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

  /**
   * Calculate string similarity score (Levenshtein distance)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Exact match
    if (s1 === s2) return 1;
    
    // Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Levenshtein distance for fuzzy matching
    const matrix: number[][] = [];
    
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLength = Math.max(s1.length, s2.length);
    const distance = matrix[s2.length][s1.length];
    return 1 - distance / maxLength;
  }

  /**
   * Update token cache
   */
  private updateTokenCache(key: string, tokens: PumpFunToken[]) {
    const cacheSize = tokens.length;
    this.tokenCache.set(key, {
      tokens,
      timestamp: Date.now()
    });
    this.logger.debug(`📦 Updated cache "${key}" with ${cacheSize} tokens`);
  }

  /**
   * Search cached tokens
   */
  private searchCachedTokens(query: string, limit: number): PumpFunToken[] {
    const searchTerm = query.toLowerCase();
    let allCachedTokens: PumpFunToken[] = [];
    let validCaches = 0;
    let expiredCaches = 0;
    
    // Collect all cached tokens
    for (const [key, cache] of this.tokenCache.entries()) {
      // Check if cache is still valid
      if (Date.now() - cache.timestamp < this.CACHE_DURATION) {
        allCachedTokens = allCachedTokens.concat(cache.tokens);
        validCaches++;
      } else {
        // Remove expired cache
        this.tokenCache.delete(key);
        expiredCaches++;
      }
    }
    
    this.logger.debug(`📦 Cache status: ${validCaches} valid, ${expiredCaches} expired, ${allCachedTokens.length} total tokens`);
    
    // Remove duplicates
    const uniqueTokens = Array.from(
      new Map(allCachedTokens.map(token => [token.mint, token])).values()
    );
    
    // Filter based on search query
    const filteredTokens = uniqueTokens.filter(token => {
      const nameMatch = token.name?.toLowerCase().includes(searchTerm);
      const symbolMatch = token.symbol?.toLowerCase().includes(searchTerm);
      const descriptionMatch = token.description?.toLowerCase().includes(searchTerm);
      
      return nameMatch || symbolMatch || descriptionMatch;
    });
    
    this.logger.debug(`📦 Cache search: Found ${filteredTokens.length} matches for "${query}"`);
    
    return filteredTokens.slice(0, limit);
  }

  /**
   * Get featured tokens (King of the Hill)
   */
  async getFeaturedTokens(limit = 20, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching featured tokens - limit: ${limit}, offset: ${offset}`);
      
      // Try to get King of the Hill tokens (featured)
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
        // Fallback to trending as featured
        this.logger.warn('Featured endpoint failed, using trending as fallback');
        return this.getTrendingTokens(limit, offset);
      }
    } catch (error) {
      this.logger.error('All featured token APIs failed:', error.message);
      // Try cache
      const cached = this.searchCachedTokens('', limit);
      return { data: cached };
    }
  }

  /**
   * Get trending tokens
   */
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
      
      // Cache the tokens for search fallback
      this.updateTokenCache('trending', data);
      
      this.logger.log(`Fetched ${data.length} trending tokens`);
      return { data };
    } catch (error) {
      this.logger.error('All trending token APIs failed:', error.message);
      // Try cache
      const cached = this.searchCachedTokens('', limit);
      return { data: cached };
    }
  }

  /**
   * Get new tokens
   */
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
      
      // Cache the tokens for search fallback
      this.updateTokenCache('new', data);
      
      this.logger.log(`Fetched ${data.length} new tokens`);
      return { data };
    } catch (error) {
      this.logger.error('All new token APIs failed:', error.message);
      // Try cache
      const cached = this.searchCachedTokens('', limit);
      return { data: cached };
    }
  }

  /**
   * Enhanced search with suggestions and related tokens - FIXED VERSION
   */
  async searchTokensAdvanced(query: string, limit = 20): Promise<SearchResult> {
    try {
      this.logger.log(`🔍 ============ ADVANCED SEARCH START ============`);
      this.logger.log(`Query: "${query}" | Limit: ${limit}`);
      
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

      // ========== 1. CHECK IF IT'S A CONTRACT ADDRESS ==========
      // CA can be full address or partial
      const looksLikeCa = /^[a-zA-Z0-9]{6,}$/.test(searchTerm) && 
                          !(/^[a-zA-Z]+$/.test(searchTerm)); // Not purely alphabetic
      
      if (looksLikeCa) {
        this.logger.log(`🔑 Detected possible Contract Address: ${searchTerm}`);
        results.searchType = 'ca';
        
        // Try exact match first (for any length CA)
        try {
          const tokenResult = await this.getTokenDetails(searchTerm);
          if (tokenResult.data) {
            this.logger.log(`✅ Found token by exact CA match`);
            results.data = [tokenResult.data];
            results.totalMatches = 1;
            return results;
          }
        } catch (err) {
          this.logger.debug(`No exact CA match for ${searchTerm}`);
        }
        
        // For partial CA, we'll search in the fetched tokens below
        this.logger.log(`📝 Will search for partial CA match: ${searchTerm}`);
      }

      // ========== 2. TRY DIRECT API SEARCH ==========
      try {
        this.logger.log(`[Method 1] Attempting direct API search for: "${query}"`);
        
        const searchEndpoints = [
          '/coins/search',
          '/search',
          '/tokens/search'
        ];

        for (const endpoint of searchEndpoints) {
          try {
            const data = await this.callFallbackAPI(endpoint, {
              q: query,
              query: query,
              search: query,
              limit: Math.min(limit * 2, 100), // Get more results for better matching
              includeNsfw: false,
            });
            
            if (data && data.length > 0) {
              this.logger.log(`✅ Found ${data.length} tokens via ${endpoint}`);
              
              // Process and sort the results properly
              const processedResults = this.rankSearchResults(data, searchTermLower, looksLikeCa);
              
              results.data = processedResults.exact.concat(
                processedResults.high,
                processedResults.medium,
                processedResults.low
              ).slice(0, limit);
              
              results.totalMatches = data.length;
              results.searchType = processedResults.exact.length > 0 ? 'exact' : 'fuzzy';
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

      // ========== 3. FALLBACK: FETCH MORE TOKENS AND SEARCH LOCALLY ==========
      this.logger.log(`[Method 2] Direct search failed. Fetching tokens for local search...`);
      
      // Fetch a larger pool of tokens for better search coverage
      const [trending, featured, newTokens] = await Promise.all([
        this.getTrendingTokens(200, 0).catch(() => ({ data: [] })),
        this.getFeaturedTokens(50, 0).catch(() => ({ data: [] })),
        this.getNewTokens(100, 0).catch(() => ({ data: [] })),
      ]);
      
      // Combine and deduplicate
      const allTokens = [...trending.data, ...featured.data, ...newTokens.data];
      const uniqueTokens = Array.from(
        new Map(allTokens.map(token => [token.mint, token])).values()
      );
      
      this.logger.log(`📦 Fetched ${uniqueTokens.length} unique tokens for local search`);

      // ========== 4. PERFORM LOCAL SEARCH WITH PROPER RANKING ==========
      const rankedResults = this.rankSearchResults(uniqueTokens, searchTermLower, looksLikeCa);
      
      // Combine results with proper priority
      results.data = rankedResults.exact.concat(
        rankedResults.high,
        rankedResults.medium,
        rankedResults.low
      ).slice(0, limit);
      
      results.totalMatches = rankedResults.exact.length + 
                            rankedResults.high.length + 
                            rankedResults.medium.length;
      
      results.relatedTokens = rankedResults.low.slice(0, 5);
      
      // Determine search type
      if (rankedResults.exact.length > 0) {
        results.searchType = 'exact';
      } else if (rankedResults.high.length > 0) {
        results.searchType = 'fuzzy';
      } else if (rankedResults.medium.length > 0) {
        results.searchType = 'partial';
      }

      // ========== 5. GENERATE SUGGESTIONS ==========
      if (results.data.length === 0) {
        // No matches found - generate suggestions from available tokens
        const suggestions = new Set<string>();
        
        uniqueTokens.slice(0, 50).forEach(token => {
          if (token.symbol && suggestions.size < 10) {
            suggestions.add(token.symbol);
          }
        });
        
        results.suggestions = Array.from(suggestions);
        this.logger.log(`💡 No matches. Generated ${results.suggestions.length} suggestions`);
      } else {
        // Found matches - suggest related tokens
        const suggestions = new Set<string>();
        
        results.data.slice(0, 5).forEach(token => {
          if (token.symbol && token.symbol.toLowerCase() !== searchTermLower) {
            suggestions.add(token.symbol);
          }
        });
        
        results.suggestions = Array.from(suggestions);
      }

      // ========== 6. LOG RESULTS ==========
      this.logger.log(`📊 Search Results Summary:`);
      this.logger.log(`  Query: "${query}"`);
      this.logger.log(`  Search Type: ${results.searchType}`);
      this.logger.log(`  Total Results: ${results.data.length}`);
      this.logger.log(`  Total Matches: ${results.totalMatches}`);
      
      if (results.data.length > 0) {
        this.logger.log(`  Top Results:`);
        results.data.slice(0, 3).forEach((token, i) => {
          this.logger.log(`    ${i + 1}. ${token.name} (${token.symbol})`);
        });
      }
      
      this.logger.log(`🔍 ============ ADVANCED SEARCH END ============`);
      
      return results;

    } catch (error) {
      this.logger.error(`❌ Advanced search failed for "${query}":`, error.message);
      
      // Last resort: Use cached tokens if available
      const cachedResults = this.searchCachedTokens(query, limit);
      
      return {
        data: cachedResults,
        searchType: 'fuzzy',
        totalMatches: cachedResults.length,
        suggestions: []
      };
    }
  }

  /**
   * Rank search results by relevance - NEW METHOD
   */
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
      let score = 0;
      let category: 'exact' | 'high' | 'medium' | 'low' | 'none' = 'none';
      
      // Contract Address matching (highest priority)
      if (isContractAddress) {
        const mintLower = token.mint.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        if (mintLower === searchLower) {
          // Exact CA match - absolute highest priority
          score = 10;
          category = 'exact';
        } else if (mintLower.startsWith(searchLower) || mintLower.endsWith(searchLower)) {
          // Partial CA match at start or end
          score = 8;
          category = 'high';
        } else if (mintLower.includes(searchLower)) {
          // CA contains search term
          score = 6;
          category = 'medium';
        }
      }
      
      // Skip other checks if we have a high CA match
      if (score < 8) {
        const nameLower = token.name?.toLowerCase() || '';
        const symbolLower = token.symbol?.toLowerCase() || '';
        const descLower = token.description?.toLowerCase() || '';
        
        // Exact Symbol match (very high priority)
        if (symbolLower === searchTerm) {
          score = Math.max(score, 9);
          category = 'exact';
        }
        // Exact Name match
        else if (nameLower === searchTerm) {
          score = Math.max(score, 8.5);
          category = 'exact';
        }
        // Symbol starts with search term
        else if (symbolLower.startsWith(searchTerm)) {
          score = Math.max(score, 7);
          category = 'high';
        }
        // Name starts with search term
        else if (nameLower.startsWith(searchTerm)) {
          score = Math.max(score, 6.5);
          category = 'high';
        }
        // Symbol contains search term
        else if (symbolLower.includes(searchTerm)) {
          score = Math.max(score, 5);
          category = 'medium';
        }
        // Name contains search term
        else if (nameLower.includes(searchTerm)) {
          score = Math.max(score, 4);
          category = 'medium';
        }
        // Description contains search term
        else if (descLower.includes(searchTerm)) {
          score = Math.max(score, 2);
          category = 'low';
        }
        
        // Multi-word search
        const searchWords = searchTerm.split(/\s+/);
        if (searchWords.length > 1) {
          const allWordsMatch = searchWords.every(word => 
            nameLower.includes(word) || 
            symbolLower.includes(word) || 
            descLower.includes(word)
          );
          if (allWordsMatch && score < 3) {
            score = 3;
            category = 'medium';
          }
        }
        
        // Fuzzy matching for typos (only if no better match)
        if (score < 2) {
          const nameScore = this.calculateSimilarity(nameLower, searchTerm);
          const symbolScore = this.calculateSimilarity(symbolLower, searchTerm);
          
          if (symbolScore > 0.8) {
            score = 3.5;
            category = 'medium';
          } else if (nameScore > 0.8) {
            score = 3;
            category = 'medium';
          } else if (symbolScore > 0.6 || nameScore > 0.6) {
            score = 1;
            category = 'low';
          }
        }
      }
      
      // Categorize token based on score
      switch (category) {
        case 'exact':
          exact.push(token);
          break;
        case 'high':
          high.push(token);
          break;
        case 'medium':
          medium.push(token);
          break;
        case 'low':
          low.push(token);
          break;
      }
    }
    
    // Sort each category by market cap (highest first)
    const sortByMarketCap = (a: PumpFunToken, b: PumpFunToken) => 
      (b.usd_market_cap || 0) - (a.usd_market_cap || 0);
    
    exact.sort(sortByMarketCap);
    high.sort(sortByMarketCap);
    medium.sort(sortByMarketCap);
    low.sort(sortByMarketCap);
    
    return { exact, high, medium, low };
  }

  /**
   * Standard search - wrapper for advanced search
   */
  async searchTokens(query: string, limit = 20): Promise<{ data: PumpFunToken[] }> {
    const advancedResults = await this.searchTokensAdvanced(query, limit);
    return { data: advancedResults.data };
  }

  /**
   * Get token details by mint address
   */
  async getTokenDetails(mint: string): Promise<{ data: PumpFunToken | null }> {
    try {
      this.logger.log(`Fetching token details for mint: ${mint}`);
      
      const data = await this.callFallbackAPI(`/coins/${mint}`, {});
      this.logger.log(`Fetched token details: ${data?.name || 'Unknown'}`);
      return { data };
    } catch (error) {
      this.logger.error(`Failed to fetch token details for ${mint}:`, error.message);
      return { data: null };
    }
  }

  /**
   * Get token trades
   */
  async getTokenTrades(mint: string, limit = 50, offset = 0): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching trades for token: ${mint} - limit: ${limit}, offset: ${offset}`);
      
      const data = await this.callFallbackAPI(`/trades/all/${mint}`, {
        offset,
        limit,
      });
      
      this.logger.log(`Fetched ${data.length} trades`);
      return { data };
    } catch (error) {
      this.logger.error(`Failed to fetch trades for ${mint}:`, error.message);
      return { data: [] };
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<{ data: MarketStats | null }> {
    try {
      this.logger.log('Fetching market statistics');
      
      // Fetch data from multiple endpoints concurrently
      const [trending, newTokens] = await Promise.all([
        this.getTrendingTokens(100, 0).catch(() => ({ data: [] })),
        this.getNewTokens(50, 0).catch(() => ({ data: [] })),
      ]);
      
      const allTokens = [...trending.data, ...newTokens.data];
      const uniqueTokens = Array.from(
        new Map(allTokens.map(token => [token.mint, token])).values()
      );
      
      // Calculate statistics
      const stats: MarketStats = {
        totalMarketCap: uniqueTokens.reduce((acc, token) => acc + (token.usd_market_cap || 0), 0),
        totalVolume24h: uniqueTokens.reduce((acc, token) => acc + (token.volume_24h || 0), 0),
        activeTokens: uniqueTokens.filter(token => token.is_currently_live).length,
        successfulGraduations: uniqueTokens.filter(token => token.complete).length,
        totalTokens: uniqueTokens.length,
        last24Hours: {
          newTokens: newTokens.data.length,
          volume: uniqueTokens.reduce((acc, token) => acc + (token.volume_24h || 0), 0),
          trades: 0, // Would need trades endpoint
        }
      };
      
      this.logger.log('Market stats calculated');
      return { data: stats };
    } catch (error) {
      this.logger.error('Failed to fetch market stats:', error.message);
      return { data: null };
    }
  }

  /**
   * Get SOL price
   */
  async getSolPrice(): Promise<{ data: { price: number } }> {
    try {
      this.logger.log('Fetching SOL price');
      
      // Try to get from PumpPortal first
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: 'solana',
            vs_currencies: 'usd'
          },
          timeout: 5000,
        });
        
        const price = response.data?.solana?.usd || 0;
        this.logger.log(`SOL price: $${price}`);
        return { data: { price } };
      } catch (error) {
        // Fallback to a default price
        this.logger.warn('Failed to fetch SOL price, using default');
        return { data: { price: 200 } };
      }
    } catch (error) {
      this.logger.error('Failed to fetch SOL price:', error.message);
      return { data: { price: 200 } };
    }
  }

  /**
   * Get latest trades across all tokens
   */
  async getLatestTrades(limit = 20): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching latest ${limit} trades`);
      
      const data = await this.callFallbackAPI('/trades/latest', {
        limit,
      });
      
      this.logger.log(`Fetched ${data.length} latest trades`);
      return { data };
    } catch (error) {
      this.logger.error('Failed to fetch latest trades:', error.message);
      return { data: [] };
    }
  }
}