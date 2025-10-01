import { Position } from "./mockData";

const STORAGE_KEY = 'simulated_trades';
const BALANCE_KEY = 'simulated_balance';
const INITIAL_BALANCE = 10000;

interface SimulatedTrade {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: Date;
  pnl: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED';
  closeTime?: Date;
  exitPrice?: number;
}

class SimulatedTradingSystem {
  private trades: SimulatedTrade[] = [];
  private balance: number = INITIAL_BALANCE;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load trades and balance from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.trades = parsed.map((t: any) => ({
          ...t,
          openTime: new Date(t.openTime),
          closeTime: t.closeTime ? new Date(t.closeTime) : undefined,
        }));
      }

      const storedBalance = localStorage.getItem(BALANCE_KEY);
      if (storedBalance) {
        this.balance = parseFloat(storedBalance);
      } else {
        this.balance = INITIAL_BALANCE;
        this.saveBalance();
      }
    } catch (error) {
      console.error('Error loading simulated trades:', error);
      this.trades = [];
      this.balance = INITIAL_BALANCE;
    }
  }

  /**
   * Save trades to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.trades));
    } catch (error) {
      console.error('Error saving simulated trades:', error);
    }
  }

  /**
   * Save balance to localStorage
   */
  private saveBalance(): void {
    try {
      localStorage.setItem(BALANCE_KEY, this.balance.toString());
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  }

  /**
   * Get current balance
   */
  getBalance(): number {
    return this.balance;
  }

  /**
   * Get equity (balance + unrealized P/L)
   */
  getEquity(): number {
    const unrealizedPnL = this.trades
      .filter(t => t.status === 'OPEN')
      .reduce((sum, t) => sum + t.pnl, 0);
    return this.balance + unrealizedPnL;
  }

  /**
   * Open a new simulated trade
   */
  openTrade(params: {
    symbol: string;
    direction: 'BUY' | 'SELL';
    lots: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
  }): SimulatedTrade {
    const trade: SimulatedTrade = {
      id: `SIM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol: params.symbol,
      direction: params.direction,
      lots: params.lots,
      entryPrice: params.entryPrice,
      currentPrice: params.entryPrice,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      openTime: new Date(),
      pnl: 0,
      pnlPercent: 0,
      status: 'OPEN',
    };

    this.trades.push(trade);
    this.saveToStorage();
    return trade;
  }

  /**
   * Update price for a trade and check TP/SL
   */
  updateTradePrice(tradeId: string, currentPrice: number): SimulatedTrade | null {
    const trade = this.trades.find(t => t.id === tradeId && t.status === 'OPEN');
    if (!trade) return null;

    trade.currentPrice = currentPrice;

    // Calculate P/L
    const priceDiff = trade.direction === 'BUY' 
      ? currentPrice - trade.entryPrice 
      : trade.entryPrice - currentPrice;
    
    const pipValue = this.getPipValue(trade.symbol);
    trade.pnl = priceDiff * trade.lots * pipValue;
    trade.pnlPercent = (priceDiff / trade.entryPrice) * 100;

    // Check Stop Loss
    if (trade.direction === 'BUY' && currentPrice <= trade.stopLoss) {
      return this.closeTrade(tradeId, trade.stopLoss);
    }
    if (trade.direction === 'SELL' && currentPrice >= trade.stopLoss) {
      return this.closeTrade(tradeId, trade.stopLoss);
    }

    // Check Take Profit
    if (trade.direction === 'BUY' && currentPrice >= trade.takeProfit) {
      return this.closeTrade(tradeId, trade.takeProfit);
    }
    if (trade.direction === 'SELL' && currentPrice <= trade.takeProfit) {
      return this.closeTrade(tradeId, trade.takeProfit);
    }

    this.saveToStorage();
    return trade;
  }

  /**
   * Close a trade
   */
  closeTrade(tradeId: string, exitPrice?: number): SimulatedTrade | null {
    const trade = this.trades.find(t => t.id === tradeId && t.status === 'OPEN');
    if (!trade) return null;

    const closePrice = exitPrice || trade.currentPrice;
    trade.exitPrice = closePrice;
    trade.closeTime = new Date();
    trade.status = 'CLOSED';

    // Final P/L calculation
    const priceDiff = trade.direction === 'BUY' 
      ? closePrice - trade.entryPrice 
      : trade.entryPrice - closePrice;
    
    const pipValue = this.getPipValue(trade.symbol);
    trade.pnl = priceDiff * trade.lots * pipValue;
    trade.pnlPercent = (priceDiff / trade.entryPrice) * 100;

    // Update balance
    this.balance += trade.pnl;
    this.saveBalance();
    this.saveToStorage();

    return trade;
  }

  /**
   * Get all open trades
   */
  getOpenTrades(): SimulatedTrade[] {
    return this.trades.filter(t => t.status === 'OPEN');
  }

  /**
   * Get all closed trades
   */
  getClosedTrades(): SimulatedTrade[] {
    return this.trades.filter(t => t.status === 'CLOSED');
  }

  /**
   * Get all trades
   */
  getAllTrades(): SimulatedTrade[] {
    return [...this.trades];
  }

  /**
   * Convert simulated trade to Position format
   */
  toPosition(trade: SimulatedTrade): Position {
    return {
      id: trade.id,
      symbol: trade.symbol,
      direction: trade.direction,
      lots: trade.lots,
      entryPrice: trade.entryPrice,
      currentPrice: trade.currentPrice,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      openTime: trade.openTime,
      closeTime: trade.closeTime,
      pnl: trade.pnl,
      pnlPercent: trade.pnlPercent,
      status: trade.status,
    };
  }

  /**
   * Get pip value for a symbol (simplified)
   */
  private getPipValue(symbol: string): number {
    // For standard forex pairs (100,000 units per lot)
    // JPY pairs have different pip value
    if (symbol.includes('JPY')) {
      return 1000; // 0.01 pip for JPY pairs
    }
    return 10; // 0.0001 pip for other pairs
  }

  /**
   * Reset all trades and balance (for testing)
   */
  reset(): void {
    this.trades = [];
    this.balance = INITIAL_BALANCE;
    this.saveToStorage();
    this.saveBalance();
  }
}

// Export singleton instance
export const simulatedTrading = new SimulatedTradingSystem();
export type { SimulatedTrade };

