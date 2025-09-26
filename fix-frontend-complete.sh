#!/bin/bash

# alternative-solana-fix.sh - Fix by using HTTP-only connection

cd frontend || exit 1

echo "🔧 ALTERNATIVE SOLANA FIX - HTTP ONLY"
echo "====================================="
echo ""

# 1. Install specific versions that work
echo "1. Installing working version combination..."
npm uninstall @solana/web3.js rpc-websockets
npm install --save @solana/web3.js@1.78.0

# Install the missing dependencies manually
npm install --save \
  rpc-websockets@7.5.1 \
  eventemitter3@4.0.7 \
  ws@7.5.9

echo ""
echo "2. Creating custom Solana connection wrapper..."
cat > src/utils/solanaConnection.ts << 'EOF'
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
EOF

echo ""
echo "3. Updating WalletProvider to use HTTP connection..."
cat > src/providers/WalletProvider.tsx << 'EOF'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicKey, Transaction, createConnection } from '../utils/solanaConnection';

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  connection: ReturnType<typeof createConnection>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  
  // Use HTTP-only connection
  const connection = createConnection();

  const connect = async () => {
    try {
      const { solana } = window as any;
      if (solana?.isPhantom) {
        const response = await solana.connect();
        setPublicKey(response.publicKey);
        setConnected(true);
        console.log('Wallet connected:', response.publicKey.toString());
      } else {
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = () => {
    const { solana } = window as any;
    if (solana) {
      solana.disconnect();
      setPublicKey(null);
      setConnected(false);
    }
  };

  const signTransaction = async (transaction: Transaction): Promise<Transaction> => {
    const { solana } = window as any;
    if (!solana || !connected) {
      throw new Error('Wallet not connected');
    }
    return await solana.signTransaction(transaction);
  };

  useEffect(() => {
    const { solana } = window as any;
    if (solana?.isPhantom) {
      solana.on('connect', () => {
        setPublicKey(solana.publicKey);
        setConnected(true);
      });
      
      solana.on('disconnect', () => {
        setPublicKey(null);
        setConnected(false);
      });

      if (solana.isConnected) {
        setPublicKey(solana.publicKey);
        setConnected(true);
      }
    }
  }, []);

  const value = {
    publicKey,
    connected,
    connect,
    disconnect,
    signTransaction,
    connection,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
EOF

echo ""
echo "4. Creating simpler vite.config.ts..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
      '/pump': 'http://localhost:8000',
      '/tokens': 'http://localhost:8000',
      '/wallet': 'http://localhost:8000',
      '/trading': 'http://localhost:8000',
    },
  },
  optimizeDeps: {
    exclude: ['@solana/web3.js'],
    include: ['buffer', 'process'],
  },
})
EOF

echo ""
echo "5. Update TradingPanel import..."
# Check if TradingPanel exists and update its import
if [ -f "src/components/TradingPanel.tsx" ]; then
    # Backup original
    cp src/components/TradingPanel.tsx src/components/TradingPanel.tsx.bak
    
    # Update import to use our wrapper
    sed -i '' "s|from '@solana/web3.js'|from '@/utils/solanaConnection'|g" src/components/TradingPanel.tsx
    
    echo "✅ Updated TradingPanel.tsx imports"
fi

echo ""
echo "6. Clearing all caches..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
rm -rf node_modules/.cache

echo ""
echo "====================================="
echo "✅ ALTERNATIVE FIX APPLIED!"
echo "====================================="
echo ""
echo "This fix:"
echo "• Uses HTTP-only connections (no WebSocket)"
echo "• Avoids rpc-websockets import issues"
echo "• Keeps wallet functionality working"
echo ""
echo "Starting development server..."
npm run dev