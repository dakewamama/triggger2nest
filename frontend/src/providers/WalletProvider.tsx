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
