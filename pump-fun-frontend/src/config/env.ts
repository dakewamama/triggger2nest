export const ENV = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3000',
  
  // Solana Configuration
  SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
  SOLANA_RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  SOLANA_RPC: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com', // Alias for compatibility
  
  // Pump.fun API
  PUMP_API_URL: import.meta.env.VITE_PUMP_API_URL || 'https://pumpapi.fun/api',
  
  // Privy Configuration
  PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID || '',
  
  // Environment Detection
  IS_DEV: import.meta.env.DEV || false,
};