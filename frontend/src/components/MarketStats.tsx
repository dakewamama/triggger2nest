import { useEffect, useState } from 'react'
import { api } from '../services'
import { DollarSign, Activity, Users } from 'lucide-react'

export default function MarketStats() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api.getMarketStats().then(setStats).catch(console.error)
  }, [])

  if (!stats) return null

  return (
    <div className="bg-terminal-surface/50 border-b border-terminal-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-neon-gold" />
              <span className="text-gray-400">Market Cap:</span>
              <span className="font-mono text-white">${(stats.totalMarketCap / 1e9).toFixed(2)}B</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-neon-cyan" />
              <span className="text-gray-400">24h Vol:</span>
              <span className="font-mono text-white">${(stats.totalVolume24h / 1e6).toFixed(2)}M</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-neon-magenta" />
              <span className="text-gray-400">Active:</span>
              <span className="font-mono text-white">{stats.activeTokens}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neon-lime rounded-full animate-pulse" />
            <span className="text-neon-lime text-xs">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  )
}