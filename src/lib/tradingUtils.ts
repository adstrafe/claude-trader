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
  const slDistance = symbol === "BTCUSD" ? 500 : symbol.includes("JPY") ? 0.5 : 0.005;
  const tpDistance = slDistance * 2; // 1:2 RR
  
  if (direction === "BUY") {
    return {
      stopLoss: entry - slDistance,
      takeProfit: entry + tpDistance,
    };
  } else {
    return {
      stopLoss: entry + slDistance,
      takeProfit: entry - tpDistance,
    };
  }
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
