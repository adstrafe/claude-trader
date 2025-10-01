import { ForexPair } from "./mockData";

export class PriceSimulator {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  
  start(pairs: ForexPair[], onUpdate: (pairs: ForexPair[]) => void) {
    pairs.forEach(pair => {
      const interval = setInterval(() => {
        const volatility = this.getVolatility(pair.symbol);
        const change = (Math.random() - 0.5) * volatility;
        const newPrice = pair.price + change;
        
        pair.price = Math.max(0.0001, newPrice);
        pair.change = newPrice - (pair.price - pair.change);
        pair.changePercent = (pair.change / (pair.price - pair.change)) * 100;
        
        onUpdate([...pairs]);
      }, 2000);
      
      this.intervals.set(pair.symbol, interval);
    });
  }
  
  stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
  
  private getVolatility(symbol: string): number {
    const volatilityMap: Record<string, number> = {
      USDJPY: 0.05,
      EURUSD: 0.0002,
      GBPUSD: 0.0003,
      BTCUSD: 50,
    };
    return volatilityMap[symbol] || 0.0001;
  }
}

export const priceSimulator = new PriceSimulator();
