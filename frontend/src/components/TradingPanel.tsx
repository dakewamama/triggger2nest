import { useState } from 'react'
import { useWallet, useConnection } from '../providers/WalletProvider'
import api from '@/services/api'
import { toast } from 'sonner'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { formatPrice, formatNumber } from '@/utils/format'

interface EstimatedValues {
  price: number
  tokensYouGet: number
  solYouGet: number
  totalCost: number
  totalTokens: number
}

export default function TradingPanel({ token }: { token: any }) {
  const { publicKey, signTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrade = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
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
        const transactionBuffer = Buffer.from(result.data.transaction, 'base64')
        
        let signedTx;
        try {
          const versionedTx = VersionedTransaction.deserialize(transactionBuffer)
          // @ts-ignore
          signedTx = await signTransaction(versionedTx)
        } catch (e) {
          const legacyTx = Transaction.from(transactionBuffer)
          signedTx = await signTransaction(legacyTx)
        }
        
        const signature = await connection.sendRawTransaction(signedTx.serialize())
        
        toast.success('Transaction sent! Confirming...')
        
        await connection.confirmTransaction(signature, 'confirmed')
        
        toast.success(`${mode === 'buy' ? 'Buy' : 'Sell'} successful!`)
        toast.info(`Signature: ${signature.slice(0, 8)}...`)
        
        setAmount('')
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

  const getEstimatedValues = (): EstimatedValues | null => {
    if (!amount || parseFloat(amount) <= 0 || !token.price) {
      return null
    }

    const amountNum = parseFloat(amount)
    const tokenPrice = token.price || 0
    
    if (mode === 'buy') {
      const estimatedTokens = tokenPrice > 0 ? amountNum / tokenPrice : 0
      return {
        price: tokenPrice,
        tokensYouGet: estimatedTokens,
        solYouGet: 0,
        totalCost: amountNum,
        totalTokens: 0
      }
    } else {
      const estimatedSOL = amountNum * tokenPrice
      return {
        price: tokenPrice,
        tokensYouGet: 0,
        solYouGet: estimatedSOL,
        totalCost: 0,
        totalTokens: amountNum
      }
    }
  }

  const estimates = getEstimatedValues()

  return (
    <div className="terminal-card">
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
              placeholder={mode === 'buy' ? '0.1' : '1000'}
              className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
              step="0.01"
              min="0"
            />
          </div>

          {estimates && (
            <div className="bg-terminal-bg border border-terminal-border rounded p-3 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Token Price:</span>
                <span className="font-mono">${formatPrice(estimates.price)}</span>
              </div>
              
              {mode === 'buy' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">You're paying:</span>
                    <span className="font-mono">{estimates.totalCost} SOL</span>
                  </div>
                  <div className="flex justify-between border-t border-terminal-border pt-2">
                    <span className="text-gray-400">You'll receive:</span>
                    <span className="font-mono text-neon-lime">
                      ~{formatNumber(estimates.tokensYouGet)} {token.symbol}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">You're selling:</span>
                    <span className="font-mono">{formatNumber(estimates.totalTokens)} {token.symbol}</span>
                  </div>
                  <div className="flex justify-between border-t border-terminal-border pt-2">
                    <span className="text-gray-400">You'll receive:</span>
                    <span className="font-mono text-neon-lime">
                      ~{estimates.solYouGet.toFixed(4)} SOL
                    </span>
                  </div>
                </>
              )}
              
              <div className="text-xs text-gray-500 pt-2 border-t border-terminal-border">
                Includes 1% slippage • Prices are estimates
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