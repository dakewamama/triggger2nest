import { PublicKey } from '@solana/web3.js'

// Constants
export const DEFAULT_TOKEN_DECIMALS = 6
export const LAMPORTS_PER_SOL = 1e9

export const formatAddress = (address: string, length = 4): string => {
  if (!address) return ''
  if (address.length <= length * 2) return address
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`
  }
  return num.toFixed(2)
}

export const formatPrice = (price: number): string => {
  if (price < 0.01) {
    return price.toExponential(2)
  }
  return price.toFixed(6)
}

export const formatMarketCap = (marketCap: number): string => {
  return `$${formatNumber(marketCap)}`
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export const getExplorerUrl = (
  address: string,
  type: 'address' | 'tx' = 'address'
): string => {
  const baseUrl = 'https://solscan.io'
  return `${baseUrl}/${type}/${address}`
}

export const formatTokenAmount = (
  amount: number,
  decimals: number = DEFAULT_TOKEN_DECIMALS
): string => {
  const value = amount / Math.pow(10, decimals)
  return formatNumber(value)
}

export const parseTokenAmount = (
  amount: string,
  decimals: number = DEFAULT_TOKEN_DECIMALS
): number => {
  const value = parseFloat(amount)
  if (isNaN(value)) return 0
  return Math.floor(value * Math.pow(10, decimals))
}

export const calculatePriceImpact = (
  inputAmount: number,
  outputAmount: number,
  reserveInput: number,
  reserveOutput: number
): number => {
  const exactQuote = (inputAmount * reserveOutput) / reserveInput
  const slippage = ((exactQuote - outputAmount) / exactQuote) * 100
  return Math.abs(slippage)
}

export const getPriceFromReserves = (
  solReserves: number,
  tokenReserves: number,
  tokenDecimals: number = DEFAULT_TOKEN_DECIMALS
): number => {
  if (tokenReserves === 0) return 0
  const solAmount = solReserves / LAMPORTS_PER_SOL
  const tokenAmount = tokenReserves / Math.pow(10, tokenDecimals)
  return solAmount / tokenAmount
}