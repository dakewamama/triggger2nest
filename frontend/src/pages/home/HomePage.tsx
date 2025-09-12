import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Sparkles, 
  Crown, 
  Search, 
  RefreshCw,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Activity,
  DollarSign,
  Users,
  Trophy
} from 'lucide-react';
import { pumpFunApi, type PumpToken } from '../../services/pump-api/pump-fun.service';
import { useWallet } from '../../hooks/useWallet';

export default function HomePage() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'featured'>('trending');
  const [tokens, setTokens] = useState<PumpToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [marketStats, setMarketStats] = useState<any>(null);
  
  useEffect(() => {
    fetchTokens();
    fetchMarketStats();
  }, [activeTab]);
  
  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let fetchedTokens: PumpToken[] = [];
      
      switch (activeTab) {
        case 'trending':
          fetchedTokens = await pumpFunApi.getTrendingTokens(50);
          break;
        case 'new':
          fetchedTokens = await pumpFunApi.getNewTokens(50);
          break;
        case 'featured':
          fetchedTokens = await pumpFunApi.getFeaturedTokens(50);
          break;
      }
      
      setTokens(fetchedTokens);
    } catch (err: any) {
      console.error('Failed to fetch tokens:', err);
      setError(err.message || 'Failed to load tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketStats = async () => {
    try {
      const stats = await pumpFunApi.getMarketStats();
      setMarketStats(stats);
    } catch (error) {
      console.error('Failed to fetch market stats:', error);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTokens();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await pumpFunApi.searchTokens(searchQuery);
      setTokens(results);
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTokens(), fetchMarketStats()]);
    setRefreshing(false);
  };
  
  const formatPrice = (price: number) => {
    return pumpFunApi.formatPrice(price);
  };
  
  const formatMarketCap = (marketCap: number) => {
    return pumpFunApi.formatMarketCap(marketCap);
  };
  
  const formatTimeAgo = (timestamp: number) => {
    return pumpFunApi.formatTimeAgo(timestamp);
  };
  
  const truncateAddress = (address: string) => {
    return pumpFunApi.formatAddress(address);
  };

  const calculateMockPriceChange = (token: PumpToken) => {
    // Simple mock calculation based on token properties
    const factor = (token.usd_market_cap + token.reply_count) % 100;
    return (factor - 50) / 2; // Range from -25% to +25%
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
            
            {/* Market Stats */}
            {marketStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400 text-sm">Total Tokens</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{marketStats.totalTokens?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400 text-sm">Market Cap</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatMarketCap(marketStats.totalMarketCap || 0)}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-400 text-sm">Active</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{marketStats.activeTokens?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400 text-sm">24h New</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{marketStats.last24Hours?.newTokens?.toLocaleString() || '0'}</p>
                </div>
              </div>
            )}
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by token name, symbol, or mint address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium transition-colors"
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
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading {activeTab} tokens...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              {searchQuery ? `No tokens found for "${searchQuery}"` : `No ${activeTab} tokens found`}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchTokens();
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tokens.map((token) => {
              const price = token.price || pumpFunApi.calculatePrice(token);
              const priceChange = calculateMockPriceChange(token);
              
              return (
                <Link
                  key={token.mint}
                  to={`/token/${token.mint}`}
                  className="bg-gray-800 hover:bg-gray-750 rounded-lg p-4 transition-all hover:transform hover:scale-105 border border-gray-700 hover:border-green-500"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {token.image_uri ? (
                        <img
                          src={token.image_uri}
                          alt={token.symbol}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/48/6B7280/FFFFFF?text=${token.symbol[0]}`;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{token.symbol[0]}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white text-sm">{token.name}</h3>
                        <p className="text-xs text-gray-400">${token.symbol}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {token.complete && (
                        <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded text-center">
                          Graduated
                        </span>
                      )}
                      {token.is_currently_live && !token.complete && (
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-400 text-xs rounded text-center">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2 min-h-[32px]">
                    {token.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="font-mono text-white text-sm">{formatPrice(price)}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${
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
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Market Cap</p>
                        <p className="font-medium text-white text-sm">
                          {formatMarketCap(token.usd_market_cap)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Created</p>
                        <p className="text-xs text-gray-300">
                          {formatTimeAgo(token.created_timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>by</span>
                      <span className="font-mono text-gray-300">
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
                          className="text-gray-400 hover:text-blue-400 transition-colors"
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
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <a
                        href={pumpFunApi.getPumpFunUrl(token.mint)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-green-400 transition-colors"
                        title="View on Pump.fun"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        
        {/* Load More Button */}
        {tokens.length > 0 && tokens.length >= 50 && (
          <div className="text-center mt-8">
            <button
              onClick={() => {
                // Implement pagination
                console.log('Load more tokens');
              }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Load More Tokens
            </button>
          </div>
        )}
      </div>
    </div>
  );
}