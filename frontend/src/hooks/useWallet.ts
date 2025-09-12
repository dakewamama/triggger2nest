import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { useLocalStorage } from './useLocalStorage';
import { ENV } from '../config/env';

// Define the wallet adapter interface
export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnect: () => Promise<void>;
  connect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>;
}

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
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  sendTransaction: (transaction: Transaction, connection?: Connection) => Promise<string>;
  refreshBalance: () => Promise<void>;
}

// Declare Phantom wallet interface
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
      signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
      on: (event: string, callback: (args: any) => void) => void;
      off: (event: string, callback: (args: any) => void) => void;
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

  // Connection instance
  const connection = new Connection(ENV.SOLANA_RPC, 'confirmed');

  const fetchBalance = useCallback(async (walletAddress: string) => {
    try {
      const publicKeyObj = new PublicKey(walletAddress);
      const lamports = await connection.getBalance(publicKeyObj);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(0);
    }
  }, [connection]);

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
      // Redirect to Phantom installation
      window.open('https://phantom.app/', '_blank');
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }

    setConnecting(true);

    try {
      const response = await window.solana.connect();
      updateWalletState(response.publicKey, true);
      
      console.log('✅ Wallet connected:', response.publicKey.toString());
    } catch (error: any) {
      setConnecting(false);
      console.error('❌ Wallet connection failed:', error);
      
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      } else if (error.code === -32002) {
        throw new Error('Connection request already pending');
      } else {
        throw new Error(error.message || 'Failed to connect wallet');
      }
    }
  }, [updateWalletState]);

  const disconnect = useCallback(() => {
    if (window.solana) {
      try {
        window.solana.disconnect();
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    updateWalletState(null, false);
    console.log('🔌 Wallet disconnected');
  }, [updateWalletState]);

  const signTransaction = useCallback(async (transaction: Transaction): Promise<Transaction> => {
    if (!window.solana || !connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signedTransaction = await window.solana.signTransaction(transaction);
      return signedTransaction;
    } catch (error: any) {
      console.error('❌ Transaction signing failed:', error);
      
      if (error.code === 4001) {
        throw new Error('User rejected the transaction');
      } else {
        throw new Error(error.message || 'Failed to sign transaction');
      }
    }
  }, [connected]);

  const signAllTransactions = useCallback(async (transactions: Transaction[]): Promise<Transaction[]> => {
    if (!window.solana || !connected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signedTransactions = await window.solana.signAllTransactions(transactions);
      return signedTransactions;
    } catch (error: any) {
      console.error('❌ Multiple transaction signing failed:', error);
      
      if (error.code === 4001) {
        throw new Error('User rejected the transactions');
      } else {
        throw new Error(error.message || 'Failed to sign transactions');
      }
    }
  }, [connected]);

  const sendTransaction = useCallback(async (transaction: Transaction, connectionOverride?: Connection): Promise<string> => {
    if (!window.solana || !connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const conn = connectionOverride || connection;
      
      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send the transaction
      const signature = await conn.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      
      console.log('📤 Transaction sent:', signature);
      
      // Wait for confirmation
      const confirmation = await conn.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      
      console.log('✅ Transaction confirmed:', signature);
      
      // Refresh balance after successful transaction
      if (address) {
        await fetchBalance(address);
      }
      
      return signature;
    } catch (error: any) {
      console.error('❌ Transaction failed:', error);
      throw new Error(error.message || 'Transaction failed');
    }
  }, [connected, connection, signTransaction, address, fetchBalance]);

  const refreshBalance = useCallback(async () => {
    if (address) {
      await fetchBalance(address);
    }
  }, [address, fetchBalance]);

  // Initialize wallet state on mount
  useEffect(() => {
    const initializeWallet = async () => {
      if (window.solana?.isPhantom) {
        // Check if already connected
        if (window.solana.isConnected && window.solana.publicKey) {
          updateWalletState(window.solana.publicKey, true);
        } else if (savedAddress) {
          // Try to auto-connect if we have a saved address
          try {
            await window.solana.connect({ onlyIfTrusted: true });
            if (window.solana.publicKey) {
              updateWalletState(window.solana.publicKey, true);
            }
          } catch (error) {
            // Silent fail for auto-connect
            console.log('Auto-connect failed, user needs to manually connect');
            setSavedAddress(null);
          }
        }
      }
    };

    // Wait for wallet to be injected
    if (window.solana) {
      initializeWallet();
    } else {
      // Check periodically for wallet injection
      const checkWallet = setInterval(() => {
        if (window.solana) {
          initializeWallet();
          clearInterval(checkWallet);
        }
      }, 100);

      // Clear interval after 5 seconds
      setTimeout(() => clearInterval(checkWallet), 5000);
    }
  }, [savedAddress, updateWalletState, setSavedAddress]);

  // Listen for wallet events
  useEffect(() => {
    if (window.solana) {
      const handleConnect = (publicKey: PublicKey) => {
        console.log('🔗 Wallet connect event:', publicKey.toString());
        updateWalletState(publicKey, true);
      };

      const handleDisconnect = () => {
        console.log('🔌 Wallet disconnect event');
        updateWalletState(null, false);
      };

      const handleAccountChange = (publicKey: PublicKey | null) => {
        console.log('👤 Account change event:', publicKey?.toString());
        if (publicKey) {
          updateWalletState(publicKey, true);
        } else {
          updateWalletState(null, false);
        }
      };

      // Add event listeners
      window.solana.on('connect', handleConnect);
      window.solana.on('disconnect', handleDisconnect);
      window.solana.on('accountChanged', handleAccountChange);

      return () => {
        // Remove event listeners
        window.solana?.off('connect', handleConnect);
        window.solana?.off('disconnect', handleDisconnect);
        window.solana?.off('accountChanged', handleAccountChange);
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

  // Create the return object
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
    refreshBalance,
  };

  return walletReturn;
}