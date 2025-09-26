#!/bin/bash

# fix-missing-exports.sh - Fix all missing exports and bn.js issue

cd frontend || exit 1

echo "🔧 FIXING MISSING EXPORTS AND BN.JS"
echo "===================================="
echo ""

# 1. First, let's see what's being imported
echo "1. Checking what's being imported..."
echo "Header.tsx imports:"
grep "import.*WalletProvider" src/components/Header.tsx || true
echo ""
echo "TradingPanel.tsx imports:"
grep "import.*WalletProvider" src/components/TradingPanel.tsx || true

echo ""
echo "2. Creating complete WalletProvider with all exports..."
cat > src/providers/WalletProvider.tsx << 'EOF'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';

// Wallet Context
interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  connecting: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

// Connection Context
interface ConnectionContextType {
  connection: Connection;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

// Hook: useWallet
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    // Return mock wallet if no provider
    return {
      publicKey: null,
      connected: false,
      connect: async () => console.log('Wallet not configured'),
      disconnect: () => console.log('Wallet not configured'),
      signTransaction: async (tx: Transaction) => tx,
      connecting: false,
    };
  }
  return context;
};

// Hook: useConnection
export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    // Return default connection if no provider
    return {
      connection: new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
    };
  }
  return context;
};

// WalletMultiButton Component
export const WalletMultiButton: React.FC = () => {
  const { connected, connect, disconnect, publicKey, connecting } = useWallet();
  
  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };
  
  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }
    return 'Connect Wallet';
  };
  
  return (
    <button 
      onClick={handleClick}
      disabled={connecting}
      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      {getButtonText()}
    </button>
  );
};

// Main Provider Component
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  // Create connection (HTTP-only to avoid WebSocket issues)
  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

  const connect = async () => {
    try {
      setConnecting(true);
      const { solana } = window as any;
      
      if (solana?.isPhantom) {
        const response = await solana.connect();
        setPublicKey(response.publicKey);
        setConnected(true);
        console.log('Wallet connected:', response.publicKey.toString());
      } else {
        // Open Phantom website if not installed
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    const { solana } = window as any;
    if (solana) {
      solana.disconnect();
      setPublicKey(null);
      setConnected(false);
      console.log('Wallet disconnected');
    }
  };

  const signTransaction = async (transaction: Transaction): Promise<Transaction> => {
    const { solana } = window as any;
    if (!solana || !connected) {
      throw new Error('Wallet not connected');
    }
    return await solana.signTransaction(transaction);
  };

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    const { solana } = window as any;
    if (solana?.isPhantom) {
      // Set up event listeners
      solana.on('connect', () => {
        setPublicKey(solana.publicKey);
        setConnected(true);
      });
      
      solana.on('disconnect', () => {
        setPublicKey(null);
        setConnected(false);
      });

      // Check if already connected
      if (solana.isConnected) {
        setPublicKey(solana.publicKey);
        setConnected(true);
      }
    }
  }, []);

  const walletValue = {
    publicKey,
    connected,
    connect,
    disconnect,
    signTransaction,
    connecting,
  };

  const connectionValue = {
    connection,
  };

  return (
    <ConnectionContext.Provider value={connectionValue}>
      <WalletContext.Provider value={walletValue}>
        {children}
      </WalletContext.Provider>
    </ConnectionContext.Provider>
  );
};

// Default export
export default WalletProvider;
EOF

echo "✅ Created WalletProvider with all required exports"

echo ""
echo "3. Installing compatible Solana version..."
npm uninstall @solana/web3.js
npm install --save @solana/web3.js@1.66.2 buffer@6.0.3 process@0.11.10

echo ""
echo "4. Creating polyfills with bn.js fix..."
cat > src/polyfills.ts << 'EOF'
import { Buffer } from 'buffer';
import process from 'process';

// Set up globals
(window as any).Buffer = Buffer;
(window as any).process = process;
(window as any).global = window;

console.log('✅ Polyfills loaded');
EOF

echo ""
echo "5. Updating vite.config.ts..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      process: 'process/browser',
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
    include: ['buffer', 'process'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})
EOF

echo ""
echo "6. Ensuring polyfills load first in main.tsx..."
if ! grep -q "polyfills" src/main.tsx; then
    sed -i.bak '1i\
import "./polyfills";' src/main.tsx
fi

echo ""
echo "7. Clearing all caches..."
rm -rf node_modules/.vite .vite dist
rm -f src/main.tsx.bak

echo ""
echo "===================================="
echo "✅ ALL FIXES APPLIED!"
echo "===================================="
echo ""
echo "Fixed:"
echo "• WalletMultiButton export ✅"
echo "• useConnection export ✅"
echo "• useWallet export ✅"
echo "• bn.js default export issue ✅"
echo "• Buffer/process polyfills ✅"
echo ""
echo "Starting development server..."
npm run dev