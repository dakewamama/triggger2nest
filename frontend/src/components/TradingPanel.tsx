import { useState } from 'react'
import { useWallet } from '../providers/WalletProvider' 
import { api } from '@/services/api'
import { toast } from 'sonner'

export default function TradingPanel({ token }: { token: any }) {
  const { publicKey, signTransaction } = useWallet() // Using our mock wallet
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)

  const handleQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    try {
      const quoteData = await api.getQuote(token.mint, parseFloat(amount), mode)
      setQuote(quoteData)
    } catch (error) {
      toast.error('Failed to get quote')
    }
  }

  const handleTrade = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      const params = {
        mint: token.mint,
        publicKey: publicKey,
        amount: parseFloat(amount),
        solAmount: mode === 'buy' ? parseFloat(amount) : 0,
        slippage: 1.0
      }

      const result = mode === 'buy' 
        ? await api.buyToken(params)
        : await api.sellToken(params)

      if (result.success && result.data?.transaction) {
        toast.success(`${mode === 'buy' ? 'Buy' : 'Sell'} transaction prepared!`)
        // Here you would sign and send the transaction
      } else {
        toast.error(result.error || 'Transaction failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const hasBalance = false // Mock - would check actual token balance

  return (
    <div className="terminal-card sticky top-20">
      <h2 className="font-display text-xl font-bold mb-4">Trade {token.symbol}</h2>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setMode('buy')}
          className={`py-2 rounded font-bold transition-all ${
            mode === 'buy' 
              ? 'bg-neon-lime text-black' 
              : 'bg-terminal-border text-gray-400'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`py-2 rounded font-bold transition-all ${
            mode === 'sell' 
              ? 'bg-neon-magenta text-black' 
              : 'bg-terminal-border text-gray-400'
          }`}
          disabled={!hasBalance}
        >
          Sell
        </button>
      </div>

      {/* Amount Input */}
      <div className="space-y-2 mb-4">
        <label className="text-sm text-gray-400">
          Amount ({mode === 'buy' ? 'SOL' : token.symbol})
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={handleQuote}
          placeholder="0.00"
          className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 font-mono focus:border-neon-lime outline-none"
        />
      </div>

      {/* Quote Display */}
      {quote && (
        <div className="bg-terminal-bg rounded p-3 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">You {mode === 'buy' ? 'pay' : 'receive'}:</span>
            <span className="font-mono">{quote.estimatedSolAmount?.toFixed(4) || 0} SOL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">You {mode === 'buy' ? 'receive' : 'sell'}:</span>
            <span className="font-mono">{quote.estimatedTokenAmount?.toFixed(2) || 0} {token.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Price:</span>
            <span className="font-mono">${quote.estimatedPrice?.toFixed(6) || 0}</span>
          </div>
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={!amount || loading || !publicKey}
        className={`w-full py-3 rounded font-bold transition-all ${
          mode === 'buy'
            ? 'bg-gradient-to-r from-neon-lime to-neon-cyan text-black'
            : 'bg-gradient-to-r from-neon-magenta to-loss text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Processing...' : `${mode === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`}
      </button>

      {!publicKey && (
        <p className="text-center text-gray-400 text-sm mt-4">
          Connect wallet to trade
        </p>
      )}
    </div>
  )
}