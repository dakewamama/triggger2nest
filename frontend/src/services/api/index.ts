import { pumpService } from './pumpService';
import { tokensService } from './tokensService';
import { apiClient } from './client';

// Export types from pumpService
export type {
  CreateTokenDto,
  BuyTokenDto,
  SellTokenDto,
  TokenResponse,
  QuoteResponse,
  WalletBalance,
  BuyTokenParams,
  SellTokenParams
} from './pumpService';

// Export types from tokensService
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
  
  
  /**
   * Create a new token on pump.fun
   * For local development, no IPFS needed - uses data URIs
   */
  createToken = async (data: any) => {
    return this.pump.createToken(data);
  }
  
  /**
   * Send a signed transaction to the network
   */
  sendSignedTransaction = async (data: { transaction: string }) => {
    return this.pump.sendSignedTransaction(data);
  }
  
  /**
   * Wait for transaction confirmation
   */
  waitForConfirmation = async (signature: string, connection: any) => {
    return this.pump.waitForConfirmation(signature, connection);
  }
  
  /**
   * Buy tokens from pump.fun
   */
  buyToken = async (params: any) => {
    return this.pump.buyToken(params);
  }
  
  /**
   * Sell tokens on pump.fun
   */
  sellToken = async (params: any) => {
    return this.pump.sellToken(params);
  }
  
  /**
   * Get price quote for buy/sell
   */
  getQuote = async (mint: string, amount: number, action: 'buy' | 'sell') => {
    return this.pump.getQuote(mint, amount, action);
  }
  
  /**
   * Get token information by mint address
   */
  getTokenInfo = async (mintAddress: string) => {
    return this.pump.getTokenInfo(mintAddress);
  }
  
  /**
   * Get wallet balances
   */
  getWalletBalances = async (walletAddress: string) => {
    return this.pump.getWalletBalances(walletAddress);
  }
  
  /**
   * Get transaction history for a wallet
   */
  getTransactionHistory = async (walletAddress: string, limit = 50) => {
    return this.pump.getTransactionHistory(walletAddress, limit);
  }
  
  /**
   * Get trending tokens
   */
  getTrendingTokens = async (limit = 50, offset = 0) => {
    return this.tokens.getTrendingTokens(limit, offset);
  }
  
  /**
   * Get featured tokens
   */
  getFeaturedTokens = async (limit = 20, offset = 0) => {
    return this.tokens.getFeaturedTokens(limit, offset);
  }
  
  /**
   * Get newest tokens
   */
  getNewTokens = async (limit = 50, offset = 0) => {
    return this.tokens.getNewTokens(limit, offset);
  }
  
  /**
   * Get market statistics
   */
  getMarketStats = async () => {
    return this.tokens.getMarketStats();
  }
  
  /**
   * Get latest trades across all tokens
   */
  getLatestTrades = async (limit = 20) => {
    return this.tokens.getLatestTrades(limit);
  }
  
  /**
   * Search for tokens
   */
  searchTokens = async (query: string, filters?: any) => {
    return this.tokens.searchTokens(query, filters);
  }
  
  /**
   * Get detailed token information
   */
  getTokenDetails = async (mintAddress: string) => {
    return this.tokens.getTokenDetails(mintAddress);
  }
  
  /**
   * Get trades for a specific token
   */
  getTokenTrades = async (mintAddress: string, limit = 50, _offset = 0) => {
    return this.tokens.getTokenTrades(mintAddress, limit);
  }
  
  /**
   * Get dashboard data (featured, trending, new tokens + stats)
   */
  getDashboardData = async () => {
    return this.tokens.getDashboardData();
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export in multiple ways for convenience
export default apiService;
export { apiService };
export const api = apiService;

// Also export individual services if needed
export { pumpService };
export { tokensService };
export { apiClient };