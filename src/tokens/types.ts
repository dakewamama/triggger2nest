import { PumpFunToken } from './entities/pump-fun-token.entity';

export interface TokenTrade {
  signature: string;
  mint: string;
  sol_amount: number;
  token_amount: number;
  is_buy: boolean;
  user: string;
  timestamp: number;
  tx_index: number;
  username?: string;
  profile_image?: string;
}

export interface SearchResult {
  data: PumpFunToken[];
  suggestions?: string[];
  relatedTokens?: PumpFunToken[];
  searchType?: 'exact' | 'fuzzy' | 'partial' | 'ca' | 'ca_partial';
  totalMatches?: number;
}

export interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  activeTokens: number;
  successfulGraduations: number;
  totalTokens?: number;
  last24Hours?: {
    newTokens?: number;
    volume?: number;
    trades?: number;
  };
}