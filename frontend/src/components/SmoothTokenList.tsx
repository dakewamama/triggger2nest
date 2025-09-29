import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, Star, RefreshCw, Bell } from 'lucide-react';
import api from '@/services/api';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  image?: string;
  usd_market_cap?: number;
  price?: number;
  price_change_24h?: number;
  volume_24h?: number;
  created_timestamp?: number;
  isNew?: boolean; // Flag for newly added tokens
}

interface TokenListProps {
  category?: 'trending' | 'new' | 'featured';
}

export default function SmoothTokenList({ category = 'trending' }: TokenListProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [newTokenAlert, setNewTokenAlert] = useState(false);
  const lastUpdateRef = useRef<string[]>([]);
  const navigate = useNavigate();

  const fetchTokens = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      let data;
      switch (category) {
        case 'new':
          data = await api.getNewTokens(20);
          break;
        case 'featured':
          data = await api.getFeaturedTokens(20);
          break;
        default:
          data = await api.getTrendingTokens(20);
      }

      // Check for new tokens
      const currentMints = tokens.map(t => t.mint);
      const newMints = data.map((t: Token) => t.mint);
      const addedTokens = newMints.filter((mint: string) => !currentMints.includes(mint));

      // Mark new tokens
      const updatedData = data.map((token: Token) => ({
        ...token,
        isNew: addedTokens.includes(token.mint)
      }));

      // Smoothly update the list
      if (addedTokens.length > 0 && tokens.length > 0) {
        // Animate new tokens
        setNewTokenAlert(true);
        setTimeout(() => setNewTokenAlert(false), 3000);
      }

      setTokens(updatedData);
      lastUpdateRef.current = newMints;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();

    // Auto-refresh every 10 seconds without showing loading
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

  const formatPrice = (price?: number) => {
    if (!price) return '$0.00';
    if (price < 0.00001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'new':
        return <Clock className="w-5 h-5" />;
      case 'featured':
        return <Star className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
      case 'new':
        return 'New Tokens';
      case 'featured':
        return 'Featured Tokens';
      default:
        return 'Trending Tokens';
    }
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {getCategoryIcon()}
          <h2 className="text-xl font-bold">{getCategoryTitle()}</h2>
          {newTokenAlert && (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full animate-pulse">
              New!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
            }`}
            title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
          </button>
          <button
            onClick={() => fetchTokens()}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Token List */}
      <div className="space-y-2">
        {tokens.map((token, index) => (
          <div
            key={token.mint}
            onClick={() => navigate(`/token/${token.mint}`)}
            className={`
              p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer 
              transition-all duration-300 transform
              ${token.isNew ? 'animate-slideIn ring-2 ring-green-400' : ''}
            `}
            style={{
              animationDelay: token.isNew ? `${index * 50}ms` : '0ms'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-gray-500 text-sm w-6">
                  {index + 1}
                </div>
                {token.image && (
                  <img 
                    src={token.image} 
                    alt={token.symbol}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{token.symbol}</span>
                    {token.isNew && (
                      <Bell className="w-3 h-3 text-green-400 animate-bounce" />
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatMarketCap(token.usd_market_cap)}
                </div>
                <div className={`text-sm ${
                  (token.price_change_24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.price_change_24h ? `${token.price_change_24h > 0 ? '+' : ''}${token.price_change_24h.toFixed(2)}%` : 'New'}
                </div>
              </div>
            </div>
            
            {/* Progress to graduation */}
            <div className="mt-2">
              <div className="w-full bg-gray-600 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-green-400 to-yellow-400 h-1 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(((token.usd_market_cap || 0) / 69000) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {((token.usd_market_cap || 0) / 69000 * 100).toFixed(1)}% to graduation
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}