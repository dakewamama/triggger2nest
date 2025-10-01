import { useState, useEffect } from 'react';
import { useWallet } from '../providers/WalletProvider';
import { portfolioService, Portfolio, PortfolioToken } from '../services/api/portfolioService';
import { Wallet, TrendingUp, TrendingDown, RefreshCw, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

function formatPrice(price: number): string {
  if (price < 0.000001) return price.toExponential(2);
  if (price < 0.01) return price.toFixed(6);
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
}

function TokenRow({ token }: { token: PortfolioToken }) {
  const isPositive = token.priceChange24h >= 0;
  
  return (
    <Link
      to={`/token/${token.mint}`}
      className="grid grid-cols-6 gap-4 p-4 hover:bg-terminal-border/30 transition-colors border-b border-terminal-border"
    >
      {/* Token Info */}
      <div className="col-span-2 flex items-center gap-3">
        {token.image_uri ? (
          <img 
            src={token.image_uri} 
            alt={token.symbol}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-terminal-border flex items-center justify-center">
            <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
          </div>
        )}
        <div>
          <p className="font-bold">{token.symbol}</p>
          <p className="text-sm text-gray-400 truncate max-w-[150px]">{token.name}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col justify-center">
        <p className="font-mono">${formatPrice(token.price)}</p>
        <p className={`text-xs ${isPositive ? 'text-profit' : 'text-loss'}`}>
          {isPositive ? '+' : ''}{token.priceChange24h.toFixed(2)}%
        </p>
      </div>

      {/* Balance */}
      <div className="flex flex-col justify-center">
        <p className="font-mono">{formatNumber(token.balance)}</p>
        <p className="text-xs text-gray-400">{token.symbol}</p>
      </div>

      {/* Value */}
      <div className="flex flex-col justify-center">
        <p className="font-mono font-bold">${formatNumber(token.value)}</p>
        <p className={`text-xs ${isPositive ? 'text-profit' : 'text-loss'}`}>
          {isPositive ? '+' : ''}${Math.abs(token.valueChange24h).toFixed(2)}
        </p>
      </div>

      {/* Allocation */}
      <div className="flex items-center justify-end">
        <div className="text-right">
          <p className="font-mono text-sm">
            {/* Calculate % when we have total */}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function PortfolioPage() {
  const { publicKey, connected } = useWallet();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      loadPortfolio();
    }
  }, [connected, publicKey]);

  const loadPortfolio = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const data = await portfolioService.getPortfolio(publicKey.toString());
      setPortfolio(data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  };

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect your wallet to view your portfolio
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin text-neon-lime" />
          <p className="text-gray-400">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  const totalValue = (portfolio?.totalValue || 0) + (portfolio?.solBalance || 0) * 150; // Assuming SOL = $150
  const totalChange = portfolio?.totalChange24h || 0;
  const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
  const isPositive = totalChange >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-3">
            <Wallet className="text-neon-lime" />
            My Portfolio
          </h1>
          <p className="text-gray-400 mt-1">
            {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-border hover:bg-terminal-border/70 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Value */}
        <div className="terminal-card">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <p className="text-3xl font-bold font-mono">
            ${formatNumber(totalValue)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-profit' : 'text-loss'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>
              {isPositive ? '+' : ''}${Math.abs(totalChange).toFixed(2)} ({isPositive ? '+' : ''}{totalChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* SOL Balance */}
        <div className="terminal-card">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">SOL Balance</span>
          </div>
          <p className="text-3xl font-bold font-mono">
            {portfolio?.solBalance.toFixed(4) || '0.0000'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            ≈ ${((portfolio?.solBalance || 0) * 150).toFixed(2)}
          </p>
        </div>

        {/* Token Count */}
        <div className="terminal-card">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Tokens Held</span>
          </div>
          <p className="text-3xl font-bold font-mono">
            {portfolio?.tokens.length || 0}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Active positions
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="terminal-card">
        <h2 className="text-xl font-bold mb-4">Your Holdings</h2>
        
        {portfolio && portfolio.tokens.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 p-4 border-b-2 border-terminal-border font-bold text-sm text-gray-400">
              <div className="col-span-2">TOKEN</div>
              <div>PRICE</div>
              <div>BALANCE</div>
              <div>VALUE</div>
              <div className="text-right">ALLOCATION</div>
            </div>
            
            {/* Token Rows */}
            <div>
              {portfolio.tokens.map((token) => (
                <TokenRow key={token.mint} token={token} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No tokens in your portfolio yet</p>
            <Link 
              to="/" 
              className="text-neon-lime hover:underline"
            >
              Start trading →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}