import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useLocalStorage } from './useLocalStorage';
import { ENV } from '../config/env';

// Define the return type interface
export interface UseWalletReturn {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  sendTransaction: (transaction: any, connection?: Connection) => Promise<string>;
}

// Declare Phantom wallet interface
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAllTransactions: (transactions: any[]) => Promise<any[]>;
      signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
      on: (event: string, callback: () => void) => void;
      off: (event: string, callback: () => void) => void;
      publicKey: PublicKey | null;
      isConnected: boolean;
    };
  }
}

export function useWallet(): UseWalletReturn {
  // State variables
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);

  const [savedAddress, setSavedAddress] = useLocalStorage<string | null>('wallet-address', null);

  const fetchBalance = useCallback(async (walletAddress: string) => {
    try {
      const connection = new Connection(ENV.SOLANA_RPC);
      const publicKeyObj = new PublicKey(walletAddress);
      const lamports = await connection.getBalance(publicKeyObj);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(0);
    }
  }, []);

  const updateWalletState = useCallback((newPublicKey: PublicKey | null, newConnected: boolean) => {
    const newAddress = newPublicKey?.toString() || null;
    setPublicKey(newPublicKey);
    setConnected(newConnected);
    setConnecting(false);
    setAddress(newAddress);
    setSavedAddress(newAddress);
    
    // Fetch balance when wallet connects
    if (newConnected && newAddress) {
      fetchBalance(newAddress);
    } else {
      setBalance(0);
    }
  }, [setSavedAddress, fetchBalance]);

  const connect = useCallback(async () => {
    if (!window.solana) {
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }

    setConnecting(true);

    try {
      const response = await window.solana.connect();
      updateWalletState(response.publicKey, true);
    } catch (error) {
      setConnecting(false);
      throw error;
    }
  }, [updateWalletState]);

  const disconnect = useCallback(() => {
    if (window.solana) {
      window.solana.disconnect();
    }
    updateWalletState(null, false);
  }, [updateWalletState]);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!window.solana || !connected) {
      throw new Error('Wallet not connected');
    }
    return await window.solana.signTransaction(transaction);
  }, [connected]);

  const signAllTransactions = useCallback(async (transactions: any[]) => {
    if (!window.solana || !connected) {
      throw new Error('Wallet not connected');
    }
    return await window.solana.signAllTransactions(transactions);
  }, [connected]);

  const sendTransaction = useCallback(async (transaction: any, connection?: Connection) => {
    if (!window.solana || !connected) {
      throw new Error('Wallet not connected');
    }

    const conn = connection || new Connection(ENV.SOLANA_RPC);
    const { signature } = await window.solana.signAndSendTransaction(transaction);
    
    // Wait for confirmation
    await conn.confirmTransaction(signature);
    return signature;
  }, [connected]);

  // Initialize wallet state on mount
  useEffect(() => {
    const initializeWallet = () => {
      if (window.solana?.isPhantom) {
        if (window.solana.isConnected && window.solana.publicKey) {
          updateWalletState(window.solana.publicKey, true);
        } else if (savedAddress) {
          // Try to reconnect if we have a saved address
          connect().catch(() => {
            // Silent fail - user can manually reconnect
            setSavedAddress(null);
          });
        }
      }
    };

    // Wait for wallet to be injected
    if (window.solana) {
      initializeWallet();
    } else {
      const checkWallet = setInterval(() => {
        if (window.solana) {
          initializeWallet();
          clearInterval(checkWallet);
        }
      }, 100);

      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkWallet), 5000);
    }
  }, [savedAddress, connect, updateWalletState, setSavedAddress]);

  // Listen for wallet events
  useEffect(() => {
    if (window.solana) {
      const handleConnect = () => {
        if (window.solana?.publicKey) {
          updateWalletState(window.solana.publicKey, true);
        }
      };

      const handleDisconnect = () => {
        updateWalletState(null, false);
      };

      window.solana.on('connect', handleConnect);
      window.solana.on('disconnect', handleDisconnect);

      return () => {
        window.solana?.off('connect', handleConnect);
        window.solana?.off('disconnect', handleDisconnect);
      };
    }
  }, [updateWalletState]);

  // Periodically refresh balance
  useEffect(() => {
    if (connected && address) {
      const interval = setInterval(() => {
        fetchBalance(address);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [connected, address, fetchBalance]);

  // Create the return object with explicit property assignments
  const walletReturn: UseWalletReturn = {
    publicKey,
    connected,
    connecting,
    address,
    isConnected: connected,
    isConnecting: connecting,
    balance,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    sendTransaction,
  };

  return walletReturn;
}