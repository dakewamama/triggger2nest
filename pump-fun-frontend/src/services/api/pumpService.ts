import { apiClient } from './client';

export interface CreateTokenDto {
  name: string;
  symbol: string;
  description: string;
}

export interface BuyTokenDto {
  mintAddress: string;
  amountSol: number;
}

export interface SellTokenDto {
  mintAddress: string;
  amountTokens: number;
}

export interface TokenResponse {
  message: string;
  transactionId: string;
  mintAddress?: string;
  pumpUrl?: string;
}

class PumpService {
  private baseUrl = '/pump';
  
  async createToken(data: CreateTokenDto, imageFile?: File): Promise<TokenResponse> {
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('symbol', data.symbol);
        formData.append('description', data.description);
        formData.append('image', imageFile);
        
        const response = await apiClient.api.post(`${this.baseUrl}/create-token`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        const response = await apiClient.api.post(`${this.baseUrl}/create-token`, data);
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to create token:', error);
      throw new Error(error.response?.data?.error || 'Failed to create token');
    }
  }
  
  async buyToken(data: BuyTokenDto): Promise<TokenResponse> {
    try {
      const response = await apiClient.api.post(`${this.baseUrl}/buy-token`, data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to buy token:', error);
      throw new Error(error.response?.data?.error || 'Failed to buy token');
    }
  }
  
  async sellToken(data: SellTokenDto): Promise<TokenResponse> {
    try {
      const response = await apiClient.api.post(`${this.baseUrl}/sell-token`, data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to sell token:', error);
      throw new Error(error.response?.data?.error || 'Failed to sell token');
    }
  }
  
  async getTokenInfo(mintAddress: string) {
    try {
      const response = await apiClient.api.get(`${this.baseUrl}/token-info/${mintAddress}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get token info:', error);
      throw new Error(error.response?.data?.error || 'Failed to get token info');
    }
  }
  
  async healthCheck() {
    try {
      const response = await apiClient.api.get('/');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export const pumpService = new PumpService();
