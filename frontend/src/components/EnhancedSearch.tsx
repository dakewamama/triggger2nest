import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

interface RecentToken {
  mint: string;
  symbol: string;
  name: string;
  marketCap: number;
  progress: number;
  timestamp: number;
}

export default function EnhancedSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentTokens, setRecentTokens] = useState<RecentToken[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const GRADUATION_MARKET_CAP = 69000;

  useEffect(() => {
    const stored = localStorage.getItem('recentTokens');
    if (stored) {
      setRecentTokens(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToRecent = (token: any) => {
    const recent: RecentToken = {
      mint: token.mint,
      symbol: token.symbol,
      name: token.name,
      marketCap: token.usd_market_cap || 0,
      progress: ((token.usd_market_cap || 0) / GRADUATION_MARKET_CAP) * 100,
      timestamp: Date.now()
    };

    const updated = [recent, ...recentTokens.filter(t => t.mint !== token.mint)].slice(0, 5);
    setRecentTokens(updated);
    localStorage.setItem('recentTokens', JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      if (query.length === 44 && /^[A-Za-z0-9]+$/.test(query)) {
        try {
          const tokenInfo = await api.getTokenInfo(query);
          if (tokenInfo.success) {
            setSearchResults([tokenInfo.data]);
          }
        } catch {
          const results = await api.searchTokens(query);
          setSearchResults(Array.isArray(results) ? results.slice(0, 5) : []);
        }
      } else {
        const results = await api.searchTokens(query);
        setSearchResults(Array.isArray(results) ? results.slice(0, 5) : []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length > 1) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const selectToken = (token: any) => {
    if (token.usd_market_cap !== undefined) {
      addToRecent(token);
    }
    navigate(`/token/${token.mint}`);
    setQuery('');
    setIsOpen(false);
    setSearchResults([]);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(2)}K`;
    return `$${marketCap.toFixed(0)}`;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by token name, symbol, or contract address..."
          className="w-full bg-terminal-bg border border-terminal-border rounded px-4 py-3 pl-12 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-neon-lime"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSearchResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (query || recentTokens.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-terminal-bg border border-terminal-border rounded shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-pulse">Searching...</div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">Search Results</p>
              {searchResults.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => selectToken(token)}
                  className="w-full text-left px-3 py-3 hover:bg-gray-700 rounded transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {token.image && (
                      <img src={token.image} alt={token.symbol} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <div className="font-medium text-white">
                        {token.symbol}
                        <span className="text-gray-400 text-sm ml-2">{token.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {token.mint.slice(0, 8)}...{token.mint.slice(-6)}
                      </div>
                    </div>
                  </div>
                  {token.usd_market_cap && (
                    <div className="text-right">
                      <div className="text-sm text-neon-lime">
                        {formatMarketCap(token.usd_market_cap)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((token.usd_market_cap / GRADUATION_MARKET_CAP) * 100).toFixed(1)}% to grad
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : query.length > 1 && !loading ? (
            <div className="p-4 text-center text-gray-500">
              No tokens found for "{query}"
            </div>
          ) : null}

          {recentTokens.length > 0 && !query && (
            <div className="p-2 border-t border-terminal-border">
              <p className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Recent Tokens
              </p>
              {recentTokens.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => selectToken(token)}
                  className="w-full text-left px-3 py-3 hover:bg-gray-700 rounded transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">
                        {token.symbol}
                        <span className="text-gray-400 text-sm ml-2">{token.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {token.mint.slice(0, 8)}...{token.mint.slice(-6)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neon-lime">
                        {formatMarketCap(token.marketCap)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {token.progress.toFixed(0)}% to grad
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}