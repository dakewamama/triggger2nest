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
      (config: InternalAxiosRequestConfig) => {
        console.log(`[API] 📤 ${config.method?.toUpperCase()} ${config.url}`);
        console.log('[API] Headers:', config.headers);
        if (config.data) {
          console.log('[API] Data:', JSON.stringify(config.data, null, 2));
        }
        return config;
      },
      (error) => {
        console.error('[API] ❌ Request error:', error);
        return Promise.reject(error);
      }
    );
    
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] 📥 Response ${response.status}:`, response.data);
        return response;
      },
      (error: AxiosError<ErrorResponse>) => {
        console.error('[API] ❌ Response error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data,
          message: error.message,
          code: error.code
        });
        
        if (error.code === 'ERR_NETWORK') {
          const serverError = new Error(
            'Cannot connect to server. Please ensure:\n' +
            '1. Backend is running on port 8000\n' +
            '2. Run: npm run dev (in backend folder)\n' +
            '3. Check http://localhost:8000/health'
          );
          console.error(serverError.message);
          throw serverError;
        }
        
        if (error.response?.status === 404) {
          const notFoundError = new Error(
            `API endpoint not found: ${error.config?.method?.toUpperCase()} ${error.config?.url}\n` +
            'Check that the backend route exists and the server is running.'
          );
          console.error(notFoundError.message);
          throw notFoundError;
        }
        
        if (error.response?.status === 500) {
          const serverError = new Error(
            `Server error: ${error.response.data?.error || 'Internal server error'}\n` +
            'Check backend logs for details.'
          );
          console.error(serverError.message);
          throw serverError;
        }
        
        if (error.response?.status === 400) {
          const validationError = new Error(
            error.response.data?.message || 
            error.response.data?.error || 
            'Bad request'
          );
          throw validationError;
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
      console.log('[API] Testing connection to backend...');
      const response = await this.client.get('/health');
      console.log('[API] ✅ Backend is reachable:', response.data);
      return true;
    } catch (error) {
      console.error('[API] ❌ Backend is not reachable:', error);
      return false;
    }
  }
}

export const apiClient = new ApiClient();

if (import.meta.env.DEV) {
  setTimeout(() => {
    apiClient.testConnection().then(connected => {
      if (!connected) {
        console.warn(
          '\n⚠️  WARNING: Cannot connect to backend!\n' +
          'Please ensure the backend is running on http://localhost:8000\n' +
          'Run: npm run dev (in the backend folder)\n'
        );
      }
    });
  }, 1000);
}