import axios, { AxiosInstance } from 'axios';
import { ENV } from '../../config/env';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PumpToken {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
  holders: number;
  createdAt: string;
  creator: string;
  isCurrentlyLive: boolean;
  website?: string;
  twitter?: string;
  telegram?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: ENV.API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[API] Response error:', error.response?.status, error.response?.data);
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Cannot connect to backend. Please ensure the backend is running on port 3000.');
        }
        throw error;
      }
    );
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Pump endpoints - connecting to your backend
  async createToken(data: {
    name: string;
    symbol: string;
    description: string;
    website?: string;
    twitter?: string;
    telegram?: string;
  }, imageFile?: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('symbol', data.symbol);
    formData.append('description', data.description);
    
    if (data.website) formData.append('website', data.website);
    if (data.twitter) formData.append('twitter', data.twitter);
    if (data.telegram) formData.append('telegram', data.telegram);
    if (imageFile) formData.append('image', imageFile);

    const response = await this.api.post('/pump/create-token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async buyToken(data: {
    mint: string;
    publicKey: string;
    amount: number;
    solAmount: number;
    slippage?: number;
    priorityFee?: number;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/pump/buy-token', {
      ...data,
      slippage: data.slippage || ENV.DEFAULT_SLIPPAGE,
      priorityFee: data.priorityFee || ENV.DEFAULT_PRIORITY_FEE,
    });
    return response.data;
  }

  async sellToken(data: {
    mint: string;
    publicKey: string;
    amount: number;
    slippage?: number;
    priorityFee?: number;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/pump/sell-token', {
      ...data,
      slippage: data.slippage || ENV.DEFAULT_SLIPPAGE,
      priorityFee: data.priorityFee || ENV.DEFAULT_PRIORITY_FEE,
    });
    return response.data;
  }

  // Token endpoints
  async getTrendingTokens(limit = 50): Promise<PumpToken[]> {
    const response = await this.api.get(`/tokens/trending`, { params: { limit } });
    return response.data?.data || [];
  }

  async searchTokens(query: string): Promise<PumpToken[]> {
    const response = await this.api.get(`/tokens/search`, { params: { q: query } });
    return response.data?.data || [];
  }

  async getTokenDetails(mint: string): Promise<PumpToken | null> {
    try {
      const response = await this.api.get(`/tokens/${mint}`);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Failed to get token details for ${mint}:`, error);
      return null;
    }
  }

  // Wallet endpoints
  async getWalletBalance(address: string): Promise<number> {
    const response = await this.api.get(`/wallet/${address}/balance`);
    return response.data?.balance || 0;
  }

  // Trading endpoints
  async executeBuyTrade(params: any): Promise<ApiResponse> {
    const response = await this.api.post('/trading/buy', params);
    return response.data;
  }

  async executeSellTrade(params: any): Promise<ApiResponse> {
    const response = await this.api.post('/trading/sell', params);
    return response.data;
  }

  // Utility methods
  formatPrice(price: number): string {
    if (price < 0.01) return price.toExponential(2);
    return price.toFixed(6);
  }

  formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  }

  formatAddress(address: string, length = 4): string {
    if (!address) return '';
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }
}

export const apiService = new ApiService();
export default apiService;
