export interface ForexPair {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  isFavorite?: boolean;
}

export interface Position {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: Date;
  closeTime?: Date;
  pnl: number;
  pnlPercent: number;
  status: "OPEN" | "CLOSED";
}

export interface TradeHistory extends Position {
  exitPrice?: number;
}

export const MOCK_PAIRS: ForexPair[] = [
  {
    symbol: "USDJPY",
    name: "USD/JPY",
    price: 149.856,
    change: 0.243,
    changePercent: 0.16,
    high24h: 150.125,
    low24h: 149.512,
    volume: 1523000,
    isFavorite: true,
  },
  {
    symbol: "EURUSD",
    name: "EUR/USD",
    price: 1.0845,
    change: -0.0023,
    changePercent: -0.21,
    high24h: 1.0872,
    low24h: 1.0831,
    volume: 2145000,
  },
  {
    symbol: "GBPUSD",
    name: "GBP/USD",
    price: 1.2634,
    change: 0.0051,
    changePercent: 0.41,
    high24h: 1.2658,
    low24h: 1.2601,
    volume: 1832000,
  },
  {
    symbol: "BTCUSD",
    name: "BTC/USD",
    price: 67342.5,
    change: 1234.8,
    changePercent: 1.87,
    high24h: 67890.2,
    low24h: 66102.3,
    volume: 34567,
  },
];

export const MOCK_OPEN_POSITIONS: Position[] = [
  {
    id: "pos-1",
    symbol: "USDJPY",
    direction: "BUY",
    lots: 0.5,
    entryPrice: 149.512,
    currentPrice: 149.856,
    stopLoss: 149.412,
    takeProfit: 149.712,
    openTime: new Date(Date.now() - 3600000 * 4),
    pnl: 172.0,
    pnlPercent: 0.23,
    status: "OPEN",
  },
  {
    id: "pos-2",
    symbol: "EURUSD",
    direction: "SELL",
    lots: 1.0,
    entryPrice: 1.0868,
    currentPrice: 1.0845,
    stopLoss: 1.0918,
    takeProfit: 1.0768,
    openTime: new Date(Date.now() - 3600000 * 2),
    pnl: 230.0,
    pnlPercent: 0.21,
    status: "OPEN",
  },
  {
    id: "pos-3",
    symbol: "GBPUSD",
    direction: "BUY",
    lots: 0.3,
    entryPrice: 1.2658,
    currentPrice: 1.2634,
    stopLoss: 1.2608,
    takeProfit: 1.2758,
    openTime: new Date(Date.now() - 3600000),
    pnl: -72.0,
    pnlPercent: -0.19,
    status: "OPEN",
  },
];

export const MOCK_TRADE_HISTORY: TradeHistory[] = [
  {
    id: "trade-1",
    symbol: "EURUSD",
    direction: "BUY",
    lots: 0.5,
    entryPrice: 1.0825,
    currentPrice: 1.0845,
    exitPrice: 1.0845,
    stopLoss: 1.0775,
    takeProfit: 1.0925,
    openTime: new Date("2024-01-15T10:30:00"),
    closeTime: new Date("2024-01-15T14:20:00"),
    pnl: 100.0,
    pnlPercent: 0.18,
    status: "CLOSED",
  },
  {
    id: "trade-2",
    symbol: "USDJPY",
    direction: "SELL",
    lots: 1.0,
    entryPrice: 150.125,
    currentPrice: 149.856,
    exitPrice: 149.856,
    stopLoss: 150.375,
    takeProfit: 149.625,
    openTime: new Date("2024-01-14T08:15:00"),
    closeTime: new Date("2024-01-14T16:45:00"),
    pnl: 269.0,
    pnlPercent: 0.18,
    status: "CLOSED",
  },
  // Add more history...
];
