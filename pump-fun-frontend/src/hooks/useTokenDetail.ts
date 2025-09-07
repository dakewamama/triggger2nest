import { useState, useEffect, useCallback } from 'react';
import { pumpFunApi, type PumpToken, type TokenTrade } from '../services/pump-api/pump-fun.service';
import { REFRESH_INTERVALS } from '../utils/constants';

export function useTokenDetail(mintAddress: string | undefined) {
  const [token, setToken] = useState<PumpToken | null>(null);
  const [trades, setTrades] = useState<TokenTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTokenDetails = useCallback(async () => {
    if (!mintAddress) return;
    
    try {
      const details = await pumpFunApi.getTokenDetails(mintAddress);
      setToken(details);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch token details:', err);
      setError('Failed to load token details');
    } finally {
      setLoading(false);
    }
  }, [mintAddress]);
  
  const fetchTrades = useCallback(async () => {
    if (!mintAddress) return;
    
    try {
      const tradeList = await pumpFunApi.getTokenTrades(mintAddress, 100);
      setTrades(tradeList);
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    }
  }, [mintAddress]);
  
  const refresh = useCallback(async () => {
    await Promise.all([fetchTokenDetails(), fetchTrades()]);
  }, [fetchTokenDetails, fetchTrades]);
  
  useEffect(() => {
    if (mintAddress) {
      fetchTokenDetails();
      fetchTrades();
      
      // Auto-refresh trades
      const tradesInterval = setInterval(fetchTrades, REFRESH_INTERVALS.TRADES);
      
      // Auto-refresh price less frequently
      const priceInterval = setInterval(fetchTokenDetails, REFRESH_INTERVALS.PRICE * 3);
      
      return () => {
        clearInterval(tradesInterval);
        clearInterval(priceInterval);
      };
    }
  }, [mintAddress, fetchTokenDetails, fetchTrades]);
  
  return {
    token,
    trades,
    loading,
    error,
    refresh,
  };
}