import { useEffect, useState } from 'react';
import api from '@/services/api';
import { ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw } from 'lucide-react';
import { formatAddress } from '../utils/format';

interface Trade {
  signature: string;
  is_buy: boolean;
  user: string;
  token_amount: number;
  sol_amount: number;
  price?: number;
  timestamp: number;
  slot?: number;
}

interface TokenTradesProps {
  mint: string;
  symbol?: string;
}

export default function TokenTrades({ mint, symbol }: TokenTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTrades = async () => {
    try {
      const response = await api.getTokenTrades(mint, 50);
      
      // Calculate price for each trade
      const tradesWithPrices = response.map((trade: Trade) => ({
        ...trade,
        // Calculate price: SOL amount / token amount
        price: trade.sol_amount && trade.token_amount 
          ? trade.sol_amount / trade.token_amount 
          : 0
      }));
      
      setTrades(tradesWithPrices);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch token trades:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    
    // Auto-refresh every half a second if enabled
    const interval = autoRefresh ? setInterval(fetchTrades, 500) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mint, autoRefresh]);

  const formatPrice = (price: number) => {
    if (!price) return '$0.00';
    if (price < 0.00001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(4)}`;
  };

  const formatSolAmount = (amount: number) => {
    if (!amount) return '0';
    if (amount < 0.001) return amount.toFixed(6);
    if (amount < 1) return amount.toFixed(4);
    return amount.toFixed(2);
  };

  const formatTokenAmount = (amount: number) => {
    if (!amount) return '0';
    if (amount > 1000000000) return `${(amount / 1000000000).toFixed(2)}B`;
    if (amount > 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount > 1000) return `${(amount / 1000).toFixed(2)}K`;
    return amount.toFixed(0);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading && trades.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Trades</h3>
        <div className="text-center py-8">
          <div className="animate-pulse text-green-400">Loading trades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Recent Trades</h3>
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
            onClick={fetchTrades}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No trades yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2">Type</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">Total (SOL)</th>
                <th className="pb-2">Trader</th>
                <th className="pb-2">Time</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, index) => (
                <tr 
                  key={`${trade.signature}-${index}`}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                >
                  <td className="py-2">
                    <span className={`flex items-center gap-1 ${
                      trade.is_buy ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {trade.is_buy ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {trade.is_buy ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono">
                    {formatTokenAmount(trade.token_amount)}
                    <span className="text-gray-500 text-xs ml-1">{symbol}</span>
                  </td>
                  <td className="py-2 text-right font-mono">
                    {formatPrice(trade.price || 0)}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {formatSolAmount(trade.sol_amount)}
                    <span className="text-gray-500 text-xs ml-1">SOL</span>
                  </td>
                  <td className="py-2">
                    <a
                      href={`https://solscan.io/account/${trade.user}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs hover:text-green-400 transition-colors"
                    >
                      {formatAddress(trade.user)}
                    </a>
                  </td>
                  <td className="py-2 text-gray-400 text-xs">
                    {formatTime(trade.timestamp)}
                  </td>
                  <td className="py-2">
                    <a
                      href={`https://solscan.io/tx/${trade.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      title="View on Solscan"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}