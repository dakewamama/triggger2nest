// Custom Solana connection that avoids WebSocket issues
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';

// Use HTTP-only connection to avoid WebSocket issues
export const createConnection = () => {
  // Using HTTP endpoint instead of WebSocket
  const endpoint = 'https://api.mainnet-beta.solana.com';
  
  return new Connection(endpoint, {
    commitment: 'confirmed',
    // Disable WebSocket subscriptions
    wsEndpoint: undefined,
  });
};

// Re-export commonly used types
export { PublicKey, Transaction };
export type { Connection as ConnectionType };
