export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta',
  SOLANA_RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
  APP_NAME: 'TRIGGER Terminal',
  APP_VERSION: '1.0.0',
  ENABLE_DEBUG: import.meta.env.VITE_ENABLE_DEBUG === 'true' || import.meta.env.DEV,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  DEFAULT_SLIPPAGE: 1,
  DEFAULT_PRIORITY_FEE: 0.00001,
  LAMPORTS_PER_SOL: 1_000_000_000,
  REFRESH_INTERVAL: 30000,
  PRICE_REFRESH_INTERVAL: 5000,
  MIN_SOL_AMOUNT: 0.001,
  MAX_SOL_AMOUNT: 1000,
};

// Log configuration
console.log(`🚀 ${ENV.APP_NAME} v${ENV.APP_VERSION}`);
console.log(`📍 Backend API: ${ENV.API_URL}`);
console.log(`🌐 Solana Network: ${ENV.SOLANA_NETWORK}`);
console.log(`⚙️ Environment: ${import.meta.env.MODE}`);
