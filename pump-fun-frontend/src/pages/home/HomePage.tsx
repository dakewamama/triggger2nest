import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Sparkles, 
  Crown, 
  Search, 
  RefreshCw,
  ExternalLink,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { pumpFunApi, PumpToken } from '../services/pump-api/pump-fun.service';
import { useWallet } from '../contexts/WalletContext';

export default function HomePage() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'featured'>('trending');
  const [tokens, setTokens] = useState<PumpToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchTokens();
  }, [activeTab]);
  
  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fetchedTokens: PumpToken[] = [];
      
      switch (activeTab) {
        case 'trending':
          fetchedTokens = await pumpFunApi.getTrendingTokens(30);
          break;
        case 'new':
          fetchedTokens = await pumpFunApi.getNewTokens(30);
          break;
        case 'featured':
          fetchedTokens = await pumpFunApi.getFeaturedTokens(30);
          break;
      }
      
      setTokens(fetchedTokens);
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      setError('Failed to load tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTokens();
      return;
    }
    
    setLoading(true);
    try {
      const results = await pumpFunApi.searchTokens(searchQuery);
      setTokens(results);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTokens();
    setRefreshing(false);
  };
  
  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(2);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(2);
  };
  
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };
  
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Trade Meme Coins on <span className="text-green-400">Pump.Fun</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              The fastest and fairest platform to launch and trade meme coins on Solana
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by token name or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Link
                to="/create"
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isConnected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Launch Your Token
              </Link>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trending
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            New
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'featured'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4" />
            King of the Hill
          </button>
        </div>
        
        {/* Tokens Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No tokens found. Try refreshing or searching for different tokens.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => {
              const price = pumpFunApi.calculatePrice(token);
              const priceChange = Math.random() * 40 - 20; // Mock price change
              
              return (
                <Link
                  key={token.mint}
                  to={`/token/${token.mint}`}
                  className="bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-all hover:transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {token.image_uri ? (
                        <img
                          src={token.image_uri}
                          alt={token.symbol}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-token.png';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold">{token.symbol[0]}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white">{token.name}</h3>
                        <p className="text-sm text-gray-400">{token.symbol}</p>
                      </div>
                    </div>
                    {token.complete && (
                      <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded">
                        Graduated
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {token.description || 'No description available'}
                  </p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="font-mono text-white">${formatPrice(price)}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {priceChange >= 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(priceChange).toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Market Cap</p>
                      <p className="font-medium text-white">
                        {formatMarketCap(token.usd_market_cap)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>by</span>
                      <span className="font-mono">
                        {truncateAddress(token.creator)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {token.twitter && (
                        <a
                          href={`https://twitter.com/${token.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-blue-400"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {token.telegram && (
                        <a
                          href={token.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-blue-400"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}