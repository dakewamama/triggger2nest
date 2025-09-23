import { useState, useEffect } from 'react'
import { api } from '../services/api'
import TokenCard from '../components/TokenCard'
import { Activity, TrendingUp, Zap } from 'lucide-react'
import RecentTrades from '../components/RecentTrades'

export default function TradingPage() {
  const [activeTokens, setActiveTokens] = useState<any[]>([])
  const [topGainers, setTopGainers] = useState<any[]>([])
  const [topLosers, setTopLosers] = useState<any[]>([])
  const [newListings, setNewListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTradingData()
    const interval = setInterval(loadTradingData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadTradingData = async () => {
    try {
      const [trending, newest] = await Promise.all([
        api.getTrendingTokens(20),
        api.getNewTokens(10)
      ])

      // Sort for gainers and losers
      const sorted = [...trending].sort((a, b) => (b.change24h || 0) - (a.change24h || 0))
      setTopGainers(sorted.slice(0, 5))
      setTopLosers(sorted.slice(-5).reverse())
      setActiveTokens(trending.slice(0, 10))
      setNewListings(newest)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load trading data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-neon-lime">Loading market data...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar - Market Overview */}
      <div className="lg:col-span-1 space-y-6">
        {/* Top Gainers */}
        <div className="terminal-card">
          <h3 className="font-display font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="text-profit" size={20} />
            Top Gainers
          </h3>
          <div className="space-y-3">
            {topGainers.map((token) => (
              <div key={token.mint} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{token.symbol}</span>
                </div>
                <span className="text-profit font-mono text-sm">
                  +{token.change24h?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="terminal-card">
          <h3 className="font-display font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="text-loss rotate-180" size={20} />
            Top Losers
          </h3>
          <div className="space-y-3">
            {topLosers.map((token) => (
              <div key={token.mint} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{token.symbol}</span>
                </div>
                <span className="text-loss font-mono text-sm">
                  {token.change24h?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Active Tokens */}
      <div className="lg:col-span-2 space-y-6">
        <div className="terminal-card">
          <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-6">
            <Activity className="text-neon-cyan" />
            Most Active
          </h2>
          <div className="space-y-4">
            {activeTokens.map((token) => (
              <TokenCard key={token.mint} {...token} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - New Listings & Recent Trades */}
      <div className="lg:col-span-1 space-y-6">
        {/* New Listings */}
        <div className="terminal-card">
          <h3 className="font-display font-bold flex items-center gap-2 mb-4">
            <Zap className="text-neon-gold" size={20} />
            New Listings
          </h3>
          <div className="space-y-3">
            {newListings.map((token) => (
              <div key={token.mint} className="border-l-2 border-neon-gold pl-3">
                <p className="font-bold text-sm">{token.symbol}</p>
                <p className="text-xs text-gray-400">{token.name}</p>
                <p className="text-xs font-mono text-neon-lime">
                  ${token.price?.toFixed(6)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trades */}
        <RecentTrades />
      </div>
    </div>
  )
}