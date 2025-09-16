interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PUMP_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_SOLANA_NETWORK: string
  readonly VITE_SOLANA_RPC_URL: string
  readonly VITE_PRIVY_APP_ID: string
}

// Safe environment variable access
const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side - try to get from build-time environment
    try {
      const env = (import.meta as any).env
      return env?.[key] || defaultValue
    } catch {
      return defaultValue
    }
  }
  return defaultValue
}

const isDev = () => {
  try {
    return (import.meta as any).env?.MODE === 'development' || process.env.NODE_ENV === 'development'
  } catch {
    return true // Default to dev in case of errors
  }
}

export const ENV = {
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:8000'),
  PUMP_API_URL: getEnvVar('VITE_PUMP_API_URL', 'https://frontend-api.pump.fun'),
  WS_URL: getEnvVar('VITE_WS_URL', 'ws://localhost:8000'),
  SOLANA_NETWORK: getEnvVar('VITE_SOLANA_NETWORK', 'mainnet-beta'),
  SOLANA_RPC_URL: getEnvVar('VITE_SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'), 
  // Add missing properties:
  SOLANA_RPC: getEnvVar('VITE_SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'),
  PRIVY_APP_ID: getEnvVar('VITE_PRIVY_APP_ID', ''),
  IS_DEV: isDev(),
} as const

export default ENV