import { ForexPair, Position } from "./mockData";
import { YBSymbol, YBPosition } from "@/services/yourBourseAPI";

/**
 * Format symbol name to display format (e.g., EURUSD -> EUR/USD)
 */
function formatSymbolName(symbol: string): string {
  if (symbol.length === 6) {
    return `${symbol.substring(0, 3)}/${symbol.substring(3, 6)}`;
  }
  return symbol;
}

/**
 * Convert YourBourse symbol to ForexPair format
 */
export function convertSymbolToForexPair(symbol: YBSymbol): ForexPair {
  // Use realistic default prices based on common forex ranges
  const getDefaultPrice = (symbolName: string): number => {
    // More accurate default prices for different currency pairs
    if (symbolName.includes('JPY')) {
      if (symbolName.includes('AUD')) return 95.0;  // AUD/JPY typically ~90-110
      if (symbolName.includes('GBP')) return 180.0; // GBP/JPY typically ~170-190
      if (symbolName.includes('EUR')) return 160.0; // EUR/JPY typically ~150-170
      if (symbolName.includes('USD')) return 150.0; // USD/JPY typically ~140-160
      return 120.0; // Other JPY pairs
    }
    if (symbolName.includes('GBP')) return 1.25; // GBP pairs typically ~1.2-1.3
    if (symbolName.includes('AUD')) return 0.65; // AUD pairs typically ~0.6-0.7
    if (symbolName.includes('NZD')) return 0.60; // NZD pairs typically ~0.55-0.65
    if (symbolName.includes('CAD')) return 1.35; // CAD pairs typically ~1.3-1.4
    if (symbolName.includes('CHF')) return 0.90; // CHF pairs typically ~0.85-0.95
    return 1.0;  // EUR/USD and other major pairs typically around 1.0
  };
  
  const defaultPrice = getDefaultPrice(symbol.n);
  const price = symbol.a && symbol.bid ? (symbol.a + symbol.bid) / 2 : defaultPrice;
  const change = symbol.c || 0;
  const changePercent = symbol.cp || 0;

  // Debug logging for all pairs to see what data we're getting
  console.log(`${symbol.n} Initial Price Conversion:`, {
    symbol: symbol.n,
    ask: symbol.a,
    bid: symbol.bid,
    defaultPrice: defaultPrice,
    finalPrice: price,
    hasRealPrice: !!(symbol.a && symbol.bid),
    change: symbol.c,
    changePercent: symbol.cp,
    high24h: symbol.h,
    low24h: symbol.low,
    note: !!(symbol.a && symbol.bid) ? 'Using real API price' : 'Using default price - waiting for real-time updates'
  });

  return {
    symbol: symbol.n,
    name: formatSymbolName(symbol.n),
    price: price,
    change: change,
    changePercent: changePercent,
    high24h: symbol.h || price,
    low24h: symbol.low || price,
    volume: symbol.v || 0,
    isFavorite: false,
  };
}

/**
 * Convert multiple YourBourse symbols to ForexPair array
 */
export function convertSymbolsToForexPairs(symbols: YBSymbol[]): ForexPair[] {
  return symbols
    .filter(s => s.n && s.d) // Only include symbols with name and description
    .map(convertSymbolToForexPair);
}

/**
 * Convert YourBourse position to our Position format
 */
export function convertYBPositionToPosition(ybPosition: YBPosition): Position {
  const pnlPercent = ((ybPosition.profit / (ybPosition.openPrice * ybPosition.volume)) * 100) || 0;

  return {
    id: ybPosition.id,
    symbol: ybPosition.symbol,
    direction: ybPosition.side,
    lots: ybPosition.volume,
    entryPrice: ybPosition.openPrice,
    currentPrice: ybPosition.currentPrice,
    stopLoss: ybPosition.sl || 0,
    takeProfit: ybPosition.tp || 0,
    openTime: new Date(ybPosition.openTime),
    pnl: ybPosition.profit,
    pnlPercent: pnlPercent,
    status: 'OPEN',
  };
}

/**
 * Convert multiple YourBourse positions to Position array
 */
export function convertYBPositionsToPositions(ybPositions: YBPosition[]): Position[] {
  return ybPositions.map(convertYBPositionToPosition);
}

/**
 * Get popular forex pairs to filter from all symbols
 */
export function filterPopularForexPairs(pairs: ForexPair[]): ForexPair[] {
  const popularSymbols = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF',
    'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP',
    'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD',
  ];

  const popularPairs = pairs.filter(pair => 
    popularSymbols.includes(pair.symbol)
  );

  // If we have popular pairs, return them; otherwise return first 8 pairs
  return popularPairs.length > 0 ? popularPairs : pairs.slice(0, 8);
}

