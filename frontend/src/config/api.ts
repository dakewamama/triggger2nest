// API Configuration - Backend runs on port 8000
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Health
  health: '/health',
  
  // Pump endpoints
  createToken: '/pump/create-token',
  buyToken: '/pump/buy-token',
  sellToken: '/pump/sell-token',
  tokenInfo: (mint: string) => `/pump/token-info/${mint}`,
  quote: (mint: string) => `/pump/quote/${mint}`,
  
  // Token endpoints
  featured: '/tokens/featured',
  trending: '/tokens/trending',
  new: '/tokens/new',
  search: '/tokens/search',
  tokenDetails: (mint: string) => `/tokens/${mint}`,
  tokenTrades: (mint: string) => `/tokens/${mint}/trades`,
  
  // Wallet endpoints
  balance: (address: string) => `/api/wallet/${address}/balance`,
  
  // Trading endpoints
  buy: '/api/trading/buy',
  sell: '/api/trading/sell',
}
