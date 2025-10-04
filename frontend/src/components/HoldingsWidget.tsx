import { useState, useEffect } from 'react';
import { useWallet } from '../providers/WalletProvider';
import { portfolioService } from '../services/portfolioService';
import { Wallet, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface HoldingsWidgetProps {
  tokenMint: string;
  tokenSymbol: string;
  onBalanceUpdate?: (balance: number) => void;
}

export default function HoldingsWidget({ 
  tokenMint, 
  tokenSymbol,
  onBalanceUpdate 
}: HoldingsWidgetProps) {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [value, setValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      loadBalance();
    }
  }, [connected, publicKey, tokenMint]);

  const loadBalance = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      const bal = await portfolioService.getTokenBalance(
        publicKey.toString(),
        tokenMint
      );
      setBalance(bal);
      onBalanceUpdate?.(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBalance();
  };

  if (!connected) {
    return null;
  }

  return (
    <div className="bg-terminal-bg border border-terminal-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Wallet className="w-4 h-4" />
          <span>Your Holdings</span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1 hover:bg-terminal-border rounded transition-colors disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Balance</span>
          <span className="font-mono font-bold">
            {loading ? (
              <span className="text-gray-600">Loading...</span>
            ) : (
              <span>
                {balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} {tokenSymbol}
              </span>
            )}
          </span>
        </div>

        {value > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Value</span>
            <span className="font-mono text-neon-lime">
              ≈ ${value.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {balance > 0 && (
        <div className="mt-3 pt-3 border-t border-terminal-border">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>Position active</span>
          </div>
        </div>
      )}
    </div>
  );
}