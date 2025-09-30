import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: '',  // Empty = use proxy
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );
    
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response:`, response.status, response.data);
        return response;
      },
      (error: AxiosError) => {
        console.error('[API] Response error:', error.response?.status, error.message);
        
        if (error.code === 'ERR_NETWORK') {
          throw new Error('Cannot connect to server. Please check if the backend is running on port 8000.');
        }
        
        if (error.response?.status === 404) {
          throw new Error('API endpoint not found');
        }
        
        if (error.response?.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw error;
      }
    );
  }
  
  get api() {
    return this.client;
  }
}

export const apiClient = new ApiClient();
