export interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  image_uri?: string;
  price?: number;
  priceChange24h?: number;
}

export interface PortfolioToken {
  mint: string;
  name: string;
  symbol: string;
  balance: number;
  decimals: number;
  image_uri?: string;
  price: number;
  value: number;
  priceChange24h: number;
  valueChange24h: number;
}

export interface Portfolio {
  tokens: PortfolioToken[];
  totalValue: number;
  totalChange24h: number;
  solBalance: number;
}

export interface PortfolioResponse {
  success: boolean;
  data?: Portfolio;
  error?: string;
}

export interface TokenBalanceResponse {
  success: boolean;
  balance?: number;
  error?: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data?: any[];
  error?: string;
}