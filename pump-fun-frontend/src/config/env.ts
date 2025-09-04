
export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'trigger2nest',
  SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
  
  
  get API_URL() {
    return `${this.API_BASE_URL}/pump`
  }
} as const

// Type for environment
export type EnvConfig = typeof env