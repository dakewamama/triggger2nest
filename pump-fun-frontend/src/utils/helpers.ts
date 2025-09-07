export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const validateSolanaAddress = (address: string): boolean => {
  // Basic validation - Solana addresses are base58 encoded and typically 44 characters
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaAddressRegex.test(address);
};

export const validateTokenSymbol = (symbol: string): boolean => {
  // Token symbols should be alphanumeric and uppercase
  const symbolRegex = /^[A-Z0-9]+$/;
  return symbolRegex.test(symbol) && symbol.length <= 10;
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

export const calculatePriceImpact = (
  inputAmount: number,
  outputAmount: number,
  spotPrice: number
): number => {
  const executionPrice = inputAmount / outputAmount;
  const priceImpact = ((executionPrice - spotPrice) / spotPrice) * 100;
  return Math.abs(priceImpact);
};

export const parseTokenAmount = (
  amount: string,
  decimals: number = DEFAULT_TOKEN_DECIMALS
): number => {
  const cleanAmount = amount.replace(/,/g, '');
  const parsed = parseFloat(cleanAmount);
  if (isNaN(parsed)) return 0;
  return parsed * Math.pow(10, decimals);
};
