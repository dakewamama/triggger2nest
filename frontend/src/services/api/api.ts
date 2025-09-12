interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
  signature?: string;
}

interface CreateTokenResult extends ApiResponse {
  signature?: string;
}

interface BuyTokenResult extends ApiResponse {
  signature?: string;
  transaction?: string; // Serialized transaction from PumpPortal
}

interface SellTokenResult extends ApiResponse {
  signature?: string;
  transaction?: string; // Serialized transaction from PumpPortal
}

export class PumpService {
  private baseUrl = '/pump';
  
  async createToken(data: any, imageFile?: File): Promise<CreateTokenResult> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('symbol', data.symbol);
      formData.append('description', data.description);
      
      if (data.website) formData.append('website', data.website);
      if (data.twitter) formData.append('twitter', data.twitter);
      if (data.telegram) formData.append('telegram', data.telegram);
      if (imageFile) formData.append('image', imageFile);

      const response = await fetch(`${this.baseUrl}/create-token`, {
        method: 'POST',
        body: formData,
      });

      const result: CreateTokenResult = await response.json();

      if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Token creation failed';
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Create token error:', error);
      throw error;
    }
  }

  async buyToken(data: {
    mint: string;
    publicKey?: string; // Make optional with default
    amount: number;
    solAmount: number;
    slippage?: number;
    priorityFee?: number;
  }): Promise<BuyTokenResult> {
    try {
      // Provide default publicKey if not provided
      const requestData = {
        ...data,
        publicKey: data.publicKey || 'wallet_not_connected',
        slippage: data.slippage || 1,
        priorityFee: data.priorityFee || 0.00001,
      };

      const response = await fetch(`${this.baseUrl}/buy-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: BuyTokenResult = await response.json();

      if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Buy failed';
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Buy token error:', error);
      throw error;
    }
  }

  async sellToken(data: {
    mint: string;
    publicKey?: string; // Make optional with default
    amount: number;
    slippage?: number;
    priorityFee?: number;
  }): Promise<SellTokenResult> {
    try {
      // Provide default publicKey if not provided
      const requestData = {
        ...data,
        publicKey: data.publicKey || 'wallet_not_connected',
        slippage: data.slippage || 1,
        priorityFee: data.priorityFee || 0.00001,
      };

      const response = await fetch(`${this.baseUrl}/sell-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: SellTokenResult = await response.json();

      if (!result.success) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Sell failed';
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error('Sell token error:', error);
      throw error;
    }
  }

  async getTokenInfo(mintAddress: string) {
    try {
      const response = await fetch(`${this.baseUrl}/token-info/${mintAddress}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get token info');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get token info:', error);
      throw error;
    }
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell') {
    try {
      const params = new URLSearchParams({
        amount: amount.toString(),
        action: action,
      });
      
      const response = await fetch(`${this.baseUrl}/quote/${mint}?${params}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get quote');
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get quote:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const pumpService = new PumpService();