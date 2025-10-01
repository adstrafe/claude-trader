export const calculatePips = (entry: number, current: number, symbol: string): number => {
  const pipFactor = symbol.includes("JPY") ? 100 : 10000;
  return Math.abs(current - entry) * pipFactor;
};

export const calculatePnL = (
  entry: number,
  current: number,
  lots: number,
  direction: "BUY" | "SELL",
  symbol: string
): number => {
  const pipValue = symbol === "BTCUSD" ? 1 : 10; // Simplified for demo
  const pips = calculatePips(entry, current, symbol);
  const multiplier = direction === "BUY" ? (current > entry ? 1 : -1) : (current < entry ? 1 : -1);
  return pips * pipValue * lots * multiplier;
};

export const calculateAutoTPSL = (
  entry: number,
  direction: "BUY" | "SELL",
  symbol: string
): { stopLoss: number; takeProfit: number } => {
  // Calculate appropriate distance based on symbol type and current price
  let slDistance: number;
  
  if (symbol === "BTCUSD") {
    slDistance = 500; // $500 for BTC
  } else if (symbol.includes("JPY")) {
    slDistance = 0.5; // 50 pips for JPY pairs
  } else {
    // For major pairs like EUR/USD, GBP/USD, EUR/GBP, etc.
    // Use percentage-based distance for more realistic values
    slDistance = entry * 0.005; // 0.5% of current price
  }
  
  const tpDistance = slDistance * 2; // 1:2 Risk/Reward ratio
  
  // Get the appropriate number of decimal places for this symbol
  const decimals = symbol === "BTCUSD" ? 2 : symbol.includes("JPY") ? 3 : 5;
  
  let stopLoss: number;
  let takeProfit: number;
  
  if (direction === "BUY") {
    stopLoss = entry - slDistance;
    takeProfit = entry + tpDistance;
  } else {
    stopLoss = entry + slDistance;
    takeProfit = entry - tpDistance;
  }
  
  // Round to the appropriate number of decimal places
  return {
    stopLoss: Math.round(stopLoss * Math.pow(10, decimals)) / Math.pow(10, decimals),
    takeProfit: Math.round(takeProfit * Math.pow(10, decimals)) / Math.pow(10, decimals),
  };
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

export const formatPrice = (price: number, symbol: string): string => {
  const decimals = symbol === "BTCUSD" ? 2 : symbol.includes("JPY") ? 3 : 5;
  return price.toFixed(decimals);
};
