import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, RefreshCw, Clock, Twitter, Globe } from 'lucide-react';
import api from '@/services/api';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  image?: string;
  image_uri?: string;
  usd_market_cap?: number;
  price?: number;
  created_timestamp?: number;
  twitter?: string;
  telegram?: string;
  website?: string;
}

interface TokenGridProps {
  category?: 'trending' | 'new' | 'featured';
}

export default function TokenGrid({ category = 'trending' }: TokenGridProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  const fetchTokens = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      let data;
      switch (category) {
        case 'new':
          data = await api.getNewTokens(30);
          break;
        case 'featured':
          data = await api.getFeaturedTokens(30);
          break;
        case 'trending':
        default:
          data = await api.getTrendingTokens(30);
          break;
      }
      
      setTokens(data);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTokens([]);
    fetchTokens();
    
    const interval = autoRefresh 
      ? setInterval(() => fetchTokens(false), 10000) 
      : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [category, autoRefresh]);

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(2)}K`;
    return `$${marketCap.toFixed(0)}`;
  };

  const getGraduationPercent = (marketCap?: number) => {
    if (!marketCap) return 0;
    return Math.min((marketCap / 69000) * 100, 100);
  };

  const getTokenAge = (createdTimestamp?: number) => {
    if (!createdTimestamp) return '';
    
    // Fix: Handle both milliseconds and seconds timestamps
    let timestampInMs = createdTimestamp;
    

    // Unix timestamps in seconds are typically 10 digits, in milliseconds 13 digits
    if (createdTimestamp < 10000000000) {
      timestampInMs = createdTimestamp * 1000;
    }
    
    const now = Date.now(); // Current time in milliseconds
    const diff = (now - timestampInMs) / 1000; 
    
    // Ensure diff is positive 
    if (diff < 0) {
      return 'Just now';
    }
    
    // Less than 1 minute
    if (diff < 60) {
      return `${Math.floor(diff)}s`;
    }
    // Less than 1 hour
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes}m`;
    }
    // Less than 1 day
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours}h`;
    }
    // Less than 1 week
    if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return `${days}d`;
    }
    // Less than 1 month (30 days)
    if (diff < 2592000) {
      const weeks = Math.floor(diff / 604800);
      return `${weeks}w`;
    }
    // Less than 1 year
    if (diff < 31536000) {
      const months = Math.floor(diff / 2592000);
      return `${months}mo`;
    }
    // Years
    const years = Math.floor(diff / 31536000);
    return `${years}y`;
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'new':
        return 'New Tokens';
      case 'featured':
        return 'Featured Tokens';
      case 'trending':
      default:
        return 'Trending Tokens';
    }
  };

  const handleSocialClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://twitter.com/${url}`;
      window.open(fullUrl, '_blank');
    }
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="terminal-card animate-pulse">
            <div className="w-full h-32 bg-gray-700 rounded-lg mb-2"></div>
            <div className="h-4 bg-gray-700 rounded mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-lime" />
          <h2 className="text-xl font-bold">{getCategoryTitle()}</h2>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`p-2 rounded ${
            autoRefresh ? 'bg-neon-lime/20 text-neon-lime' : 'bg-gray-700 text-gray-400'
          }`}
          title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
        >
          <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
        </button>
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tokens.map((token) => (
          <div
            key={token.mint}
            onClick={() => navigate(`/token/${token.mint}`)}
            className="terminal-card hover:border-neon-lime cursor-pointer transition-all hover:scale-[1.02]"
          >
            {/* Token Image */}
            <div className="relative mb-3">
              {token.image || token.image_uri ? (
                <img
                  src={token.image || token.image_uri}
                  alt={token.symbol}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${token.symbol}`;
                  }}
                />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-neon-lime/20 to-neon-cyan/20 rounded-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-neon-lime">
                    {token.symbol.slice(0, 2)}
                  </span>
                </div>
              )}
              
              {/* Token Age Badge */}
              {token.created_timestamp && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-white font-medium">
                    {getTokenAge(token.created_timestamp)}
                  </span>
                </div>
              )}
            </div>

            {/* Token Info */}
            <div>
              <h3 className="font-bold text-white truncate">{token.symbol}</h3>
              <p className="text-xs text-gray-400 truncate mb-2">{token.name}</p>
              
              {/* Market Cap */}
              <div className="text-sm text-neon-lime font-mono">
                {formatMarketCap(token.usd_market_cap)}
              </div>
              
              {/* Graduation Progress Bar */}
              <div className="mt-2">
                <div className="text-xs text-gray-500 mb-1">
                  {getGraduationPercent(token.usd_market_cap).toFixed(0)}% to grad
                </div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-lime to-neon-cyan transition-all duration-300"
                    style={{ width: `${getGraduationPercent(token.usd_market_cap)}%` }}
                  />
                </div>
              </div>

              {/* Social Links */}
              {(token.twitter || token.website) && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-terminal-border">
                  {token.twitter && (
                    <button
                      onClick={(e) => handleSocialClick(e, token.twitter)}
                      className="p-1.5 bg-terminal-bg rounded hover:bg-terminal-border transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                  {token.website && (
                    <button
                      onClick={(e) => handleSocialClick(e, token.website)}
                      className="p-1.5 bg-terminal-bg rounded hover:bg-terminal-border transition-colors"
                      title="Website"
                    >
                      <Globe className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}