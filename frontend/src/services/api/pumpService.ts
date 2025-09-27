import { apiClient } from './client';

export interface BuyTokenParams {
  mint: string;
  publicKey: string;
  amount: number;
  solAmount: number;
  slippage?: number;
  priorityFee?: number;
}

export interface SellTokenParams {
  mint: string;
  publicKey: string;
  amount: number;
  slippage?: number;
  priorityFee?: number;
}

export interface QuoteResponse {
  mint: string;
  action: 'buy' | 'sell';
  amount: number;
  estimatedPrice: number;
  estimatedSolAmount: number;
  estimatedTokenAmount: number;
  priceImpact: number;
  slippage: number;
  fees: number;
}

export interface TransactionResponse {
  success: boolean;
  data?: {
    transaction: string;
    mint: string;
    amount: number;
    solAmount?: number;
    action: string;
  };
  error?: string;
  message?: string;
}

class PumpService {
  private readonly baseUrl = '/pump';

  async buyToken(params: BuyTokenParams): Promise<TransactionResponse> {
    try {
      console.log('[PumpService] Buy token request:', params);
      
      // Validate params
      if (!params.publicKey || params.publicKey === 'wallet_not_connected') {
        throw new Error('Wallet not connected');
      }
      
      if (!params.mint) {
        throw new Error('Token mint address is required');
      }
      
      if (!params.solAmount || params.solAmount <= 0) {
        throw new Error('Invalid SOL amount');
      }
      
      const requestData = {
        mint: params.mint,
        publicKey: params.publicKey,
        amount: params.amount || params.solAmount, // Token amount or SOL amount
        solAmount: params.solAmount,
        slippage: params.slippage || 1.0,
        priorityFee: params.priorityFee || 0.00005
      };
      
      const { data } = await apiClient.api.post(`${this.baseUrl}/buy-token`, requestData);
      
      console.log('[PumpService] Buy token response:', data);
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error: any) {
      console.error('[PumpService] Buy token error:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create buy transaction';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async sellToken(params: SellTokenParams): Promise<TransactionResponse> {
    try {
      console.log('[PumpService] Sell token request:', params);
      
      // Validate params
      if (!params.publicKey || params.publicKey === 'wallet_not_connected') {
        throw new Error('Wallet not connected');
      }
      
      if (!params.mint) {
        throw new Error('Token mint address is required');
      }
      
      if (!params.amount || params.amount <= 0) {
        throw new Error('Invalid token amount');
      }
      
      const requestData = {
        mint: params.mint,
        publicKey: params.publicKey,
        amount: params.amount,
        slippage: params.slippage || 1.0,
        priorityFee: params.priorityFee || 0.00005
      };
      
      const { data } = await apiClient.api.post(`${this.baseUrl}/sell-token`, requestData);
      
      console.log('[PumpService] Sell token response:', data);
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error: any) {
      console.error('[PumpService] Sell token error:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create sell transaction';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<QuoteResponse | null> {
    try {
      if (!mint || !amount || amount <= 0) {
        console.warn('[PumpService] Invalid quote params');
        return null;
      }
      
      console.log(`[PumpService] Getting quote: ${action} ${amount} for ${mint}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/quote/${mint}`, {
        params: { amount, action }
      });
      
      console.log('[PumpService] Quote response:', data);
      
      if (data.success && data.data) {
        // Transform the response to match expected format
        const quote: QuoteResponse = {
          mint,
          action,
          amount,
          estimatedPrice: data.data.price || 0,
          estimatedSolAmount: action === 'sell' ? (data.data.outputAmount || 0) : amount,
          estimatedTokenAmount: action === 'buy' ? (data.data.outputAmount || 0) : amount,
          priceImpact: data.data.priceImpact || 0,
          slippage: data.data.slippageEstimate || 1,
          fees: data.data.fees || 0
        };
        
        return quote;
      }
      
      return null;
    } catch (error: any) {
      console.error('[PumpService] Quote error:', error);
      return null;
    }
  }

  async getTokenInfo(mintAddress: string) {
    try {
      const { data } = await apiClient.api.get(`${this.baseUrl}/token-info/${mintAddress}`);
      return data;
    } catch (error: any) {
      console.error('[PumpService] Get token info error:', error);
      throw error;
    }
  }

  async createToken(tokenData: any, imageFile?: File) {
    try {
      const formData = new FormData();
      
      // Add token data
      Object.keys(tokenData).forEach(key => {
        if (tokenData[key]) {
          formData.append(key, tokenData[key]);
        }
      });
      
      // Add image if provided
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const { data } = await apiClient.api.post(`${this.baseUrl}/create-token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return data;
    } catch (error: any) {
      console.error('[PumpService] Create token error:', error);
      throw error;
    }
  }

  async getWalletBalances(walletAddress: string) {
    try {
      const { data } = await apiClient.api.get(`${this.baseUrl}/wallet/${walletAddress}/balances`);
      return data;
    } catch (error: any) {
      console.error('[PumpService] Get wallet balances error:', error);
      return {
        success: false,
        data: {
          solBalance: 0,
          tokenBalances: [],
          portfolioValue: 0
        }
      };
    }
  }

  async getTransactionHistory(walletAddress: string, limit = 50) {
    try {
      const { data } = await apiClient.api.get(`${this.baseUrl}/wallet/${walletAddress}/transactions`, {
        params: { limit }
      });
      return data;
    } catch (error: any) {
      console.error('[PumpService] Get transaction history error:', error);
      return {
        success: false,
        data: []
      };
    }
  }
}

export const pumpService = new PumpService();
export default pumpService;