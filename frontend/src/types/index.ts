export interface Token {
  mint: string
  name: string
  symbol: string
  description?: string
  image_uri?: string
  metadata_uri?: string
  twitter?: string
  telegram?: string
  website?: string
  bonding_curve: string
  associated_bonding_curve: string
  creator: string
  created_timestamp: number
  raydium_pool?: string
  complete: boolean
  virtual_sol_reserves: number
  virtual_token_reserves: number
  total_supply: number
  market_cap: number
  usd_market_cap: number
  price?: number
  change24h?: number
  price_change_24h?: number
  volume24h?: number
  is_currently_live: boolean
}

// Alias for backward compatibility
export type PumpToken = Token;

export interface Trade {
  signature: string
  mint: string
  sol_amount: number
  token_amount: number
  is_buy: boolean
  user: string
  timestamp: number
  tx_index: number
  username?: string
  profile_image?: string
  token_symbol?: string
  token_name?: string
}

// Alias for backward compatibility
export type TokenTrade = Trade;


export interface MarketStats {
  totalMarketCap: number
  totalVolume24h: number
  activeTokens: number
  successfulGraduations: number
  totalTokens?: number
  last24Hours?: {
    newTokens?: number
    volume?: number
    trades?: number
  }
}

export interface SearchResult {
  data: Token[]
  suggestions?: string[]
  relatedTokens?: Token[]
  searchType?: string
  totalMatches?: number
  query?: string
  error?: string
}


export interface WalletBalance {
  address: string
  solBalance: number
  tokenBalances: Array<{
    mint: string
    amount: number
    usdValue: number
  }>
  portfolioValue: number
}

export interface PortfolioToken {
  mint: string
  symbol: string
  name: string
  balance: number
  value: number
  price: number
  change24h?: number
  image_uri?: string
}

export interface Portfolio {
  wallet: string
  solBalance: number
  tokens: PortfolioToken[]
  totalValue: number
  last_updated: number
}

export interface Transaction {
  signature: string
  type: 'buy' | 'sell' | 'create'
  mint: string
  amount: number
  solAmount: number
  timestamp: number
  status: 'confirmed' | 'pending' | 'failed'
}

export interface CreateTokenDto {
  name: string
  symbol: string
  description: string
  twitter?: string
  telegram?: string
  website?: string
  file?: File | Blob
  imageUrl?: string
}

export interface BuyTokenDto {
  mint: string
  amount: number
  slippage?: number
  priorityFee?: number
}

export interface SellTokenDto {
  mint: string
  amount: number
  slippage?: number
  priorityFee?: number
}

export interface TokenResponse {
  success: boolean
  mint?: string
  signature?: string
  token?: Token
  message?: string
  error?: string
}

export interface QuoteResponse {
  inAmount: string
  outAmount: string
  priceImpact: number
  fee: number
  minimumReceived?: string
}

export interface BuyTokenParams {
  mint: string
  amount: number
  slippage: number
  priorityFee: number
}

export interface SellTokenParams {
  mint: string
  amount: number
  slippage: number
  priorityFee: number
}


export interface DashboardData {
  featured: Token[]
  trending: Token[]
  new: Token[]
  stats: MarketStats
  recentTrades?: Trade[]
}


export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}