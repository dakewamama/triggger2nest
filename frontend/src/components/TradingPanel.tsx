import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '../providers/WalletProvider'
import api from '@/services/api'
import { toast } from 'sonner'
import { VersionedTransaction } from '@solana/web3.js'

export default function TradingPanel({ token }: { token: any }) {
  const { publicKey, signTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      handleQuote()
    }
  }, [amount, mode])

  const handleQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    try {
      const quoteData = await api.getQuote(token.mint, parseFloat(amount), mode)
      setQuote(quoteData)
    } catch (error) {
      console.error('Quote error:', error)
    }
  }

  const handleTrade = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    try {
      const params = {
        mint: token.mint,
        publicKey: publicKey.toString(),
        amount: parseFloat(amount),
        solAmount: mode === 'buy' ? parseFloat(amount) : 0,
        slippage: 1.0,
        priorityFee: 0.00001
      }

      console.log('Trading with params:', params)

      const result = mode === 'buy' 
        ? await api.buyToken(params)
        : await api.sellToken(params)

      if (result.success && result.data?.transaction) {
        // Deserialize the transaction
        const transactionBuffer = Buffer.from(result.data.transaction, 'base64')
        const transaction = VersionedTransaction.deserialize(transactionBuffer)
        
        // Sign the transaction
        const signedTx = await signTransaction(transaction)
        
        // Send the transaction
        const signature = await connection.sendTransaction(signedTx)
        
        // Confirm the transaction
        await connection.confirmTransaction(signature, 'confirmed')
        
        toast.success(`${mode === 'buy' ? 'Buy' : 'Sell'} transaction successful!`)
        toast.success(`Transaction: ${signature}`)
        
        // Refresh quote
        handleQuote()
      } else {
        toast.error(result.error || 'Transaction failed')
      }
    } catch (error: any) {
      console.error('Trade error:', error)
      toast.error(error.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="terminal-card sticky top-20">
      <h2 className="font-display text-xl font-bold mb-4">Trade {token.symbol}</h2>

      {!connected ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">Connect your wallet to trade</p>
        </div>
      ) : (
        <>
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
            >
              Sell
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-sm text-gray-400">
              Amount ({mode === 'buy' ? 'SOL' : token.symbol})
            </label>
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

          {quote && (
            <div className="bg-terminal-bg rounded p-3 mb-4 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Est. Price:</span>
                <span>${quote.estimatedPrice?.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">You'll {mode === 'buy' ? 'get' : 'receive'}:</span>
                <span>
                  {mode === 'buy' 
                    ? `~${quote.estimatedTokenAmount?.toFixed(2)} ${token.symbol}`
                    : `~${quote.estimatedSolAmount?.toFixed(4)} SOL`
                  }
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleTrade}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className={`w-full py-3 rounded font-bold transition-all ${
              mode === 'buy'
                ? 'bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:opacity-90'
                : 'bg-gradient-to-r from-neon-magenta to-neon-cyan text-black hover:opacity-90'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : `${mode === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`}
          </button>

          <div className="mt-4 text-xs text-gray-400 text-center">
            Connected: {publicKey?.toString().slice(0, 8)}...
          </div>
        </>
      )}
    </div>
  )
}