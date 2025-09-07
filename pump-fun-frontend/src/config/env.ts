export const ENV = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  
  // Privy Configuration
  PRIVY_APP_ID: import.meta.env.VITE_PRIVY_APP_ID || '',
  
  // Solana Configuration
  SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta',
  SOLANA_RPC: import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com',
  
  // Pump.fun API
  PUMP_API_URL: import.meta.env.VITE_PUMP_API_URL || 'https://frontend-api.pump.fun',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Pump.Fun Clone',
  
  // Development
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Validate required environment variables
if (!ENV.PRIVY_APP_ID && ENV.IS_PROD) {
  throw new Error('VITE_PRIVY_APP_ID is required in production');
}