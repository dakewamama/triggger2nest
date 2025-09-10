export const ENV = {
  // API Configuration - 
  API_URL: import.meta.env.VITE_API_URL || 'https://9938131800d7.ngrok-free.app',
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://9938131800d7.ngrok-free.app',
  
  // Solana Configuration
  SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
  SOLANA_RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  SOLANA_RPC: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  
  // Removed direct Pump.fun API - we'll use our backend instead
  // PUMP_API_URL: import.meta.env.VITE_PUMP_API_URL || 'https://pumpapi.fun/api',
  
  // Privy Configuration
  PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID || '',
  
  // Environment Detection
  IS_DEV: import.meta.env.DEV || false,
};