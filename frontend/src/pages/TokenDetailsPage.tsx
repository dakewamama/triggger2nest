// frontend/src/pages/TokenDetailsPage.tsx
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '@/services/api'
import TradingPanel from '@/components/TradingPanel'
import TokenChart from '@/components/TokenChart'
import { Copy, ExternalLink, Twitter, Globe } from 'lucide-react'
import { toast } from 'sonner'

export default function TokenDetailsPage() {
  const { mint } = useParams()
  const [token, setToken] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mint) {
      api.getTokenDetails(mint)
        .then(setToken)
        .finally(() => setLoading(false))
    }
  }, [mint])

  const copyAddress = () => {
    navigator.clipboard.writeText(mint!)
    toast.success('Address copied!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-neon-lime">Loading token data...</div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500">Token not found</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Token Info */}
      <div className="lg:col-span-2 space-y-6">
        <div className="terminal-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {token.image_uri ? (
                <img src={token.image_uri} alt={token.symbol} className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-2xl font-bold">
                  {token.symbol?.substring(0, 2)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-display font-bold">{token.name}</h1>
                <p className="text-gray-400">${token.symbol}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {token.twitter && (
                <a href={`https://twitter.com/${token.twitter}`} target="_blank" rel="noopener noreferrer">
                  <Twitter size={20} className="text-gray-400 hover:text-neon-cyan" />
                </a>
              )}
              {token.website && (
                <a href={token.website} target="_blank" rel="noopener noreferrer">
                  <Globe size={20} className="text-gray-400 hover:text-neon-cyan" />
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Contract Address</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{mint?.substring(0, 8)}...{mint?.substring(mint.length - 8)}</span>
                <button onClick={copyAddress}>
                  <Copy size={16} className="text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Market Cap</span>
              <span className="font-mono">${(token.usd_market_cap / 1e6).toFixed(2)}M</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Supply</span>
              <span className="font-mono">{(token.total_supply / 1e9).toFixed(2)}B</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Created</span>
              <span className="font-mono">{new Date(token.created_timestamp * 1000).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <TokenChart mint={mint!} />
      </div>

      {/* Trading Panel */}
      <div className="lg:col-span-1">
        <TradingPanel token={token} />
      </div>
    </div>
  )
}