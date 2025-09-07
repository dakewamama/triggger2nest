import { useState, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ENV } from '../config/env';
import { REFRESH_INTERVALS } from '../utils/constants';

export function useBalance(address: string | null) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!address) {
      setBalance(0);
      return;
    }
    
    const fetchBalance = async () => {
      setLoading(true);
      try {
        const connection = new Connection(ENV.SOLANA_RPC);
        const publicKey = new PublicKey(address);
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
    const interval = setInterval(fetchBalance, REFRESH_INTERVALS.BALANCE);
    
    return () => clearInterval(interval);
  }, [address]);
  
  return { balance, loading };
}
