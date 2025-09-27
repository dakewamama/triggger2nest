import React, { useState } from 'react';
import { tokensService } from '@/services/api';

export default function TestSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Searching for:', query);
      const response = await tokensService.searchTokens(query, {
        limit: 10,
        sortBy: 'trending'
      });
      
      console.log('Search response:', response);
      
      if (response.data && response.data.length > 0) {
        setResults(response.data);
      } else {
        setError('No results found');
        setResults([]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Test Token Search</h1>
      
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by name, symbol, or contract address..."
          className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-green-400 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Results ({results.length})
        </h2>
        
        {results.map((token, index) => (
          <div key={token.mint || index} className="p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{token.name || 'Unknown'}</h3>
                <p className="text-gray-400">${token.symbol || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1 break-all">{token.mint}</p>
                {token._matchType && (
                  <p className="text-xs text-green-400 mt-1">
                    Match: {token._matchType} ({token._matchField})
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm">
                  Market Cap: ${(token.usd_market_cap || 0).toLocaleString()}
                </p>
                {token._searchScore && (
                  <p className="text-xs text-gray-400">
                    Score: {token._searchScore}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold mb-2">Test Queries:</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Try a symbol: "PEPE", "DOGE", "SHIB"</li>
          <li>• Try a partial name: "moon", "dog", "cat"</li>
          <li>• Try a partial contract: first 4-6 characters of any contract address</li>
          <li>• Try with typos: "doje" (for doge), "peppe" (for pepe)</li>
        </ul>
      </div>
    </div>
  );
}
