import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  })

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        const wallet = localStorage.getItem('walletAddress')
        if (wallet) {
          config.headers['X-Wallet-Address'] = wallet
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // ============ Token Discovery ============
  async getFeaturedTokens(limit = 20, offset = 0) {
    const { data } = await this.api.get('/tokens/featured', { 
      params: { limit, offset } 
    })
    return data.data || []
  }

  async getTrendingTokens(limit = 50, offset = 0) {
    const { data } = await this.api.get('/tokens/trending', { 
      params: { limit, offset } 
    })
    return data.data || []
  }

  async getNewTokens(limit = 50, offset = 0) {
    const { data } = await this.api.get('/tokens/new', { 
      params: { limit, offset } 
    })
    return data.data || []
  }

  async searchTokens(query: string, limit = 20) {
    const { data } = await this.api.get('/tokens/search/advanced', { 
      params: { q: query, limit } 
    })
    return data
  }

  async getTokenDetails(mint: string) {
    const { data } = await this.api.get(`/tokens/${mint}`)
    return data.data
  }

  async getTokenByMint(mint: string) {
    const { data } = await this.api.get(`/tokens/${mint}`)
    return data.data
  }

  // ============ Market Stats ============
  async getMarketStats() {
    const { data } = await this.api.get('/tokens/stats/market')
    return data.data
  }

  async getDashboardData() {
    const { data } = await this.api.get('/tokens/analytics/dashboard')
    return data.data
  }

  async getSolPrice() {
    const { data } = await this.api.get('/tokens/price/sol')
    return data.data?.price || 100
  }

  // ============ Trading Operations ============
  async getQuote(mint: string, amount: number, action: 'buy' | 'sell') {
    const { data } = await this.api.get(`/pump/quote/${mint}`, {
      params: { amount, action }
    })
    return data.data
  }

  async buyToken(params: {
    mint: string
    publicKey: string
    amount: number
    solAmount: number
    slippage?: number
    priorityFee?: number
  }) {
    const { data } = await this.api.post('/pump/buy-token', {
      ...params,
      slippage: params.slippage || 1.0,
      priorityFee: params.priorityFee || 0.00001
    })
    return data
  }

  async sellToken(params: {
    mint: string
    publicKey: string
    amount: number
    slippage?: number
    priorityFee?: number
  }) {
    const { data } = await this.api.post('/pump/sell-token', {
      ...params,
      slippage: params.slippage || 1.0,
      priorityFee: params.priorityFee || 0.00001
    })
    return data
  }

  // ============ Token Creation ============
  async createToken(formData: FormData) {
    const { data } = await this.api.post('/pump/create-token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  }

  // ============ Trade Data ============
  async getLatestTrades(limit = 100) {
    try {
      const { data } = await this.api.get('/tokens/trades/latest', { 
        params: { limit } 
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to fetch latest trades:', error)
      return []
    }
  }

  async getTokenTrades(mint: string, limit = 50, offset = 0) {
    try {
      const { data } = await this.api.get(`/tokens/${mint}/trades`, {
        params: { limit, offset }
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to fetch token trades:', error)
      return []
    }
  }

  async getRecentActivity() {
    try {
      const { data } = await this.api.get('/tokens/activity/recent')
      return data.data || []
    } catch (error) {
      console.error('Failed to fetch recent activity:', error)
      return []
    }
  }

  async getTradingStats() {
    try {
      const { data } = await this.api.get('/tokens/stats/trading')
      return data.data
    } catch (error) {
      console.error('Failed to fetch trading stats:', error)
      return null
    }
  }

  // ============ Wallet Operations ============
  async getWalletBalances(address: string) {
    const { data } = await this.api.get(`/pump/wallet/${address}/balances`)
    return data.data
  }

  async getWalletTransactions(address: string, limit = 50) {
    const { data } = await this.api.get(`/pump/wallet/${address}/transactions`, {
      params: { limit }
    })
    return data.data || []
  }

  async getWalletTrades(walletAddress: string, limit = 50) {
    try {
      const { data } = await this.api.get(`/pump/wallet/${walletAddress}/transactions`, {
        params: { limit }
      })
      return data.data || []
    } catch (error) {
      console.error('Failed to fetch wallet trades:', error)
      return []
    }
  }

  async getWalletBalance(address: string) {
    const { data } = await this.api.get(`/wallet/${address}/balance`)
    return data
  }

  // ============ Health & Status ============
  async healthCheck() {
    try {
      const { data } = await this.api.get('/pump/health')
      return data
    } catch (error) {
      console.error('Health check failed:', error)
      return { status: 'error', message: 'Backend offline' }
    }
  }

  async getServiceStatus() {
    try {
      const { data } = await this.api.get('/tokens/health')
      return data
    } catch (error) {
      console.error('Service status check failed:', error)
      return { status: 'error' }
    }
  }

  // ============ Debug Methods (Dev Only) ============
  async testSearch(query: string) {
    if (import.meta.env.DEV) {
      const { data } = await this.api.get('/tokens/debug/search-test', {
        params: { q: query }
      })
      return data
    }
    return null
  }

  async listAllTokens(limit = 100, offset = 0) {
    if (import.meta.env.DEV) {
      const { data } = await this.api.get('/tokens/debug/list-all', {
        params: { limit, offset }
      })
      return data
    }
    return null
  }
}

export const api = new ApiService()