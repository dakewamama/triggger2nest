import { apiClient } from './client';

export interface CreateTokenDto {
  name: string;
  symbol: string;
  uri: string;
  creator: string;
}

export interface BuyTokenDto {
  mint: string;
  publicKey: string;
  solAmount: number;
  slippage?: number;
  priorityFee?: number;
}

export interface SellTokenDto {
  mint: string;
  publicKey: string;
  tokenAmount: number;
  slippage?: number;
  priorityFee?: number;
}

export interface TokenResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
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

export interface WalletBalance {
  solBalance: number;
  tokenBalances: any[];
  portfolioValue: number;
}

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

class PumpService {
  private readonly baseUrl = '/pump';
  private readonly apiBaseUrl = '/api/pump';

  async createToken(tokenData: CreateTokenDto): Promise<TokenResponse> {
    try {
      console.log('[PumpService] Creating token (IDL version):', tokenData);
      
      const { data } = await apiClient.api.post(`${this.apiBaseUrl}/create`, tokenData);
      
      console.log('[PumpService] Create token response:', data);
      
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (error: any) {
      console.error('[PumpService] Create token error:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create token',
      };
    }
  }

  async sendSignedTransaction(transactionData: { 
    transaction: string 
  }): Promise<TokenResponse> {
    try {
      console.log('[PumpService] Sending signed transaction');
      
      const { data } = await apiClient.api.post(
        `${this.baseUrl}/send-transaction`, 
        transactionData
      );
      
      console.log('[PumpService] Send transaction response:', data);
      
      return data;
    } catch (error: any) {
      console.error('[PumpService] Send transaction error:', error);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send transaction',
      };
    }
  }

  async waitForConfirmation(signature: string, connection: any): Promise<boolean> {
    try {
      console.log(`[PumpService] Waiting for confirmation: ${signature}`);
      
      const result = await connection.confirmTransaction(signature, 'confirmed');
      
      if (result.value.err) {
        throw new Error('Transaction failed');
      }
      
      console.log(`[PumpService] Transaction confirmed: ${signature}`);
      return true;
    } catch (error) {
      console.error('[PumpService] Confirmation error:', error);
      throw error;
    }
  }

  async buyToken(params: BuyTokenParams): Promise<TokenResponse> {
    try {
      console.log('[PumpService] Buy token request:', params);
      
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
        publicKey: params.publicKey,  // FIXED: Changed from "buyer" to "publicKey"
        solAmount: params.solAmount,
        slippage: params.slippage || 0.01,
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
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to buy tokens',
      };
    }
  }

  async sellToken(params: SellTokenParams): Promise<TokenResponse> {
    try {
      console.log('[PumpService] Sell token request:', params);
      
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
        publicKey: params.publicKey,  // FIXED: Changed from "seller" to "publicKey"
        amount: params.amount,
        slippage: params.slippage || 0.01,
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
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to sell tokens',
      };
    }
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<QuoteResponse | null> {
    try {
      console.log(`[PumpService] Getting ${action} quote for ${amount} on ${mint}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/quote/${mint}`, {
        params: { amount, action }
      });
      
      if (data.success && data.data) {
        const quote: QuoteResponse = {
          mint,
          action,
          amount,
          estimatedPrice: data.data.price || 0,
          estimatedSolAmount: action === 'buy' ? amount : (data.data.outputAmount || 0),
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
      console.log(`[PumpService] Fetching token info for: ${mintAddress}`);
      
      const { data } = await apiClient.api.get(`${this.baseUrl}/token-info/${mintAddress}`);
      
      console.log('[PumpService] Token info response:', data);
      return data;
    } catch (error: any) {
      console.error('[PumpService] Get token info error:', error);
      throw error;
    }
  }

  async getWalletBalances(walletAddress: string): Promise<TokenResponse> {
    try {
      console.log(`[PumpService] Fetching wallet balances for: ${walletAddress}`);
      
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

  async getTransactionHistory(walletAddress: string, limit = 50): Promise<TokenResponse> {
    try {
      console.log(`[PumpService] Fetching transaction history for: ${walletAddress}`);
      
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