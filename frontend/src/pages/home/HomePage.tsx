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
  Trophy,
  Plus,
  Zap,
  Star,
  Flame,
  Rocket,
  AlertTriangle
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
    const factor = (token.usd_market_cap + token.reply_count) % 100;
    return (factor - 50) / 2;
  };

  // Function to get varied card styles for staggered layout
  const getCardStyle = (index: number) => {
    const variants = [
      'transform rotate-1 hover:rotate-0',
      'transform -rotate-1 hover:rotate-0', 
      'transform rotate-0 hover:rotate-1',
      'transform rotate-2 hover:rotate-0',
      'transform -rotate-2 hover:rotate-0'
    ];
    return variants[index % variants.length];
  };

  const getCardSize = (index: number) => {
    // Create varied sizes for visual interest
    if (index % 7 === 0) return 'md:col-span-2 md:row-span-2'; // Large featured card
    if (index % 5 === 0) return 'md:col-span-2'; // Wide card
    if (index % 11 === 0) return 'md:row-span-2'; // Tall card
    return ''; // Normal card
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-x-hidden">
      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/3 w-24 h-24 bg-gradient-to-r from-yellow-500/12 to-orange-500/12 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section with Dynamic Layout */}
      <div className="relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main Title with Creative Positioning */}
            <div className="mb-12 relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl rotate-12 opacity-20 animate-pulse" />
              <div className="absolute -top-8 -right-8 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full rotate-45 opacity-30 animate-bounce" />
              
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
                Trade{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Meme Coins
                  </span>
                  <div className="absolute -top-4 -right-4 animate-spin-slow">
                    <Star className="w-8 h-8 text-yellow-400 opacity-60" />
                  </div>
                </span>
                <br />
                on{' '}
                <span className="relative">
                  Pump.Fun
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-60" />
                </span>
              </h1>
              <p className="text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                The fastest and fairest platform to launch and trade meme coins on Solana
              </p>
            </div>
            
            {/* Market Stats - Floating Cards with Offset Positioning */}
            {marketStats && (
              <div className="relative mb-16">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                  {[
                    {
                      icon: Activity,
                      label: 'Total Tokens',
                      value: marketStats.totalTokens?.toLocaleString() || '0',
                      color: 'from-green-500 to-emerald-500',
                      delay: '0ms',
                      position: 'transform rotate-2',
                    },
                    {
                      icon: DollarSign,
                      label: 'Market Cap',
                      value: formatMarketCap(marketStats.totalMarketCap || 0),
                      color: 'from-blue-500 to-cyan-500',
                      delay: '200ms',
                      position: 'transform -rotate-1',
                    },
                    {
                      icon: Users,
                      label: 'Active Tokens',
                      value: marketStats.activeTokens?.toLocaleString() || '0',
                      color: 'from-purple-500 to-violet-500',
                      delay: '400ms',
                      position: 'transform rotate-1',
                    },
                    {
                      icon: Trophy,
                      label: '24h New',
                      value: marketStats.last24Hours?.newTokens?.toLocaleString() || '0',
                      color: 'from-orange-500 to-red-500',
                      delay: '600ms',
                      position: 'transform -rotate-2',
                    },
                  ].map((stat, index) => (
                    <div 
                      key={index} 
                      className={`group ${stat.position} hover:rotate-0 transition-all duration-500`}
                      style={{ animationDelay: stat.delay }}
                    >
                      <div className="relative bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-500 hover:transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-green-500/20">
                        {/* Floating Icon */}
                        <div className={`absolute -top-4 -right-4 p-3 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="text-center pt-4">
                          <p className="text-gray-400 text-sm mb-3 font-medium uppercase tracking-wider">{stat.label}</p>
                          <p className="text-3xl font-black text-white">{stat.value}</p>
                        </div>
                        
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-3xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search Bar - Floating Design */}
            <div className="max-w-3xl mx-auto mb-12 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000" />
              <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-700/50 p-3 shadow-2xl">
                <div className="flex items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      placeholder="Search tokens by name, symbol, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-16 pr-6 py-5 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="group relative px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                  >
                    <span className="relative z-10">Search</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Creative Layout */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/create"
                className={`group relative overflow-hidden px-10 py-5 rounded-3xl font-bold text-lg transition-all duration-500 transform hover:scale-110 ${
                  isConnected
                    ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-2xl shadow-green-500/40'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Plus className="w-6 h-6" />
                  </div>
                  Launch Your Token
                  <Rocket className="w-5 h-5" />
                </div>
                {isConnected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                )}
              </Link>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group relative px-10 py-5 bg-gray-800/60 backdrop-blur-xl hover:bg-gray-700/60 text-white rounded-3xl font-bold text-lg transition-all duration-500 transform hover:scale-110 border border-gray-700/50 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className={`w-6 h-6 transition-transform duration-700 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  Refresh Data
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Tabs - Floating Pills */}
        <div className="flex justify-center mb-16">
          <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-full p-3 border border-gray-700/50 shadow-2xl">
            <div className="flex gap-3">
              {[
                { key: 'trending', icon: TrendingUp, label: 'Trending', emoji: '🔥' },
                { key: 'new', icon: Sparkles, label: 'New', emoji: '✨' },
                { key: 'featured', icon: Crown, label: 'King of Hill', emoji: '👑' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`relative flex items-center gap-3 px-8 py-4 rounded-full font-bold transition-all duration-500 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 transform scale-110'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50 hover:scale-105'
                  }`}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {activeTab === tab.key && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-30 blur animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tokens Grid - Staggered Masonry Layout */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="text-center relative">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto mb-8" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-green-400/20 rounded-full animate-ping mx-auto" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-400/20 rounded-full animate-ping mx-auto delay-75" />
              </div>
              <p className="text-gray-400 text-2xl font-semibold">Loading {activeTab} tokens...</p>
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto">
            <div className="relative bg-red-900/20 border border-red-500/30 rounded-3xl p-10 text-center backdrop-blur-sm">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="pt-6">
                <p className="text-red-400 mb-8 text-lg">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-32">
            <div className="max-w-lg mx-auto">
              <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-10">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="pt-6">
                  <p className="text-gray-400 text-xl mb-6">
                    {searchQuery ? `No tokens found for "${searchQuery}"` : `No ${activeTab} tokens found`}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        fetchTokens();
                      }}
                      className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Staggered Token Cards Grid */
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-6 space-y-6">
            {tokens.map((token, index) => {
              const price = token.price || pumpFunApi.calculatePrice(token);
              const priceChange = calculateMockPriceChange(token);
              
              return (
                <Link
                  key={token.mint}
                  to={`/token/${token.mint}`}
                  className={`group block break-inside-avoid mb-6 ${getCardStyle(index)}`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    marginTop: index % 3 === 0 ? '2rem' : index % 2 === 0 ? '1rem' : '0'
                  }}
                >
                  <div className={`relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 transition-all duration-700 hover:transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/40 overflow-hidden ${
                    index % 7 === 0 ? 'p-8' : '' // Larger padding for featured cards
                  }`}>
                    
                    {/* Floating Badge for Special Cards */}
                    {index % 7 === 0 && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                        ⭐ FEATURED
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
                    
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {token.image_uri ? (
                            <div className="relative">
                              <img
                                src={token.image_uri}
                                alt={token.symbol}
                                className={`${index % 7 === 0 ? 'w-20 h-20' : 'w-14 h-14'} rounded-2xl object-cover ring-2 ring-gray-600 group-hover:ring-green-400 transition-all duration-300 shadow-lg`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/${index % 7 === 0 ? '80' : '56'}/6B7280/FFFFFF?text=${token.symbol[0]}`;
                                }}
                              />
                              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur" />
                            </div>
                          ) : (
                            <div className={`${index % 7 === 0 ? 'w-20 h-20' : 'w-14 h-14'} bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center ring-2 ring-gray-600 group-hover:ring-green-400 transition-all duration-300 shadow-lg`}>
                              <span className={`${index % 7 === 0 ? 'text-2xl' : 'text-lg'} font-bold text-white`}>{token.symbol[0]}</span>
                            </div>
                          )}
                          <div>
                            <h3 className={`font-bold text-white group-hover:text-green-400 transition-colors duration-300 ${index % 7 === 0 ? 'text-lg' : 'text-sm'}`}>
                              {token.name}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono">${token.symbol}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {token.complete && (
                            <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs rounded-full border border-green-500/30 animate-pulse">
                              🎓 Graduated
                            </span>
                          )}
                          {token.is_currently_live && !token.complete && (
                            <span className="px-3 py-1 bg-blue-900/50 text-blue-400 text-xs rounded-full border border-blue-500/30 relative">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                                🔴 Live
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className={`text-gray-400 text-xs mb-4 line-clamp-${index % 7 === 0 ? '4' : '2'} leading-relaxed ${index % 7 === 0 ? 'min-h-[64px]' : 'min-h-[32px]'}`}>
                        {token.description || 'No description available'}
                      </p>
                      
                      {/* Stats */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Price</p>
                            <p className={`font-mono text-white font-semibold ${index % 7 === 0 ? 'text-base' : 'text-sm'}`}>
                              {formatPrice(price)}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                            priceChange >= 0 
                              ? 'text-green-400 bg-green-500/20 border border-green-500/30' 
                              : 'text-red-400 bg-red-500/20 border border-red-500/30'
                          }`}>
                            {priceChange >= 0 ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {Math.abs(priceChange).toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                            <p className={`font-medium text-white ${index % 7 === 0 ? 'text-base' : 'text-sm'}`}>
                              {formatMarketCap(token.usd_market_cap)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Created</p>
                            <p className="text-xs text-gray-300">
                              {formatTimeAgo(token.created_timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-700/50 group-hover:border-green-500/40 transition-colors duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span>by</span>
                            <span className="font-mono text-gray-400 group-hover:text-green-400 transition-colors duration-300">
                              {truncateAddress(token.creator)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {[token.twitter, token.telegram, token.mint].filter(Boolean).map((link, idx) => (
                              <div key={idx} className="w-7 h-7 rounded-full bg-gray-700/50 group-hover:bg-green-500/30 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110">
                                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-green-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        
        {/* Load More Button */}
        {tokens.length > 0 && tokens.length >= 50 && (
          <div className="text-center mt-16">
            <button
              onClick={() => {
                console.log('Load more tokens');
              }}
              className="group relative px-12 py-6 bg-gray-800/60 backdrop-blur-xl hover:bg-gray-700/60 text-white rounded-full font-bold text-lg transition-all duration-500 transform hover:scale-110 border border-gray-700/50 shadow-xl overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Flame className="w-6 h-6" />
                Load More Tokens
                <Zap className="w-5 h-5" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}