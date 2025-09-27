import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, TrendingUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tokensService } from '@/services/api/tokensService';
import debounce from 'lodash/debounce';

interface SearchResult {
  mint: string;
  name: string;
  symbol: string;
  image_uri?: string;
  market_cap?: number;
  usd_market_cap?: number;
  price_change_24h?: number;
  _searchScore?: number;
  _matchType?: string;
  _matchField?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 1) {
        setResults([]);
        setError('');
        return;
      }

      setIsSearching(true);
      setError('');

      try {
        console.log(`Searching for: ${searchQuery}`);
        
        // Make sure we're sending the query parameter correctly
        const response = await tokensService.searchTokens(searchQuery.trim(), {
          limit: 20,
          sortBy: 'trending'
        });
        
        if (response.data && Array.isArray(response.data)) {
          setResults(response.data);
          setIsOpen(true);
          
          if (response.data.length === 0) {
            setError('No tokens found. Try a different search.');
          }
        } else {
          setResults([]);
          setError('No results found');
        }
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      performSearch(value);
    } else {
      setResults([]);
      setIsOpen(false);
      setError('');
    }
  };

  // Handle result click
  const handleResultClick = (token: SearchResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(`/token/${token.mint}`);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError('');
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Format market cap
  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  // Get match type badge
  const getMatchBadge = (matchType?: string, matchField?: string) => {
    if (!matchType || !matchField) return null;
    
    const badges: Record<string, { text: string; color: string }> = {
      'contract_address': { text: 'Contract', color: 'bg-purple-500' },
      'symbol': { text: 'Symbol', color: 'bg-blue-500' },
      'name': { text: 'Name', color: 'bg-green-500' },
      'description': { text: 'Description', color: 'bg-gray-500' },
    };
    
    const badge = badges[matchField] || { text: matchType, color: 'bg-gray-400' };
    
    return (
      <span className={`px-2 py-0.5 text-xs text-white rounded ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search by token name, symbol, or contract address..."
          className="w-full px-10 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none"
        />
        
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        
        {isSearching && (
          <Loader2 className="absolute right-10 top-2.5 w-5 h-5 text-green-400 animate-spin" />
        )}
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {error && (
            <div className="p-4 text-center text-gray-400">
              {error}
            </div>
          )}
          
          {!error && results.length > 0 && (
            <div className="py-2">
              {results.map((token) => (
                <button
                  key={token.mint}
                  onClick={() => handleResultClick(token)}
                  className="w-full px-4 py-3 hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Token Image */}
                      {token.image_uri ? (
                        <img 
                          src={token.image_uri} 
                          alt={token.symbol}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {token.symbol?.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      {/* Token Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {token.name || 'Unknown'}
                          </span>
                          <span className="text-gray-400 text-sm">
                            ${token.symbol || 'N/A'}
                          </span>
                          {getMatchBadge(token._matchType, token._matchField)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {token.mint}
                        </div>
                      </div>
                    </div>
                    
                    {/* Market Cap & Price Change */}
                    <div className="text-right">
                      <div className="text-sm text-gray-300">
                        {formatMarketCap(token.usd_market_cap || token.market_cap)}
                      </div>
                      {token.price_change_24h !== undefined && (
                        <div className={`text-xs flex items-center gap-1 ${
                          token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {token.price_change_24h >= 0 ? '+' : ''}
                          {token.price_change_24h.toFixed(2)}%
                        </div>
                      )}
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