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
  volume24h?: number
  is_currently_live: boolean
}

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