import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '../providers/WalletProvider';
import api from '@/services';
import { portfolioService } from '../services/portfolioService';
import { toast } from 'sonner';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import HoldingsWidget from './HoldingsWidget';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function TradingPanel({ token }: { token: any }) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      handleQuote();
    }
  }, [amount, mode]);

  const handleQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    try {
      const quoteData = await api.getQuote(token.mint, parseFloat(amount), mode);
      setQuote(quoteData);
    } catch (error) {
      console.error('Quote error:', error);
    }
  };

  const handleBalanceUpdate = (balance: number) => {
    setCurrentBalance(balance);
  };

  const handleTrade = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validation for sell
    if (mode === 'sell') {
      const sellAmount = parseFloat(amount);
      if (sellAmount > currentBalance) {
        toast.error(`Insufficient balance. You have ${currentBalance.toFixed(2)} ${token.symbol}`);
        return;
      }
    }

    setLoading(true);
    try {
      const params = {
        mint: token.mint,
        publicKey: publicKey.toString(),
        amount: parseFloat(amount),
        solAmount: mode === 'buy' ? parseFloat(amount) : 0,
        slippage: 1.0,
        priorityFee: 0.00005
      };

      console.log('Trading with params:', params);

      const result = mode === 'buy' 
        ? await api.buyToken(params)
        : await api.sellToken(params);

      if (result.success && result.data?.transaction) {
        // Deserialize the transaction - handle both legacy and versioned
        const transactionBuffer = Buffer.from(result.data.transaction, 'base64');
        
        let signedTx;
        try {
          // Try versioned transaction first
          const versionedTx = VersionedTransaction.deserialize(transactionBuffer);
          // @ts-ignore - wallet adapter may not have proper types
          signedTx = await signTransaction(versionedTx);
        } catch (e) {
          // Fall back to legacy transaction
          const legacyTx = Transaction.from(transactionBuffer);
          signedTx = await signTransaction(legacyTx);
        }
        
        // Send the transaction
        const signature = await connection.sendRawTransaction(signedTx.serialize());
        
        toast.loading('Confirming transaction...', { id: signature });
        
        // Confirm the transaction
        await connection.confirmTransaction(signature, 'confirmed');
        
        toast.success(
          `${mode === 'buy' ? 'Buy' : 'Sell'} transaction successful!`,
          { id: signature }
        );
        
        // Show signature link
        toast.info(
          <a 
            href={`https://solscan.io/tx/${signature}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            View on Solscan →
          </a>,
          { duration: 10000 }
        );

        // Clear form
        setAmount('');
        setQuote(null);

        // Refresh holdings after successful trade
        setTimeout(async () => {
          await portfolioService.refreshAfterTrade(
            publicKey.toString(),
            token.mint
          );
          // Trigger balance refresh in widget
          const newBalance = await portfolioService.getTokenBalance(
            publicKey.toString(),
            token.mint
          );
          setCurrentBalance(newBalance);
          
          toast.success('Balance updated!');
        }, 3000);
        
      } else {
        toast.error(result.error || 'Transaction failed');
      }
    } catch (error: any) {
      console.error('Trade error:', error);
      toast.error(error.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Holdings Widget */}
      {connected && (
        <HoldingsWidget 
          tokenMint={token.mint}
          tokenSymbol={token.symbol}
          onBalanceUpdate={handleBalanceUpdate}
        />
      )}

      {/* Trading Card */}
      <div className="terminal-card">
        <h2 className="font-display text-xl font-bold mb-4">
          Trade {token.symbol}
        </h2>

        {!connected ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Connect your wallet to trade</p>
          </div>
        ) : (
          <>
            {/* Buy/Sell Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setMode('buy')}
                className={`py-2 rounded font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'buy' 
                    ? 'bg-gradient-to-r from-neon-lime to-neon-cyan text-black' 
                    : 'bg-terminal-border text-gray-400'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Buy
              </button>
              <button
                onClick={() => setMode('sell')}
                className={`py-2 rounded font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'sell' 
                    ? 'bg-gradient-to-r from-neon-magenta to-neon-cyan text-black' 
                    : 'bg-terminal-border text-gray-400'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Sell
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-400">
                  Amount ({mode === 'buy' ? 'SOL' : token.symbol})
                </label>
                {mode === 'sell' && currentBalance > 0 && (
                  <button
                    onClick={() => setAmount(currentBalance.toString())}
                    className="text-xs text-neon-lime hover:underline"
                  >
                    Max: {currentBalance.toFixed(2)}
                  </button>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={mode === 'buy' ? '0.1 SOL' : '1000'}
                className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
                step="0.01"
                min="0"
              />
            </div>

            {/* Quote Display */}
            {quote && (
              <div className="bg-terminal-bg rounded p-3 mb-4 text-sm border border-terminal-border">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Est. Price:</span>
                  <span className="font-mono">${quote.estimatedPrice?.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">You'll {mode === 'buy' ? 'get' : 'receive'}:</span>
                  <span className="font-mono font-bold text-neon-lime">
                    {mode === 'buy' 
                      ? `~${quote.estimatedTokenAmount?.toFixed(2)} ${token.symbol}`
                      : `~${quote.estimatedSolAmount?.toFixed(4)} SOL`
                    }
                  </span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-terminal-border">
                  <span className="text-gray-400">Slippage:</span>
                  <span className="font-mono text-xs">1.0%</span>
                </div>
              </div>
            )}

            {/* Trade Button */}
            <button
              onClick={handleTrade}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className={`w-full py-3 rounded font-bold transition-all ${
                mode === 'buy'
                  ? 'bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:opacity-90'
                  : 'bg-gradient-to-r from-neon-magenta to-neon-cyan text-black hover:opacity-90'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `${mode === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`
              )}
            </button>

            {/* Wallet Info */}
            <div className="mt-4 text-xs text-gray-500 text-center font-mono">
              {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}