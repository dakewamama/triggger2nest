import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

interface ErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (import.meta.env.DEV) {
          console.log(`${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        const message = this.handleError(error);
        throw new Error(message);
      }
    );
  }

  private handleError(error: AxiosError<ErrorResponse>): string {
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot connect to backend. Ensure server is running on port 8000.';
    }

    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 404) {
        return `Endpoint not found: ${error.config?.method} ${error.config?.url}`;
      }
      
      if (status === 500) {
        return data?.error || 'Internal server error';
      }
      
      if (status === 400) {
        return data?.message || data?.error || 'Bad request';
      }
    }

    return error.message || 'Request failed';
  }
  
  get api() {
    return this.client;
  }
}

export const apiClient = new ApiClient();