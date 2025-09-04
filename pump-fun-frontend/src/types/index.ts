// API Response types for our pump.fun backend
export interface TokenResponse {
  message: string;
  transactionId: string;
  mintAddress?: string;
  pumpUrl?: string;
  success?: boolean;
}

export interface CreateTokenDto {
  name: string;
  symbol: string;
  description: string;
}

export interface CreateTokenWithImageDto extends CreateTokenDto {
  image?: File;
}

export interface BuyTokenDto {
  mintAddress: string;
  amountSol: number;
}

export interface SellTokenDto {
  mintAddress: string;
  amountTokens: number;
}

// UI State types
export interface ApiError {
  message: string;
  status?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: ApiError | null;
}