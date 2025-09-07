export const formatAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatPrice = (price: number): string => {
  if (price === 0) return '$0';
  if (price < 0.00001) return `$${price.toExponential(2)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 100) return `$${price.toFixed(2)}`;
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const formatNumber = (num: number, decimals = 2): string => {
  if (num === 0) return '0';
  if (num < 1000) return num.toFixed(decimals);
  if (num < 1_000_000) return `${(num / 1000).toFixed(decimals)}K`;
  if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(decimals)}M`;
  return `${(num / 1_000_000_000).toFixed(decimals)}B`;
};

export const formatMarketCap = (marketCap: number): string => {
  if (marketCap === 0) return '$0';
  if (marketCap < 1000) return `$${marketCap.toFixed(0)}`;
  if (marketCap < 1_000_000) return `$${(marketCap / 1000).toFixed(1)}K`;
  if (marketCap < 1_000_000_000) return `$${(marketCap / 1_000_000).toFixed(2)}M`;
  return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
};

export const formatPercentage = (value: number, showSign = true): string => {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  if (!showSign) return formatted;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
};

export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString();
};

export const formatSol = (lamports: number): string => {
  const sol = lamports / 1e9;
  return `${sol.toFixed(4)} SOL`;
};

export const formatTokenAmount = (amount: number, decimals = 6): string => {
  const actualAmount = amount / Math.pow(10, decimals);
  return formatNumber(actualAmount);
};