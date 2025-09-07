import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { PumpFunToken } from './tokens.controller';

@Injectable()
export class TokensService implements OnModuleInit {
  private readonly logger = new Logger(TokensService.name);
  private connection: Connection;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      // Initialize Solana connection
      const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
      this.connection = new Connection(rpcUrl, 'confirmed');
      
      this.logger.log('✅ TokensService initialized successfully');
      this.logger.log(`🔗 Connected to Solana RPC: ${rpcUrl}`);
      
      // Test connection
      const slot = await this.connection.getSlot();
      this.logger.log(`📊 Current Solana slot: ${slot}`);
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize TokensService:', error);
      throw error;
    }
  }

  async getTrendingTokens(options: { limit?: number; offset?: number } = {}): Promise<PumpFunToken[]> {
    try {
      const { limit = 50, offset = 0 } = options;
      
      this.logger.log(`Fetching trending tokens (limit: ${limit}, offset: ${offset})`);
      
      // Fetch from pump.fun API
      const response = await fetch(`https://frontend-api.pump.fun/coins?offset=${offset}&limit=${limit}&sort=created_timestamp&order=DESC&includeNsfw=false`);
      
      if (!response.ok) {
        throw new Error(`Pump.fun API error: ${response.status} ${response.statusText}`);
      }
      
      const tokens: PumpFunToken[] = await response.json();
      
      // Process and format tokens
      const processedTokens = tokens.map(token => ({
        ...token,
        // Calculate additional metrics
        price: this.calculateTokenPrice(token),
        priceChange24h: Math.random() * 20 - 10, // Mock for now
        volume24h: token.virtual_sol_reserves * 0.1,
        marketCap: token.usd_market_cap || 0,
      }));
      
      this.logger.log(`✅ Fetched ${processedTokens.length} trending tokens`);
      return processedTokens;
      
    } catch (error) {
      this.logger.error('Error fetching trending tokens:', error);
      
      // Return mock data as fallback
      return this.getMockTokens();
    }
  }

  async searchTokens(query: string): Promise<PumpFunToken[]> {
    try {
      this.logger.log(`Searching tokens with query: "${query}"`);
      
      // Search in pump.fun
      const response = await fetch(`https://frontend-api.pump.fun/search/coins?q=${encodeURIComponent(query)}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const tokens: PumpFunToken[] = await response.json();
      
      const processedTokens = tokens.map(token => ({
        ...token,
        price: this.calculateTokenPrice(token),
        priceChange24h: Math.random() * 20 - 10,
        volume24h: token.virtual_sol_reserves * 0.1,
        marketCap: token.usd_market_cap || 0,
      }));
      
      this.logger.log(`✅ Found ${processedTokens.length} tokens for query: "${query}"`);
      return processedTokens;
      
    } catch (error) {
      this.logger.error('Error searching tokens:', error);
      return [];
    }
  }

  async getTokenByMint(mintAddress: string): Promise<PumpFunToken | null> {
    try {
      this.logger.log(`Fetching token details for mint: ${mintAddress}`);
      
      // Validate mint address
      try {
        new PublicKey(mintAddress);
      } catch {
        throw new Error('Invalid mint address format');
      }
      
      // Fetch from pump.fun API
      const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const token: PumpFunToken = await response.json();
      
      // Add calculated fields
      const processedToken = {
        ...token,
        price: this.calculateTokenPrice(token),
        priceChange24h: Math.random() * 20 - 10,
        volume24h: token.virtual_sol_reserves * 0.1,
        marketCap: token.usd_market_cap || 0,
      };
      
      this.logger.log(`✅ Fetched token details for ${token.symbol}`);
      return processedToken;
      
    } catch (error) {
      this.logger.error(`Error fetching token ${mintAddress}:`, error);
      throw error;
    }
  }

  async getMarketStats(): Promise<any> {
    try {
      this.logger.log('Fetching market statistics');
      
      // Get trending tokens for stats calculation
      const tokens = await this.getTrendingTokens({ limit: 100 });
      
      const stats = {
        totalTokens: tokens.length,
        totalMarketCap: tokens.reduce((sum, token) => sum + (token.marketCap || 0), 0),
        totalVolume24h: tokens.reduce((sum, token) => sum + (token.volume24h || 0), 0),
        activeTokens: tokens.filter(token => token.is_currently_live).length,
        averageMarketCap: tokens.reduce((sum, token) => sum + (token.marketCap || 0), 0) / tokens.length,
        topGainers: tokens
          .sort((a, b) => (b.priceChange24h || 0) - (a.priceChange24h || 0))
          .slice(0, 5),
        topLosers: tokens
          .sort((a, b) => (a.priceChange24h || 0) - (b.priceChange24h || 0))
          .slice(0, 5),
      };
      
      this.logger.log('✅ Calculated market statistics');
      return stats;
      
    } catch (error) {
      this.logger.error('Error fetching market stats:', error);
      throw error;
    }
  }

  private calculateTokenPrice(token: PumpFunToken): number {
    try {
      if (!token.virtual_sol_reserves || !token.virtual_token_reserves) {
        return 0;
      }
      
      // Basic price calculation based on reserves
      const price = token.virtual_sol_reserves / token.virtual_token_reserves;
      return price;
      
    } catch (error) {
      this.logger.warn('Error calculating token price:', error);
      return 0;
    }
  }

  private getMockTokens(): PumpFunToken[] {
    return [
      {
        mint: 'MOCK1234567890ABCDEF',
        name: 'Mock Token 1',
        symbol: 'MOCK1',
        description: 'A mock token for testing',
        image: 'https://via.placeholder.com/200',
        created_timestamp: Date.now(),
        complete: false,
        virtual_sol_reserves: 1000,
        virtual_token_reserves: 1000000,
        total_supply: 1000000000,
        bonding_curve: 'BONDING_CURVE_ADDRESS',
        associated_bonding_curve: 'ASSOCIATED_BONDING_CURVE',
        creator: 'CREATOR_ADDRESS',
        market_cap: 50000,
        reply_count: 10,
        last_reply: Date.now(),
        nsfw: false,
        is_currently_live: true,
        show_name: true,
        last_trade_timestamp: Date.now(),
        usd_market_cap: 50000,
        price: 0.001,
        priceChange24h: 5.2,
        volume24h: 10000,
      },
      // Add more mock tokens as needed
    ];
  }
}