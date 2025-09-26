// frontend/src/services/api/pumpService.ts
import { apiClient } from './client';

export interface CreateTokenDto {
  name: string;
  symbol: string;
  description: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  publicKey: string;
}

export interface BuyTokenDto {
  mint: string;
  publicKey: string;
  amount: number;
  solAmount: number;
  slippage?: number;
  priorityFee?: number;
}

export interface SellTokenDto {
  mint: string;
  publicKey: string;
  amount: number;
  slippage?: number;
  priorityFee?: number;
}

export interface TokenResponse {
  success: boolean;
  signature?: string;
  error?: string;
  data?: any;
  transaction?: string;
  mintAddress?: string;
}

export interface QuoteResponse {
  mint: string;
  action: 'buy' | 'sell';
  amount: number;
  estimatedPrice: number;
  estimatedSolAmount: number;
  estimatedTokenAmount: number;
  virtualSolReserves: number;
  virtualTokenReserves: number;
  timestamp: number;
}

export interface WalletBalance {
  solBalance: number;
  tokenBalances: Array<{
    mint: string;
    amount: number;
    decimals: number;
    uiAmount: number;
  }>;
  portfolioValue: number;
}

class PumpService {
  private readonly baseUrl = '/pump';
  
  /**
   * Health check for the pump service
   */
  async healthCheck(): Promise<any> {
    try {
      const { data } = await apiClient.api.get(`${this.baseUrl}/health`);
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
  
  /**
   * Create a new token
   */
  async createToken(dto: CreateTokenDto, imageFile?: File): Promise<TokenResponse> {
    try {
      console.log('Creating token:', dto.name);
      
      const formData = new FormData();
      Object.entries(dto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await apiClient.api.post(`${this.baseUrl}/create-token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!data.success) {
        throw new Error(data.error || 'Token creation failed');
      }

      return data;
    } catch (error: any) {
      console.error('Create token error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Token creation failed');
    }
  }

  /**
   * Buy a token
   */
  async buyToken(dto: BuyTokenDto): Promise<TokenResponse> {
    try {
      console.log('Buying token:', dto.mint);
      
      // Ensure defaults
      const requestData = {
        ...dto,
        slippage: dto.slippage || 1,
        priorityFee: dto.priorityFee || 0.00001,
      };

      const { data } = await apiClient.api.post(`${this.baseUrl}/buy-token`, requestData);

      if (!data.success) {
        throw new Error(data.error || 'Buy transaction failed');
      }

      return data;
    } catch (error: any) {
      console.error('Buy token error:', error);
      
      // Check if wallet is not connected
      if (error.response?.data?.error?.includes('wallet')) {
        throw new Error('Please connect your wallet to buy tokens');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Buy transaction failed');
    }
  }

  /**
   * Sell a token
   */
  async sellToken(dto: SellTokenDto): Promise<TokenResponse> {
    try {
      console.log('Selling token:', dto.mint);
      
      // Ensure defaults
      const requestData = {
        ...dto,
        slippage: dto.slippage || 1,
        priorityFee: dto.priorityFee || 0.00001,
      };

      const { data } = await apiClient.api.post(`${this.baseUrl}/sell-token`, requestData);

      if (!data.success) {
        throw new Error(data.error || 'Sell transaction failed');
      }

      return data;
    } catch (error: any) {
      console.error('Sell token error:', error);
      
      // Check if wallet is not connected
      if (error.response?.data?.error?.includes('wallet')) {
        throw new Error('Please connect your wallet to sell tokens');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Sell transaction failed');
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(mintAddress: string): Promise<TokenResponse> {
    try {
      const { data } = await apiClient.api.get(`${this.baseUrl}/token-info/${mintAddress}`);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get token info');
      }
      
      return data;
    } catch (error: any) {
      console.error('Failed to get token info:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get token info');
    }
  }

  /**
   * Get quote for buying or selling
   */
  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<TokenResponse> {
    try {
      const { data } = await apiClient.api.get(`${this.baseUrl}/quote/${mint}`, {
        params: { amount, action }
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get quote');
      }
      
      return data;
    } catch (error: any) {
      console.error('Failed to get quote:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to get quote');
    }
  }

  /**
   * Get wallet balances
   */
  async getWalletBalances(walletAddress: string): Promise<{ success: boolean; data: WalletBalance }> {
    try {
      console.log(`Fetching wallet balances for: ${walletAddress}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/wallet/${walletAddress}/balances`);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get wallet balances');
      }
      
      return data;
    } catch (error: any) {
      console.error('Failed to get wallet balances:', error);
      
      // Return default structure if error
      return {
        success: true,
        data: {
          solBalance: 0,
          tokenBalances: [],
          portfolioValue: 0
        }
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(walletAddress: string, limit = 50): Promise<TokenResponse> {
    try {
      console.log(`Fetching transaction history for: ${walletAddress}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/wallet/${walletAddress}/transactions`, {
        params: { limit }
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get transaction history');
      }
      
      return data;
    } catch (error: any) {
      console.error('Failed to get transaction history:', error);
      
      // Return empty array if error
      return {
        success: true,
        data: []
      };
    }
  }
}

export const pumpService = new PumpService();
export default pumpService;