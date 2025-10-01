import { apiClient } from './client';

export interface PortfolioToken {
  mint: string;
  name: string;
  symbol: string;
  balance: number;
  decimals: number;
  image_uri?: string;
  price: number;
  value: number;
  priceChange24h: number;
  valueChange24h: number;
}

export interface Portfolio {
  tokens: PortfolioToken[];
  totalValue: number;
  totalChange24h: number;
  solBalance: number;
}

export interface Transaction {
  signature: string;
  timestamp: number;
  success: boolean;
  fee: number;
}

class PortfolioService {
  private readonly baseUrl = '/api/wallet';

  /**
   * Get complete portfolio for a wallet
   */
  async getPortfolio(walletAddress: string): Promise<Portfolio | null> {
    try {
      console.log('[PortfolioService] Fetching portfolio for:', walletAddress);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/${walletAddress}/portfolio`);
      
      if (data.success && data.data) {
        console.log('[PortfolioService] Portfolio loaded:', data.data);
        return data.data;
      }
      
      console.warn('[PortfolioService] No portfolio data');
      return null;
    } catch (error: any) {
      console.error('[PortfolioService] Failed to fetch portfolio:', error);
      return null;
    }
  }

  /**
   * Get balance for a specific token
   */
  async getTokenBalance(walletAddress: string, mintAddress: string): Promise<number> {
    try {
      const { data } = await apiClient.api.get(
        `${this.baseUrl}/${walletAddress}/token/${mintAddress}`
      );
      
      if (data.success && data.balance !== undefined) {
        return data.balance;
      }
      
      return 0;
    } catch (error: any) {
      console.error('[PortfolioService] Failed to fetch token balance:', error);
      return 0;
    }
  }

  /**
   * Get SOL balance
   */
  async getSolBalance(walletAddress: string): Promise<number> {
    try {
      const { data } = await apiClient.api.get(`${this.baseUrl}/${walletAddress}/balance`);
      
      if (data.success && data.balance !== undefined) {
        return data.balance;
      }
      
      return 0;
    } catch (error: any) {
      console.error('[PortfolioService] Failed to fetch SOL balance:', error);
      return 0;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    walletAddress: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    try {
      const { data } = await apiClient.api.get(
        `${this.baseUrl}/${walletAddress}/transactions`,
        { params: { limit } }
      );
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('[PortfolioService] Failed to fetch transactions:', error);
      return [];
    }
  }

  /**
   * Refresh portfolio after a trade
   */
  async refreshAfterTrade(walletAddress: string, mintAddress: string): Promise<{
    tokenBalance: number;
    portfolio: Portfolio | null;
  }> {
    try {
      console.log('[PortfolioService] Refreshing after trade...');
      
      // Wait a bit for blockchain to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const [tokenBalance, portfolio] = await Promise.all([
        this.getTokenBalance(walletAddress, mintAddress),
        this.getPortfolio(walletAddress),
      ]);
      
      return { tokenBalance, portfolio };
    } catch (error: any) {
      console.error('[PortfolioService] Failed to refresh:', error);
      return { tokenBalance: 0, portfolio: null };
    }
  }
}

export const portfolioService = new PortfolioService();
export default portfolioService;