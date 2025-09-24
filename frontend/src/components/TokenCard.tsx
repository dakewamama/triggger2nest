import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatNumber, formatMarketCap, formatPercentage } from '@/utils/format'

interface TokenCardProps {
  token: any  // Using any for now since we don't have the exact type
}

export default function TokenCard({ token }: TokenCardProps) {
  const priceChange = token.price_change_24h || 0
  const isPositive = priceChange >= 0

  return (
    <Link 
      to={`/token/${token.mint}`}
      className="terminal-card hover:border-neon-lime transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {token.image_uri && (
            <img 
              src={token.image_uri} 
              alt={token.name}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div>
            <h3 className="font-bold text-white group-hover:text-neon-lime transition-colors">
              {token.name}
            </h3>
            <p className="text-sm text-gray-400">${token.symbol}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-white">
            {formatMarketCap(token.usd_market_cap || 0)}
          </p>
          <div className={`flex items-center justify-end text-sm ${
            isPositive ? 'text-neon-lime' : 'text-neon-magenta'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {formatPercentage(Math.abs(priceChange / 100))}
          </div>
        </div>
      </div>
      
      {token.description && (
        <p className="text-sm text-gray-400 mt-3 line-clamp-2">
          {token.description}
        </p>
      )}
      
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <span>Vol: ${formatNumber(token.volume_24h || 0)}</span>
        <span>{token.is_currently_live ? '🟢 Live' : '⚪ Inactive'}</span>
      </div>
    </Link>
  )
}
