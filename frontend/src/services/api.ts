import axios from 'axios'

// BACKEND IS ON PORT 8000!
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiService {
  private apiInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  })

  constructor() {
    this.apiInstance.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
        const wallet = localStorage.getItem('walletAddress')
        if (wallet) {
          config.headers['X-Wallet-Address'] = wallet
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.apiInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        if (error.code === 'ERR_NETWORK') {
          console.error('Cannot connect to backend on port 8000. Is it running?')
        }
        return Promise.reject(error)
      }
    )
  }

  // ============ Health Check ============
  async healthCheck() {
    const { data } = await this.apiInstance.get('/health')
    return data
  }

  // ============ Token Discovery ============
  async getFeaturedTokens(limit = 20, offset = 0) {
    try {
      const { data } = await this.apiInstance.get('/tokens/featured', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to fetch featured tokens:', error)
      return []
    }
  }

  async getTrendingTokens(limit = 50, offset = 0) {
    try {
      const { data } = await this.apiInstance.get('/tokens/trending', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to fetch trending tokens:', error)
      return []
    }
  }

  async getNewTokens(limit = 50, offset = 0) {
    try {
      const { data } = await this.apiInstance.get('/tokens/new', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to fetch new tokens:', error)
      return []
    }
  }

  async searchTokens(query: string, limit = 20) {
    try {
      const { data } = await this.apiInstance.get('/tokens/search/advanced', { 
        params: { q: query, limit } 
      })
      return data
    } catch (error) {
      console.error('Search failed:', error)
      return { data: [], suggestions: [] }
    }
  }

  async getTokenDetails(mint: string) {
    try {
      const { data } = await this.apiInstance.get(`/tokens/${mint}`)
      return data.data
    } catch (error) {
      console.error('Failed to get token details:', error)
      return null
    }
  }

  async getTokenByMint(mint: string) {
    return this.getTokenDetails(mint)
  }

  async getTokenTrades(mint: string, limit = 50, offset = 0) {
    try {
      const { data } = await this.apiInstance.get(`/tokens/${mint}/trades`, {
        params: { limit, offset }
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to get token trades:', error)
      return []
    }
  }

  // ============ Latest Trades (ADDED) ============
  async getLatestTrades(limit = 100) {
    try {
      const { data } = await this.apiInstance.get('/tokens/trades/latest', {
        params: { limit }
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to get latest trades:', error)
      return []
    }
  }

  // ============ Market Stats ============
  async getMarketStats() {
    try {
      const { data } = await this.apiInstance.get('/tokens/stats/market')
      return data.data
    } catch (error) {
      console.error('Failed to get market stats:', error)
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        activeTokens: 0,
        successfulGraduations: 0,
      }
    }
  }

  async getSolPrice() {
    try {
      const { data } = await this.apiInstance.get('/tokens/price/sol')
      return data.data?.price || 100
    } catch (error) {
      console.error('Failed to get SOL price:', error)
      return 100
    }
  }

  async getDashboardData() {
    try {
      const { data } = await this.apiInstance.get('/tokens/analytics/dashboard')
      return data.data
    } catch (error) {
      console.error('Failed to get dashboard data:', error)
      return null
    }
  }

  // ============ Trading Operations ============
  async getQuote(mint: string, amount: number, action: 'buy' | 'sell') {
    const { data } = await this.apiInstance.get(`/pump/quote/${mint}`, {
      params: { amount, action }
    })
    return data.data
  }

  async buyToken(params: any) {
    const { data } = await this.apiInstance.post('/pump/buy-token', params)
    return data
  }

  async sellToken(params: any) {
    const { data } = await this.apiInstance.post('/pump/sell-token', params)
    return data
  }

  async createToken(formData: FormData) {
    const { data } = await this.apiInstance.post('/pump/create-token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }

  // ============ Wallet ============
  async getWalletBalance(address: string) {
    const { data } = await this.apiInstance.get(`/api/wallet/${address}/balance`)
    return data
  }
}

// Export both named and default
export const apiService = new ApiService()
export const api = apiService  // For compatibility
export default apiService
