import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';

// Get RPC URL from environment
const getRPCUrl = (): string => {
  const envRpc = import.meta.env.VITE_SOLANA_RPC_URL;
  
  if (envRpc) {
    console.log('✅ Using RPC from .env:', envRpc.substring(0, 40) + '...');
    return envRpc;
  }
  
  console.warn('⚠️ VITE_SOLANA_RPC_URL not found, using default RPC');
  return 'https://api.mainnet-beta.solana.com';
};

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
    // FIXED: Use environment variable instead of hardcoded URL
    const rpcUrl = getRPCUrl();
    return {
      connection: new Connection(rpcUrl, 'confirmed')
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
  
  // FIXED: Create connection using environment variable
  const rpcUrl = getRPCUrl();
  const connection = new Connection(rpcUrl, 'confirmed');

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