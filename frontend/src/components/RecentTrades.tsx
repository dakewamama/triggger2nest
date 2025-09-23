import { useEffect, useState, useRef } from 'react'
import { api } from '../services/api'
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Trade {
  signature: string
  mint: string
  sol_amount: number
  token_amount: number
  is_buy: boolean
  user: string
  timestamp: number
  tx_index: number
  username?: string
  profile_image?: string
  token_symbol?: string
  token_name?: string
}

export default function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout>()

  const fetchLatestTrades = async () => {
    try {
      // Get latest trades across all tokens
      const response = await api.getLatestTrades(20)
      
      // If we have trades, update the state
      if (response && response.length > 0) {
        setTrades(response)
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch trades:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchLatestTrades()

    // Set up polling for real-time updates (every 5 seconds)
    intervalRef.current = setInterval(fetchLatestTrades, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const tradeTime = timestamp * 1000 // Convert to milliseconds
    const diff = now - tradeTime
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(tradeTime).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="terminal-card">
        <h3 className="font-display font-bold flex items-center gap-2 mb-4">
          <Activity className="text-neon-cyan" size={20} />
          Recent Trades
        </h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-terminal-border rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (trades.length === 0) {
    return (
      <div className="terminal-card">
        <h3 className="font-display font-bold flex items-center gap-2 mb-4">
          <Activity className="text-neon-cyan" size={20} />
          Recent Trades
        </h3>
        <div className="text-center py-8 text-gray-400">
          No recent trades
        </div>
      </div>
    )
  }

  return (
    <div className="terminal-card">
      <h3 className="font-display font-bold flex items-center gap-2 mb-4">
        <Activity className="text-neon-cyan animate-pulse" size={20} />
        Recent Trades
        <span className="text-xs text-gray-400 ml-auto">Live</span>
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {trades.map((trade) => (
          <div
            key={trade.signature}
            className="flex items-center justify-between p-2 bg-terminal-bg rounded hover:bg-terminal-border/30 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              {trade.is_buy ? (
                <ArrowUpRight className="text-profit shrink-0" size={16} />
              ) : (
                <ArrowDownRight className="text-loss shrink-0" size={16} />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-mono text-sm font-bold truncate">
                    {trade.token_symbol || 'TOKEN'}
                  </p>
                  {trade.username && (
                    <span className="text-xs text-gray-500 truncate max-w-[80px]">
                      @{trade.username}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {formatTime(trade.timestamp)}
                </p>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <p className={`font-mono text-sm ${
                trade.is_buy ? 'text-profit' : 'text-loss'
              }`}>
                {trade.token_amount.toLocaleString()} 
              </p>
              <p className="text-xs text-gray-400">
                {trade.sol_amount.toFixed(4)} SOL
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-terminal-border">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Auto-refresh: 5s</span>
          <button 
            onClick={fetchLatestTrades}
            className="hover:text-neon-cyan transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}