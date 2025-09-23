import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface TokenCardProps {
  mint: string
  name: string
  symbol: string
  price: number
  change24h?: number
  marketCap: number
  imageUri?: string
}

export default function TokenCard({ mint, name, symbol, price, change24h = 0, marketCap, imageUri }: TokenCardProps) {
  const navigate = useNavigate()
  const isProfit = change24h >= 0

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/token/${mint}`)}
      className="bg-terminal-surface border border-terminal-border rounded-lg p-4 cursor-pointer hover:border-neon-lime transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {imageUri ? (
            <img src={imageUri} alt={symbol} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center text-white font-bold">
              {symbol.substring(0, 2)}
            </div>
          )}
          <div>
            <h3 className="font-display font-bold text-white group-hover:text-neon-lime transition-colors">
              {symbol}
            </h3>
            <p className="text-xs text-gray-500">{name}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Price</span>
          <span className="font-mono text-white">${price.toFixed(6)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">24h</span>
          <span className={`font-mono flex items-center gap-1 ${isProfit ? 'text-profit' : 'text-loss'}`}>
            {isProfit ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(change24h).toFixed(2)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">MCap</span>
          <span className="font-mono text-white">
            ${(marketCap / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>
    </motion.div>
  )
}