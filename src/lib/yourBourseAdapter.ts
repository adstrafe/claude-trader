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
    if (symbolName.includes('JPY')) return 150.0;  // JPY pairs typically ~100-150
    return 1.0;  // Other pairs typically around 1.0
  };
  
  const defaultPrice = getDefaultPrice(symbol.n);
  const price = symbol.a && symbol.bid ? (symbol.a + symbol.bid) / 2 : defaultPrice;
  const change = symbol.c || 0;
  const changePercent = symbol.cp || 0;

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

