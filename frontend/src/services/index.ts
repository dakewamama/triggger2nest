import { pumpService } from './pumpService';
import { tokensService } from './tokensService';
import { portfolioService } from './portfolioService';
import { apiClient } from './client';

export type {
  // Token types
  Token,
  PumpToken,
  
  // Trade types
  Trade,
  TokenTrade,
  
  // Market & stats
  MarketStats,
  
  // Search
  SearchResult,
  
  // Wallet & Portfolio
  WalletBalance,
  PortfolioToken,
  Portfolio,
  Transaction,
  
  // Pump.fun API
  CreateTokenDto,
  BuyTokenDto,
  SellTokenDto,
  TokenResponse,
  QuoteResponse,
  BuyTokenParams,
  SellTokenParams,
  
  // Dashboard
  DashboardData,
  
  // API Response
  ApiResponse,
  PaginatedResponse,
} from '../types';


export class ApiService {
  pump = pumpService;
  tokens = tokensService;
  portfolio = portfolioService;
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
   * Get complete portfolio with all token holdings
   */
  getPortfolio = async (walletAddress: string) => {
    return this.portfolio.getPortfolio(walletAddress);
  }
  
  /**
   * Get balance for a specific token
   */
  getTokenBalance = async (walletAddress: string, mintAddress: string) => {
    return this.portfolio.getTokenBalance(walletAddress, mintAddress);
  }
  
  /**
   * Get SOL balance for a wallet
   */
  getSolBalance = async (walletAddress: string) => {
    return this.portfolio.getSolBalance(walletAddress);
  }
  
  /**
   * Refresh portfolio after a trade
   */
  refreshAfterTrade = async (walletAddress: string, mintAddress: string) => {
    return this.portfolio.refreshAfterTrade(walletAddress, mintAddress);
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
export { portfolioService };
export { apiClient };