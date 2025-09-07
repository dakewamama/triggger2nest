import { useState, useEffect, useCallback } from 'react';
import { pumpFunApi, type PumpToken } from '../services/pump-api/pump-fun.service';
import { debounce } from '../utils/helpers';

interface UseTokensOptions {
  type?: 'trending' | 'new' | 'featured';
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useTokens(options: UseTokensOptions = {}) {
  const {
    type = 'trending',
    limit = 20,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options;
  
  const [tokens, setTokens] = useState<PumpToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchTokens = useCallback(async () => {
    try {
      setError(null);
      let fetchedTokens: PumpToken[] = [];
      
      switch (type) {
        case 'trending':
          fetchedTokens = await pumpFunApi.getTrendingTokens(limit);
          break;
        case 'new':
          fetchedTokens = await pumpFunApi.getNewTokens(limit);
          break;
        case 'featured':
          fetchedTokens = await pumpFunApi.getFeaturedTokens(limit);
          break;
      }
      
      setTokens(fetchedTokens);
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      setError('Failed to load tokens');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [type, limit]);
  
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTokens();
  }, [fetchTokens]);
  
  const search = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        await fetchTokens();
        return;
      }
      
      setLoading(true);
      try {
        const results = await pumpFunApi.searchTokens(query);
        setTokens(results);
      } catch (err) {
        setError('Search failed');
      } finally {
        setLoading(false);
      }
    }, 500),
    [fetchTokens]
  );
  
  useEffect(() => {
    fetchTokens();
    
    if (autoRefresh) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTokens, autoRefresh, refreshInterval, refresh]);
  
  return {
    tokens,
    loading,
    error,
    refreshing,
    refresh,
    search,
  };
}