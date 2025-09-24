import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

console.log('🔗 API connecting to:', API_BASE_URL);

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  })

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.message)
        if (error.code === 'ERR_NETWORK') {
          console.error(`Cannot connect to backend on port 8000. Is it running?`)
        }
        return Promise.reject(error)
      }
    )
  }

  async healthCheck() {
    try {
      const { data } = await this.api.get('/health')
      return data
    } catch (error) {
      return { status: 'error', message: 'Backend offline' }
    }
  }

  async getTrendingTokens(limit = 50, offset = 0) {
    try {
      const { data } = await this.api.get('/tokens/trending', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  async getFeaturedTokens(limit = 20, offset = 0) {
    try {
      const { data } = await this.api.get('/tokens/featured', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  async getNewTokens(limit = 50, offset = 0) {
    try {
      const { data } = await this.api.get('/tokens/new', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  async getMarketStats() {
    try {
      const { data } = await this.api.get('/tokens/stats/market')
      return data.data
    } catch (error) {
      return null
    }
  }

  async getLatestTrades(limit = 20) {
    try {
      const { data } = await this.api.get('/tokens/trades/latest', {
        params: { limit }
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  // Add other methods as needed...
}

const apiService = new ApiService()
export { apiService, apiService as api }
export default apiService
