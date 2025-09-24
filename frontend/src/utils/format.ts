// Formatting utilities for the application

export const LAMPORTS_PER_SOL = 1e9
export const DEFAULT_TOKEN_DECIMALS = 6

/**
 * Format a wallet address with ellipsis
 */
export function formatAddress(address: string, length = 4): string {
  if (!address) return ''
  if (address.length <= length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (!num || isNaN(num)) return '0'
  
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  
  if (absNum >= 1e9) return `${sign}${(absNum / 1e9).toFixed(2)}B`
  if (absNum >= 1e6) return `${sign}${(absNum / 1e6).toFixed(2)}M`
  if (absNum >= 1e3) return `${sign}${(absNum / 1e3).toFixed(2)}K`
  
  return `${sign}${absNum.toFixed(2)}`
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price: number): string {
  if (!price || isNaN(price)) return '0.00'
  
  // For very small prices, use exponential notation
  if (price < 0.00001) return price.toExponential(2)
  
  // For small prices, show more decimals
  if (price < 0.01) return price.toFixed(6)
  if (price < 1) return price.toFixed(4)
  if (price < 100) return price.toFixed(2)
  
  // For large prices, use formatNumber
  return formatNumber(price)
}

/**
 * Format market cap with dollar sign
 */
export function formatMarketCap(marketCap: number): string {
  return `$${formatNumber(marketCap)}`
}

/**
 * Format SOL amount
 */
export function formatSol(lamports: number): string {
  const sol = lamports / LAMPORTS_PER_SOL
  return `${sol.toFixed(4)} SOL`
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: number, decimals = DEFAULT_TOKEN_DECIMALS): string {
  const divisor = Math.pow(10, decimals)
  const tokenAmount = amount / divisor
  return formatNumber(tokenAmount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  if (!value || isNaN(value)) return '0%'
  return `${(value * 100).toFixed(2)}%`
}

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || ''
  return `${text.slice(0, maxLength)}...`
}
