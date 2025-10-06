import { useState } from 'react'
import { useWallet } from '../providers/WalletProvider'
import { toast } from 'sonner'
import type { Token } from '../types'

interface TradingPanelProps {
  token: Token
}

export default function TradingPanel({ token }: TradingPanelProps) {
  const { publicKey, connected } = useWallet()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'buy' | 'sell'>('buy')

  const handleTrade = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)
    try {
      toast.success(`${mode === 'buy' ? 'Buy' : 'Sell'} order submitted`)
    } catch (error) {
      toast.error('Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 rounded font-bold ${
            mode === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 rounded font-bold ${
            mode === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-400'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Amount ({mode === 'buy' ? 'SOL' : token.symbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-green-400"
          />
        </div>

        <div className="bg-gray-700 rounded p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price</span>
            <span className="text-white">${token.price?.toFixed(6) || '0.000000'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Market Cap</span>
            <span className="text-white">${(token.usd_market_cap / 1000).toFixed(2)}K</span>
          </div>
        </div>

        <button
          onClick={handleTrade}
          disabled={loading || !connected}
          className={`w-full py-3 rounded font-bold ${
            mode === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Processing...' : connected ? `${mode === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}` : 'Connect Wallet'}
        </button>
      </div>
    </div>
  )
}