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
  
  // Updated API configurations with working endpoints
  private readonly API_CONFIGS = [
    {
      name: 'pump.fun v3',
      baseUrl: 'https://frontend-api.pump.fun',
      endpoints: {
        coins: '/coins',
        coinDetails: '/coins',
        search: '/coins',
        trades: '/trades',
        kingOfHill: '/coins/king-of-the-hill'
      }
    },
    {
      name: 'pump.fun v2',
      baseUrl: 'https://frontend-api-v2.pump.fun',
      endpoints: {
        coins: '/coins',
        coinDetails: '/coins',
        search: '/coins',
        trades: '/trades'
      }
    },
    {
      name: 'pump.fun v1',
      baseUrl: 'https://frontend-api.pump.fun',
      endpoints: {
        coins: '/coins',
        coinDetails: '/coins',
        search: '/coins',
        trades: '/trades'
      }
    }
  ];

  // PumpPortal configuration with correct endpoints
  private readonly PUMPPORTAL_CONFIG = {
    name: 'PumpPortal',
    baseUrl: 'https://pumpportal.fun/api',
    endpoints: {
      coins: '/coins',
      coinDetails: '/coins',
      trades: '/trades',
      stats: '/stats'
    }
  };

  // Cache for tokens
  private tokenCache: Map<string, { tokens: PumpFunToken[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Enhanced API caller with proper error handling and success detection
   */
  private async callAPI(config: any, endpoint: string, params: any = {}): Promise<any> {
    const url = `${config.baseUrl}${endpoint}`;
    
    try {
      this.logger.log(`Attempting ${config.name}: ${url}`);
      
      const response = await axios.get(url, {
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PumpFunController/1.0',
          'Origin': 'https://pump.fun',
          'Referer': 'https://pump.fun/'
        },
        validateStatus: (status) => {
          // Accept 200-299 as success
          return status >= 200 && status < 300;
        }
      });

      // Check if response has data
      if (response.status === 200 && response.data) {
        this.logger.log(`✅ ${config.name} succeeded with ${JSON.stringify(response.data).length} chars`);
        return response.data;
      } else {
        throw new Error(`Invalid response: status ${response.status}, no data`);
      }

    } catch (error) {
      if (error.response) {
        this.logger.warn(`❌ ${config.name} failed: ${error.response.status} - ${error.message}`);
        throw new Error(`${error.response.status} - ${error.message}`);
      } else if (error.request) {
        this.logger.warn(`❌ ${config.name} failed: Network error - ${error.message}`);
        throw new Error(`Network error - ${error.message}`);
      } else {
        this.logger.warn(`❌ ${config.name} failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Try multiple APIs with fallback logic
   */
  private async callWithFallback(endpoint: string, params: any = {}): Promise<any> {
    const errors: string[] = [];

    // Try main pump.fun APIs first
    for (const config of this.API_CONFIGS) {
      try {
        if (config.endpoints[endpoint.replace('/', '')]) {
          const result = await this.callAPI(config, config.endpoints[endpoint.replace('/', '')], params);
          return result;
        }
      } catch (error) {
        errors.push(`${config.name}: ${error.message}`);
        continue;
      }
    }

    // Try PumpPortal as fallback
    try {
      this.logger.log(`Attempting PumpPortal: ${this.PUMPPORTAL_CONFIG.baseUrl}`);
      
      // PumpPortal has different endpoint structure
      const pumpPortalEndpoint = this.PUMPPORTAL_CONFIG.endpoints[endpoint.replace('/', '')] || endpoint;
      const result = await this.callAPI(this.PUMPPORTAL_CONFIG, pumpPortalEndpoint, params);
      return result;
    } catch (error) {
      errors.push(`PumpPortal: ${error.message}`);
    }

    // All APIs failed
    this.logger.error(`❌ All APIs failed for ${endpoint}:`);
    errors.forEach(error => this.logger.error(`  - ${error}`));
    throw new Error(`All APIs failed. Last errors: ${errors.join('; ')}`);
  }

  /**
   * Health check for all APIs
   */
  async checkAPIHealth(): Promise<{ [key: string]: boolean }> {
    this.logger.log('🔍 Performing API health check...');
    
    const health: { [key: string]: boolean } = {};

    // Check pump.fun APIs
    for (const config of this.API_CONFIGS) {
      try {
        await this.callAPI(config, '/coins', { limit: 1 });
        health[config.name] = true;
        this.logger.log(`✅ ${config.name} is healthy`);
      } catch (error) {
        health[config.name] = false;
        this.logger.warn(`❌ ${config.name} is down: ${error.message}`);
      }
    }

    // Check PumpPortal
    try {
      await this.callAPI(this.PUMPPORTAL_CONFIG, '/coins', { limit: 1 });
      health[this.PUMPPORTAL_CONFIG.name] = true;
      this.logger.log(`✅ ${this.PUMPPORTAL_CONFIG.name} is healthy`);
    } catch (error) {
      health[this.PUMPPORTAL_CONFIG.name] = false;
      this.logger.warn(`❌ ${this.PUMPPORTAL_CONFIG.name} is down: ${error.message}`);
    }

    return health;
  }

  /**
   * Calculate string similarity score (Levenshtein distance)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
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
    
    for (const [key, cache] of this.tokenCache.entries()) {
      if (Date.now() - cache.timestamp < this.CACHE_DURATION) {
        allCachedTokens = allCachedTokens.concat(cache.tokens);
        validCaches++;
      } else {
        this.tokenCache.delete(key);
        expiredCaches++;
      }
    }
    
    this.logger.debug(`📦 Cache status: ${validCaches} valid, ${expiredCaches} expired, ${allCachedTokens.length} total tokens`);
    
    const uniqueTokens = Array.from(
      new Map(allCachedTokens.map(token => [token.mint, token])).values()
    );
    
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
      
      try {
        const data = await this.callWithFallback('kingOfHill', {
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

  /**
   * Get trending tokens
   */
  async getTrendingTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching trending tokens - limit: ${limit}, offset: ${offset}`);
      
      const data = await this.callWithFallback('coins', {
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

  /**
   * Get new tokens
   */
  async getNewTokens(limit = 50, offset = 0): Promise<{ data: PumpFunToken[] }> {
    try {
      this.logger.log(`Fetching new tokens - limit: ${limit}, offset: ${offset}`);
      
      const data = await this.callWithFallback('coins', {
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

  /**
   * Enhanced search with suggestions and related tokens
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

      const searchTerm = query.trim().toLowerCase();
      const results: SearchResult = {
        data: [],
        suggestions: [],
        relatedTokens: [],
        searchType: 'exact',
        totalMatches: 0
      };

      // Check if it's a contract address
      const looksLikeCa = /^[a-zA-Z0-9]{32,44}$/.test(searchTerm) || 
                          (/^[a-zA-Z0-9]{6,}$/.test(searchTerm) && searchTerm.length > 10);
      
      if (looksLikeCa) {
        this.logger.log(`🔑 Detected possible Contract Address: ${searchTerm}`);
        results.searchType = 'ca';
        
        if (searchTerm.length >= 32) {
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
        }
      }

      // Try direct API search first
      try {
        this.logger.log(`[Method 1] Attempting direct API search for: "${query}"`);
        
        // Try search endpoint
        try {
          const searchData = await this.callWithFallback('search', {
            q: query,
            query: query,
            search: query,
            limit,
            includeNsfw: false,
          });
          
          if (searchData && searchData.length > 0) {
            this.logger.log(`✅ Found ${searchData.length} tokens via search endpoint`);
            results.data = searchData.slice(0, limit);
            results.totalMatches = searchData.length;
            results.searchType = 'exact';
            return results;
          }
        } catch (searchError) {
          this.logger.debug(`Search endpoint failed: ${searchError.message}`);
        }
      } catch (apiError) {
        this.logger.warn(`Direct API search failed for "${query}": ${apiError.message}`);
      }

      // Fetch and filter approach
      this.logger.log(`📊 Using fetch-and-filter search for: "${query}"`);
      
      const fetchPromises = [];
      
      // Fetch multiple pages
      for (let page = 0; page < 3; page++) {
        fetchPromises.push(
          this.callWithFallback('coins', { 
            limit: 200, 
            offset: page * 200,
            includeNsfw: false,
            sort: 'market_cap',
            order: 'DESC'
          }).catch(err => {
            this.logger.debug(`Page ${page} (market_cap) failed: ${err.message}`);
            return [];
          })
        );
      }
      
      // Also fetch newest tokens
      fetchPromises.push(
        this.callWithFallback('coins', { 
          limit: 100, 
          offset: 0,
          includeNsfw: false,
          sort: 'created_timestamp',
          order: 'DESC'
        }).catch(err => {
          this.logger.debug(`New tokens fetch failed: ${err.message}`);
          return [];
        })
      );

      this.logger.log(`Fetching ${fetchPromises.length} pages of tokens...`);
      const fetchResults = await Promise.allSettled(fetchPromises);
      
      let allTokens: PumpFunToken[] = [];
      
      for (const result of fetchResults) {
        if (result.status === 'fulfilled' && result.value) {
          allTokens = allTokens.concat(result.value);
        }
      }

      const uniqueTokens = Array.from(
        new Map(allTokens.map(token => [token.mint, token])).values()
      );
      
      this.logger.log(`✅ Fetched ${uniqueTokens.length} unique tokens from API`);

      // Perform local search
      const exactMatches: PumpFunToken[] = [];
      const fuzzyMatches: PumpFunToken[] = [];
      const partialMatches: PumpFunToken[] = [];
      const relatedTokens: PumpFunToken[] = [];

      const tokenScores = new Map<string, { token: PumpFunToken, score: number, matchType: string }>();

      for (const token of uniqueTokens) {
        let bestScore = 0;
        let matchType = 'none';
        
        // CA matching
        if (looksLikeCa) {
          const mintLower = token.mint.toLowerCase();
          if (mintLower === searchTerm) {
            bestScore = 1.2;
            matchType = 'ca_exact';
          } else if (mintLower.startsWith(searchTerm) || mintLower.endsWith(searchTerm)) {
            bestScore = 0.95;
            matchType = 'ca_partial';
          } else if (mintLower.includes(searchTerm)) {
            bestScore = 0.9;
            matchType = 'ca_contains';
          }
        }
        
        // Name matching
        const nameLower = token.name?.toLowerCase() || '';
        const nameScore = this.calculateSimilarity(nameLower, searchTerm);
        
        if (nameLower === searchTerm) {
          bestScore = Math.max(bestScore, 1);
          matchType = bestScore === 1 ? 'exact_name' : matchType;
        } else if (nameLower.includes(searchTerm)) {
          bestScore = Math.max(bestScore, 0.8);
          matchType = matchType === 'none' ? 'partial_name' : matchType;
        } else if (nameScore > 0.7) {
          bestScore = Math.max(bestScore, nameScore * 0.9);
          matchType = matchType === 'none' ? 'fuzzy_name' : matchType;
        }
        
        // Symbol matching
        const symbolLower = token.symbol?.toLowerCase() || '';
        const symbolScore = this.calculateSimilarity(symbolLower, searchTerm);
        
        if (symbolLower === searchTerm) {
          bestScore = Math.max(bestScore, 1.1);
          matchType = bestScore === 1.1 ? 'exact_symbol' : matchType;
        } else if (symbolLower.includes(searchTerm)) {
          bestScore = Math.max(bestScore, 0.85);
          matchType = matchType === 'none' ? 'partial_symbol' : matchType;
        } else if (symbolScore > 0.7) {
          bestScore = Math.max(bestScore, symbolScore * 0.95);
          matchType = matchType === 'none' ? 'fuzzy_symbol' : matchType;
        }
        
        // Description matching
        const descLower = token.description?.toLowerCase() || '';
        if (descLower.includes(searchTerm)) {
          bestScore = Math.max(bestScore, 0.6);
          matchType = matchType === 'none' ? 'description' : matchType;
        }
        
        // Multi-word search
        const searchWords = searchTerm.split(/\s+/);
        if (searchWords.length > 1) {
          const allWordsMatch = searchWords.every(word => 
            nameLower.includes(word) || symbolLower.includes(word) || descLower.includes(word)
          );
          if (allWordsMatch) {
            bestScore = Math.max(bestScore, 0.75);
            matchType = matchType === 'none' ? 'multi_word' : matchType;
          }
        }
        
        if (bestScore > 0.5) {
          tokenScores.set(token.mint, { token, score: bestScore, matchType });
          
          if (bestScore >= 1) {
            exactMatches.push(token);
          } else if (bestScore >= 0.8) {
            fuzzyMatches.push(token);
          } else if (bestScore >= 0.6) {
            partialMatches.push(token);
          } else {
            relatedTokens.push(token);
          }
        }
      }

      // Sort by market cap
      const sortByMarketCap = (a: PumpFunToken, b: PumpFunToken) => 
        (b.usd_market_cap || 0) - (a.usd_market_cap || 0);
      
      exactMatches.sort(sortByMarketCap);
      fuzzyMatches.sort(sortByMarketCap);
      partialMatches.sort(sortByMarketCap);
      relatedTokens.sort(sortByMarketCap);
      
      // Combine results
      results.data = [
        ...exactMatches.slice(0, Math.min(10, limit)),
        ...fuzzyMatches.slice(0, Math.min(5, limit - exactMatches.length)),
        ...partialMatches.slice(0, Math.max(0, limit - exactMatches.length - fuzzyMatches.length))
      ];
      
      results.totalMatches = exactMatches.length + fuzzyMatches.length + partialMatches.length;
      results.relatedTokens = relatedTokens.slice(0, 5);
      
      if (exactMatches.length > 0) {
        results.searchType = 'exact';
      } else if (fuzzyMatches.length > 0) {
        results.searchType = 'fuzzy';
      } else if (partialMatches.length > 0) {
        results.searchType = 'partial';
      }

      // Generate suggestions
      if (results.data.length === 0) {
        const suggestions = new Set<string>();
        
        const firstChar = searchTerm.charAt(0);
        const similarTokens = uniqueTokens.filter(token => 
          token.name?.toLowerCase().startsWith(firstChar) ||
          token.symbol?.toLowerCase().startsWith(firstChar)
        ).slice(0, 20);
        
        similarTokens.forEach(token => {
          if (token.name && suggestions.size < 10) {
            suggestions.add(token.name);
          }
          if (token.symbol && suggestions.size < 10) {
            suggestions.add(token.symbol);
          }
        });
        
        results.suggestions = Array.from(suggestions);
        
        this.logger.log(`💡 No exact matches. Generated ${results.suggestions.length} suggestions`);
      } else {
        const suggestions = new Set<string>();
        
        results.data.slice(0, 5).forEach(token => {
          if (token.symbol && token.symbol.toLowerCase() !== searchTerm) {
            suggestions.add(token.symbol);
          }
        });
        
        relatedTokens.slice(0, 5).forEach(token => {
          if (token.name && suggestions.size < 8) {
            suggestions.add(token.name);
          }
        });
        
        results.suggestions = Array.from(suggestions);
      }

      this.logger.log(`📊 Search Results Summary:`);
      this.logger.log(`  Query: "${query}"`);
      this.logger.log(`  Search Type: ${results.searchType}`);
      this.logger.log(`  Exact Matches: ${exactMatches.length}`);
      this.logger.log(`  Fuzzy Matches: ${fuzzyMatches.length}`);
      this.logger.log(`  Partial Matches: ${partialMatches.length}`);
      this.logger.log(`  Related Tokens: ${relatedTokens.length}`);
      this.logger.log(`  Total Results: ${results.data.length}`);
      
      if (results.data.length > 0) {
        this.logger.log(`  Top Results:`);
        results.data.slice(0, 3).forEach((token, i) => {
          const scoreInfo = tokenScores.get(token.mint);
          this.logger.log(`    ${i + 1}. ${token.name} (${token.symbol})`);
          this.logger.log(`       Match: ${scoreInfo?.matchType} | Score: ${scoreInfo?.score?.toFixed(2)}`);
        });
      }
      
      this.logger.log(`🔍 ============ ADVANCED SEARCH END ============`);
      
      return results;

    } catch (error) {
      this.logger.error(`❌ Advanced search failed for "${query}": ${error.message}`);
      
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
   * Standard search wrapper
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
      
      const data = await this.callWithFallback('coinDetails', { mint });
      this.logger.log(`Fetched token details: ${data?.name || 'Unknown'}`);
      return { data };
    } catch (error) {
      this.logger.error(`Failed to fetch token details for ${mint}: ${error.message}`);
      return { data: null };
    }
  }

  /**
   * Get token trades
   */
  async getTokenTrades(mint: string, limit = 50, offset = 0): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching trades for token: ${mint} - limit: ${limit}, offset: ${offset}`);
      
      const data = await this.callWithFallback('trades', {
        mint,
        offset,
        limit,
      });
      
      this.logger.log(`Fetched ${data.length} trades for token: ${mint}`);
      return { data };
    } catch (error) {
      this.logger.warn(`No trades found for token ${mint}: ${error.message}`);
      return { data: [] };
    }
  }

  /**
   * Get latest trades across all tokens
   */
  async getLatestTrades(limit = 100): Promise<{ data: TokenTrade[] }> {
    try {
      this.logger.log(`Fetching latest trades - limit: ${limit}`);
      
      const data = await this.callWithFallback('trades', { limit });
      this.logger.log(`Fetched ${data.length} latest trades`);
      return { data };
    } catch (error) {
      this.logger.warn(`No latest trades available: ${error.message}`);
      return { data: [] };
    }
  }

  /**
   * Get SOL price from CoinGecko
   */
  async getSolPrice(): Promise<{ data: { price: number } }> {
    try {
      this.logger.log('Fetching SOL price');
      
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
          timeout: 5000,
        });
        
        const price = response.data?.solana?.usd || 0;
        this.logger.log(`SOL price from CoinGecko: $${price}`);
        return { data: { price } };
      } catch (coinGeckoError) {
        this.logger.warn('CoinGecko failed, using fallback price');
        return { data: { price: 100 } };
      }
    } catch (error) {
      this.logger.error('Failed to fetch SOL price:', error.message);
      return { data: { price: 100 } };
    }
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<{ data: MarketStats }> {
    try {
      this.logger.log('Calculating market stats from real token data');
      
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
      
      const oneDayAgo = Date.now() / 1000 - 86400;
      const newTokensLast24h = tokens.filter(token => 
        token.created_timestamp > oneDayAgo
      ).length;
      
      const stats: MarketStats = {
        totalMarketCap,
        totalVolume24h,
        activeTokens,
        successfulGraduations,
        totalTokens: tokens.length,
        last24Hours: {
          newTokens: newTokensLast24h,
          volume: totalVolume24h,
          trades: 0
        }
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