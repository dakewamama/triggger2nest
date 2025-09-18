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
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  BarChart3,
  Hash,
  Link2
} from 'lucide-react';
import { pumpFunApi, type PumpToken } from '../../services/pump-api/pump-fun.service';
import { useWallet } from '../../hooks/useWallet';
import { debounce } from '../../utils/helpers';

// Market Stats Component
const MarketStatsSection = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchMarketStats();
    const interval = setInterval(fetchMarketStats, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchMarketStats = async () => {
    try {
      const response = await fetch('/tokens/stats/market');
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch market stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const formatValue = (value: number, type: 'currency' | 'number' = 'currency') => {
    if (type === 'currency') {
      if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
      if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
      return `$${value.toFixed(2)}`;
    } else {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
      return value.toLocaleString();
    }
  };
  
  const statsConfig = [
    {
      icon: DollarSign,
      label: 'Market Cap',
      value: stats?.totalMarketCap || 0,
      type: 'currency' as const,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Activity,
      label: '24h Volume',
      value: stats?.totalVolume24h || 0,
      type: 'currency' as const,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Users,
      label: 'Active',
      value: stats?.activeTokens || 0,
      type: 'number' as const,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Trophy,
      label: 'Graduated',
      value: stats?.successfulGraduations || 0,
      type: 'number' as const,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Zap,
      label: '24h New',
      value: stats?.last24Hours?.newTokens || 0,
      type: 'number' as const,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      icon: BarChart3,
      label: 'Trades',
      value: stats?.last24Hours?.trades || 0,
      type: 'number' as const,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10',
    },
  ];
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/40 rounded-3xl p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-700 rounded-2xl mb-4" />
            <div className="w-24 h-6 bg-gray-700 rounded mb-2" />
            <div className="w-16 h-4 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
      {statsConfig.map((stat, index) => (
        <div 
          key={index}
          className="group relative bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10 overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
          
          <div className={`relative p-3 ${stat.bgColor} rounded-2xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
          </div>
          
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">
            {stat.label}
          </p>
          
          <p className="text-2xl font-black text-white">
            {formatValue(stat.value, stat.type)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default function HomePage() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'featured'>('trending');
  const [tokens, setTokens] = useState<PumpToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchHelp, setShowSearchHelp] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<string>('');
  const [relatedTokens, setRelatedTokens] = useState<PumpToken[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  useEffect(() => {
    fetchTokens();
    // Load search history
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history).slice(0, 5));
    }
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
  
  const performAdvancedSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTokens();
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const response = await fetch(`/tokens/search/advanced?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const result = await response.json();
      
      if (result.success) {
        setTokens(result.data || []);
        setSearchSuggestions(result.suggestions || []);
        setSearchType(result.searchType || '');
        setRelatedTokens(result.relatedTokens || []);
        
        // Save to search history
        const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err: any) {
      setError('Failed to perform search');
    } finally {
      setIsSearching(false);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
    setSearchType('');
    setRelatedTokens([]);
    fetchTokens();
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTokens();
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

  const getSearchTypeBadge = () => {
    if (!searchType) return null;
    
    const badges: Record<string, any> = {
      'ca': { icon: Link2, label: 'Contract Address', color: 'bg-purple-500' },
      'ca_partial': { icon: Link2, label: 'Partial CA', color: 'bg-purple-500' },
      'exact': { icon: Search, label: 'Exact Match', color: 'bg-green-500' },
      'fuzzy': { icon: Sparkles, label: 'Smart Match', color: 'bg-blue-500' },
      'partial': { icon: Hash, label: 'Partial Match', color: 'bg-yellow-500' },
    };
    
    const badge = badges[searchType];
    if (!badge) return null;
    
    const Icon = badge.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${badge.color} bg-opacity-20 rounded-full`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{badge.label}</span>
      </div>
    );
  };

  const createPlaceholderImage = (text: string, size: number, bgColor = '6B7280', textColor = 'FFFFFF') => {
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#${bgColor}"/>
        <text x="50%" y="50%" font-size="${size * 0.4}" fill="#${textColor}" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-weight="bold">
          ${text}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const getPlaceholderUrl = (text: string, size: number, index: number = 0) => {
    const fallbacks = [
      `https://picsum.photos/${size}/${size}?random=${Math.abs(text.charCodeAt(0) + index)}`,
      createPlaceholderImage(text, size)
    ];
    return fallbacks;
  };

  const TokenImage = ({ token, index, className }: { token: PumpToken; index: number; className: string }) => {
    const [currentSrc, setCurrentSrc] = useState(token.image_uri || '');
    const [fallbackIndex, setFallbackIndex] = useState(0);
    
    const size = index % 7 === 0 ? 80 : 56;
    const fallbacks = getPlaceholderUrl(token.symbol[0], size, index);
    
    const handleImageError = () => {
      if (fallbackIndex < fallbacks.length - 1) {
        setFallbackIndex(prev => prev + 1);
        setCurrentSrc(fallbacks[fallbackIndex + 1]);
      } else {
        setCurrentSrc(createPlaceholderImage(token.symbol[0], size));
      }
    };

    useEffect(() => {
      setCurrentSrc(token.image_uri || fallbacks[0]);
      setFallbackIndex(0);
    }, [token.mint]);

    if (!currentSrc && !token.image_uri) {
      return (
        <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center ring-2 ring-gray-600 group-hover:ring-green-400 transition-all duration-300 shadow-lg`}>
          <span className={`${index % 7 === 0 ? 'text-2xl' : 'text-lg'} font-bold text-white`}>
            {token.symbol[0]}
          </span>
        </div>
      );
    }

    return (
      <div className="relative">
        <img
          src={currentSrc}
          alt={token.symbol}
          className={`${className} rounded-2xl object-cover ring-2 ring-gray-600 group-hover:ring-green-400 transition-all duration-300 shadow-lg`}
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur" />
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-x-hidden">
      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-32 left-1/3 w-24 h-24 bg-gradient-to-r from-yellow-500/12 to-orange-500/12 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5" />
        
        <div className="relative container mx-auto px-6 py-20">
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-12 relative">
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
            
            {/* Market Stats */}
            <MarketStatsSection />
            
            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto mb-12 relative">
              {/* Search Type Badge */}
              {searchType && (
                <div className="absolute -top-8 left-0 z-10">
                  {getSearchTypeBadge()}
                </div>
              )}
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur opacity-30" />
                <div className="relative bg-gray-800/80 backdrop-blur-xl rounded-full border border-gray-700/50 p-3 shadow-2xl">
                  <div className="flex items-center">
                    <Search className="absolute left-6 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      placeholder="Search by name, symbol, or contract address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && performAdvancedSearch()}
                      disabled={isSearching}
                      className="w-full pl-16 pr-6 py-5 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                    />
                    
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="p-2 hover:bg-gray-700/50 rounded-full mr-2"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowSearchHelp(!showSearchHelp)}
                      className="p-2 hover:bg-gray-700/50 rounded-full mr-2"
                    >
                      <Info className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <button
                      onClick={performAdvancedSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {isSearching ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Search Help */}
              {showSearchHelp && (
                <div className="mt-4 p-6 bg-gray-800/60 rounded-3xl border border-gray-700/50">
                  <h4 className="text-lg font-bold text-white mb-4">🚀 Advanced Search Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-400 font-semibold mb-2">✨ Smart Matching</p>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Handles typos automatically</li>
                        <li>• Fuzzy name/symbol matching</li>
                        <li>• Multi-word search support</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-purple-400 font-semibold mb-2">🔑 Contract Address</p>
                      <ul className="space-y-1 text-gray-300">
                        <li>• Full CA: HeLLonEArth5c...</li>
                        <li>• Partial: HeLLon or p5pump</li>
                        <li>• Auto-detects CA format</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="mt-4 p-4 bg-gray-800/40 rounded-2xl">
                  <p className="text-sm text-gray-400 mb-2">Try searching for:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          performAdvancedSearch();
                        }}
                        className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Search History */}
              {!searchQuery && searchHistory.length > 0 && (
                <div className="mt-4 p-4 bg-gray-800/30 rounded-2xl">
                  <p className="text-xs text-gray-500 mb-2">Recent searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(item);
                          performAdvancedSearch();
                        }}
                        className="px-3 py-1 bg-gray-700/30 hover:bg-gray-700/50 rounded-full text-xs text-gray-400 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Related Tokens */}
              {relatedTokens.length > 0 && (
                <div className="mt-4 p-4 bg-gray-800/30 rounded-2xl">
                  <p className="text-sm text-gray-400 mb-2">Related tokens:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {relatedTokens.slice(0, 4).map((token, idx) => (
                      <Link
                        key={idx}
                        to={`/token/${token.mint}`}
                        className="p-2 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg text-left transition-colors"
                      >
                        <p className="text-sm text-white font-medium truncate">{token.name}</p>
                        <p className="text-xs text-gray-400">${token.symbol}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
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
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-16">
        {/* Tabs */}
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
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tokens Grid */}
        {loading || isSearching ? (
          <div className="flex justify-center items-center py-32">
            <div className="text-center relative">
              <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto mb-8" />
              <p className="text-gray-400 text-2xl font-semibold">
                {isSearching ? 'Searching...' : `Loading ${activeTab} tokens...`}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-lg mx-auto">
            <div className="relative bg-red-900/20 border border-red-500/30 rounded-3xl p-10 text-center backdrop-blur-sm">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 mb-8 text-lg">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-32">
            <div className="max-w-lg mx-auto">
              <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-xl mb-6">
                {searchQuery ? `No tokens found for "${searchQuery}"` : `No ${activeTab} tokens found`}
              </p>
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
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
                    index % 7 === 0 ? 'p-8' : ''
                  }`}>
                    
                    {index % 7 === 0 && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                        ⭐ FEATURED
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <TokenImage 
                            token={token} 
                            index={index} 
                            className={index % 7 === 0 ? 'w-20 h-20' : 'w-14 h-14'} 
                          />
                          
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
                      
                      <p className={`text-gray-400 text-xs mb-4 line-clamp-${index % 7 === 0 ? '4' : '2'} leading-relaxed`}>
                        {token.description || 'No description available'}
                      </p>
                      
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
      </div>
    </div>
  );
}