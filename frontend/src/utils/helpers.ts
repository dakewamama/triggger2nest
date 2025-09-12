/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  if (error && typeof error === 'object' && 'error' in error) {
    return String((error as any).error);
  }
  
  return 'An unknown error occurred';
};

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Format large numbers with appropriate suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
};

/**
 * Format price with appropriate decimal places
 */
export const formatPrice = (price: number): string => {
  if (price >= 1) {
    return price.toFixed(2);
  }
  if (price >= 0.01) {
    return price.toFixed(4);
  }
  return price.toFixed(6);
};

/**
 * Truncate wallet address for display
 */
export const truncateAddress = (address: string, startLength = 4, endLength = 4): string => {
  if (address.length <= startLength + endLength) {
    return address;
  }
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Sleep utility for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Validate Solana address format
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // Basic validation - Solana addresses are 32-44 characters long and base58 encoded
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
};

/**
 * Format time ago from timestamp
 */
export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - (timestamp * 1000);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

/**
 * Validate and sanitize token inputs
 */
export const sanitizeTokenInput = {
  name: (name: string): string => {
    return name.trim().substring(0, 50);
  },
  symbol: (symbol: string): string => {
    return symbol.replace(/[^A-Z0-9]/g, '').substring(0, 10);
  },
  description: (description: string): string => {
    return description.trim().substring(0, 500);
  }
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (oldValue: number, newValue: number): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Format market cap for display
 */
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
  return `$${marketCap.toFixed(2)}`;
};

/**
 * Check if token is valid pump.fun token
 */
export const isValidPumpToken = (token: any): boolean => {
  return !!(
    token &&
    token.mint &&
    token.name &&
    token.symbol &&
    typeof token.virtual_sol_reserves === 'number' &&
    typeof token.virtual_token_reserves === 'number'
  );
};