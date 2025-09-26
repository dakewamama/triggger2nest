import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/services/api'
import TradingPanel from '@/components/TradingPanel'
import TokenTrades from '@/components/TokenTrades'
import { Copy, Twitter, Globe } from 'lucide-react'
import { formatAddress, formatNumber, formatPrice } from '@/utils/format'

export default function TokenDetailsPage() {
  const { mint } = useParams<{ mint: string }>()
  const [token, setToken] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mint) {
      loadTokenDetails()
    }
  }, [mint])

  const loadTokenDetails = async () => {
    try {
      setLoading(true)
      const data = await api.getTokenDetails(mint!)
      setToken(data)
    } catch (error) {
      toast.error('Failed to load token details')
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    if (mint) {
      navigator.clipboard.writeText(mint)
      toast.success('Address copied!')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Token not found</p>
        <Link to="/" className="text-green-400 hover:text-green-300 mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Token Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {token.image_uri && (
                <img 
                  src={token.image_uri} 
                  alt={token.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{token.name}</h1>
                <p className="text-gray-400">${token.symbol}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {token.twitter && (
                <a 
                  href={token.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {token.website && (
                <a 
                  href={token.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <p className="text-gray-300 mb-6">{token.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Market Cap</p>
              <p className="text-xl font-bold text-green-400">
                ${formatNumber(token.usd_market_cap)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Price</p>
              <p className="text-xl font-bold">
                ${formatPrice(token.price || 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Supply</p>
              <p className="text-xl font-bold">
                {formatNumber(token.total_supply)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Contract Address</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-mono">
                  {formatAddress(mint || '')}
                </p>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trades */}
        <TokenTrades mint={mint!} />
      </div>

      {/* Trading Panel */}
      <div className="lg:sticky lg:top-24">
        <TradingPanel token={token} />
      </div>
    </div>
  )
}
