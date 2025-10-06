import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

interface ErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => config,
      (error) => Promise.reject(error)
    );
    
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Cannot connect to server. Please check your network or backend service.');
        }

        if (error.response?.status === 404) {
          throw new Error('API endpoint not found.');
        }

        if (error.response?.status === 500) {
          throw new Error('Internal server error. Please check backend logs.');
        }

        if (error.response?.status === 400) {
          throw new Error(error.response.data?.message || error.response.data?.error || 'Bad request');
        }

        throw error;
      }
    );
  }
  
  get api() {
    return this.client;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();

if (import.meta.env.DEV) {
  setTimeout(() => {
    apiClient.testConnection().then((connected) => {
      if (!connected) {
        console.warn('Cannot connect to backend. Ensure it is running on http://localhost:8000');
      }
    });
  }, 1000);
}
