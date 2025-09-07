// ===== src/contexts/WalletContext.tsx =====
import React, { createContext, useContext, useEffect, useState } from 'react';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivySolanaWallets } from '@privy-io/react-auth/solana';
import { ENV } from '../config/env';

interface WalletContextType {
  // Wallet state
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: number;
  
  // Wallet actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  
  // User info
  user: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

// Inner provider that uses Privy hooks
function WalletContextProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const solanaWallets = usePrivySolanaWallets();
  
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get the active Solana wallet
  const solanaWallet = wallets.find(w => w.walletClientType === 'solana');
  const address = solanaWallet?.address || null;
  const isConnected = authenticated && !!address;
  
  // Fetch wallet balance
  useEffect(() => {
    if (address) {
      fetchBalance(address);
    }
  }, [address]);
  
  const fetchBalance = async (walletAddress: string) => {
    try {
      const response = await fetch(ENV.SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [walletAddress],
        }),
      });
      const data = await response.json();
      if (data.result) {
        setBalance(data.result.value / 1e9); // Convert lamports to SOL
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };
  
  const connect = async () => {
    try {
      setIsConnecting(true);
      await login();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };
  
  const disconnect = async () => {
    try {
      await logout();
      setBalance(0);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };
  
  const signTransaction = async (transaction: any) => {
    if (!solanaWallets.activeSolanaWallet) {
      throw new Error('No active Solana wallet');
    }
    return await solanaWallets.activeSolanaWallet.signTransaction(transaction);
  };
  
  const signMessage = async (message: Uint8Array) => {
    if (!solanaWallets.activeSolanaWallet) {
      throw new Error('No active Solana wallet');
    }
    return await solanaWallets.activeSolanaWallet.signMessage(message);
  };
  
  const value: WalletContextType = {
    address,
    isConnected,
    isConnecting: !ready || isConnecting,
    balance,
    connect,
    disconnect,
    signTransaction,
    signMessage,
    user,
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Main provider wrapper
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={ENV.PRIVY_APP_ID || 'clxwllwvs03xgpb0f70b8b8x5'} // Default test ID
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#10b981',
          logo: '/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
        },
        loginMethods: ['wallet', 'email', 'google'],
        defaultChain: {
          id: 101,
          name: 'Solana',
          network: 'solana',
        },
      }}
    >
      <WalletContextProvider>{children}</WalletContextProvider>
    </PrivyProvider>
  );
}


