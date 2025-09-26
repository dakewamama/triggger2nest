import { pumpService } from './pumpService';
import { tokensService } from './tokensService';
import { apiClient } from './client';

// Export types
export type {
  CreateTokenDto,
  BuyTokenDto,
  SellTokenDto,
  TokenResponse,
  QuoteResponse,
  WalletBalance
} from './pumpService';

export type {
  PumpToken,
  TokenTrade,
  MarketStats,
  SearchResult,
  DashboardData
} from './tokensService';

// ApiService class with arrow functions for better binding
export class ApiService {
  pump = pumpService;
  tokens = tokensService;
  client = apiClient;
  
  healthCheck = async () => {
    try {
      const { data } = await apiClient.api.get('/health');
      return data;
    } catch (error) {
      return { status: 'error', message: 'Backend offline' };
    }
  }
  
  // PUMP METHODS
  createToken = async (data: any, imageFile?: File) => {
    return this.pump.createToken(data, imageFile);
  }
  
  buyToken = async (params: any) => {
    return this.pump.buyToken(params);
  }
  
  sellToken = async (params: any) => {
    return this.pump.sellToken(params);
  }
  
  getQuote = async (mint: string, amount: number, action: 'buy' | 'sell') => {
    return this.pump.getQuote(mint, amount, action);
  }
  
  getTokenInfo = async (mintAddress: string) => {
    return this.pump.getTokenInfo(mintAddress);
  }
  
  getWalletBalances = async (walletAddress: string) => {
    return this.pump.getWalletBalances(walletAddress);
  }
  
  getTransactionHistory = async (walletAddress: string, limit = 50) => {
    return this.pump.getTransactionHistory(walletAddress, limit);
  }
  
  // TOKEN METHODS
  getTrendingTokens = async (limit = 50, offset = 0) => {
    return this.tokens.getTrendingTokens(limit, offset);
  }
  
  getFeaturedTokens = async (limit = 20, offset = 0) => {
    return this.tokens.getFeaturedTokens(limit, offset);
  }
  
  getNewTokens = async (limit = 50, offset = 0) => {
    return this.tokens.getNewTokens(limit, offset);
  }
  
  getMarketStats = async () => {
    return this.tokens.getMarketStats();
  }
  
  getLatestTrades = async (limit = 20) => {
    return this.tokens.getLatestTrades(limit);
  }
  
  searchTokens = async (query: string, filters?: any) => {
    return this.tokens.searchTokens(query, filters);
  }
  
  getTokenDetails = async (mintAddress: string) => {
    return this.tokens.getTokenDetails(mintAddress);
  }
  
  getTokenTrades = async (mintAddress: string, limit = 50, _offset = 0) => {
    return this.tokens.getTokenTrades(mintAddress, limit);
  }
  
  getDashboardData = async () => {
    return this.tokens.getDashboardData();
  }
}

const apiService = new ApiService();

export default apiService;
export { apiService };
export const api = apiService;
export { pumpService };
export { tokensService };
export { apiClient };
