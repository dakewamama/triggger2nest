// frontend/src/components/TokenTrades.tsx
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react'
import { formatAddress } from '../utils/format'

interface TokenTradesProps {
  mint: string
  symbol?: string
}

export default function TokenTrades({ mint, symbol }: TokenTradesProps) {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchTrades = async (offset = 0) => {
    try {
      setLoading(true)
      const response = await api.getTokenTrades(mint, 50, offset)
      
      if (offset === 0) {
        setTrades(response)
      } else {
        setTrades(prev => [...prev, ...response])
      }
      
      setHasMore(response.length === 50)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch token trades:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades(0)
    const interval = setInterval(() => {
      if (page === 0) fetchTrades(0)
    }, 10000)
    return () => clearInterval(interval)
  }, [mint])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchTrades(nextPage * 50)
  }

  if (loading && trades.length === 0) {
    return (
      <div className="terminal-card">
        <h3 className="font-display font-bold mb-4">Recent Trades</h3>
        <div className="text-center py-8">
          <div className="animate-pulse text-neon-lime">Loading trades...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="terminal-card">
      <h3 className="font-display font-bold mb-4">
        Recent Trades - {symbol || 'TOKEN'}
      </h3>

      {trades.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No trades yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-terminal-border">
                <th className="pb-2">Type</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Price</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Trader</th>
                <th className="pb-2">Time</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr 
                  key={trade.signature}
                  className="border-b border-terminal-border/50 hover:bg-terminal-border/20"
                >
                  <td className="py-2">
                    <span className={`flex items-center gap-1 ${
                      trade.is_buy ? 'text-profit' : 'text-loss'
                    }`}>
                      {trade.is_buy ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {trade.is_buy ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="py-2 font-mono">
                    {trade.token_amount?.toLocaleString() || '0'}
                  </td>
                  <td className="py-2 font-mono">
                    ${trade.token_amount ? (trade.sol_amount / trade.token_amount).toFixed(8) : '0'}
                  </td>
                  <td className="py-2 font-mono">
                    {trade.sol_amount?.toFixed(4) || '0'} SOL
                  </td>
                  <td className="py-2">
                    <a 
                      href={`https://solscan.io/account/${trade.user}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan hover:text-neon-lime transition-colors"
                    >
                      {trade.user ? formatAddress(trade.user) : 'Unknown'}
                    </a>
                  </td>
                  <td className="py-2 text-gray-400">
                    {trade.timestamp ? new Date(trade.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td className="py-2">
                    
                      href={`https://solscan.io/tx/${trade.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-neon-cyan"
                    <a>
                      <ExternalLink size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && !loading && trades.length > 0 && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-terminal-border hover:bg-neon-lime hover:text-black rounded transition-all"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}