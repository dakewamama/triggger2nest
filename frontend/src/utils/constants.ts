export const LAMPORTS_PER_SOL = 1_000_000_000;
export const DEFAULT_TOKEN_DECIMALS = 6;

export const TRANSACTION_FEES = {
  CREATE_TOKEN: 0.02,
  MIN_BUY: 0.001,
  TRANSACTION: 0.000005,
} as const;

export const VALIDATION = {
  MAX_NAME_LENGTH: 50,
  MAX_SYMBOL_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

export const REFRESH_INTERVALS = {
  PRICE: 5000, // 5 seconds
  TRADES: 10000, // 10 seconds
  BALANCE: 30000, // 30 seconds
} as const;

export const SOLANA_EXPLORER_URL = 'https://solscan.io';
export const PUMP_FUN_URL = 'https://pump.fun';

export const getExplorerUrl = (type: 'tx' | 'token' | 'address', value: string, network: string = 'mainnet'): string => {
  const cluster = network === 'devnet' ? '?cluster=devnet' : '';
  return `${SOLANA_EXPLORER_URL}/${type}/${value}${cluster}`;
};

export const getPumpFunUrl = (mint: string): string => {
  return `${PUMP_FUN_URL}/${mint}`;
};