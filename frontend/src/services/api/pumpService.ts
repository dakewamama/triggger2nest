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
}

class PumpService {
  private readonly baseUrl = '/pump';

  async buyToken(params: BuyTokenParams): Promise<TransactionResponse> {
    try {
      console.log('[PumpService] Buy token request:', params);
      
      const { data } = await apiClient.api.post(`${this.baseUrl}/buy-token`, params);
      
      console.log('[PumpService] Buy token response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Buy transaction failed');
      }
      
      return data;
    } catch (error: any) {
      console.error('[PumpService] Buy token error:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create buy transaction';
      
      throw new Error(errorMessage);
    }
  }

  async sellToken(params: SellTokenParams): Promise<TransactionResponse> {
    try {
      console.log('[PumpService] Sell token request:', params);
      
      const { data } = await apiClient.api.post(`${this.baseUrl}/sell-token`, params);
      
      console.log('[PumpService] Sell token response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Sell transaction failed');
      }
      
      return data;
    } catch (error: any) {
      console.error('[PumpService] Sell token error:', error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create sell transaction';
      
      throw new Error(errorMessage);
    }
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<QuoteResponse | null> {
    try {
      console.log(`[PumpService] Getting quote: ${action} ${amount} for ${mint}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/quote/${mint}`, {
        params: { amount, action }
      });
      
      console.log('[PumpService] Quote response:', data);
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('[PumpService] Get quote error:', error);
      return null;
    }
  }

  async getTokenInfo(mint: string): Promise<any> {
    try {
      console.log(`[PumpService] Getting token info for: ${mint}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/token-info/${mint}`);
      
      if (data.success) {
        return data.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('[PumpService] Get token info error:', error);
      return null;
    }
  }

  async createToken(formData: FormData): Promise<any> {
    try {
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
}

export const pumpService = new PumpService();
export default pumpService;