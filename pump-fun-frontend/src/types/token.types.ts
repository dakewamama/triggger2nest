export interface Token {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  image?: string;
  price: number;
  marketCap: number;
  volume24h?: number;
  priceChange24h?: number;
  creator: string;
  createdAt: Date;
  isComplete: boolean;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface CreateTokenInput {
  name: string;
  symbol: string;
  description: string;
  image?: File;
}

export interface TokenTransaction {
  signature: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: Date;
  user: string;
}

export interface TokenMetrics {
  holders: number;
  transactions: number;
  liquidity: number;
  fullyDilutedValuation: number;
}