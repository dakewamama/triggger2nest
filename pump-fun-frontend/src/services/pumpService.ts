import { apiClient } from './api'
import type { CreateTokenDto, TokenResponse } from '../types'

export const pumpService = {
  // Create a new token with optional image
  async createToken(data: CreateTokenDto, imageFile?: File): Promise<TokenResponse> {
    if (imageFile) {
      // Use FormData for file upload
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('symbol', data.symbol)
      formData.append('description', data.description)
      formData.append('image', imageFile)

      const response = await apiClient.post('/pump/create-token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } else {
      // JSON request without image
      const response = await apiClient.post('/pump/create-token', data)
      return response.data
    }
  },

  // Buy tokens
  async buyToken(mintAddress: string, amountSol: number): Promise<TokenResponse> {
    const response = await apiClient.post('/pump/buy-token', {
      mintAddress,
      amountSol,
    })
    return response.data
  },

  // Sell tokens  
  async sellToken(mintAddress: string, amountTokens: number): Promise<TokenResponse> {
    const response = await apiClient.post('/pump/sell-token', {
      mintAddress,
      amountTokens,
    })
    return response.data
  },

  // Get token info
  async getTokenInfo(mintAddress: string) {
    const response = await apiClient.get(`/pump/token-info/${mintAddress}`)
    return response.data
  },

  // Health check - test if backend is running
  async healthCheck() {
    const response = await apiClient.get('/')
    return response.data
  },
}