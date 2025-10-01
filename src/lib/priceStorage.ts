interface PriceData {
  symbol: string;
  timestamp: number;
  ask: number;
  bid: number;
  midPrice: number;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

class PriceStorageService {
  private dbName = 'TradingAppDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create price data store
        if (!db.objectStoreNames.contains('prices')) {
          const priceStore = db.createObjectStore('prices', { keyPath: ['symbol', 'timestamp'] });
          priceStore.createIndex('symbol', 'symbol', { unique: false });
          priceStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create candles store
        if (!db.objectStoreNames.contains('candles')) {
          const candleStore = db.createObjectStore('candles', { keyPath: ['symbol', 'timeframe', 'time'] });
          candleStore.createIndex('symbol_timeframe', ['symbol', 'timeframe'], { unique: false });
        }
      };
    });
  }

  async storePrice(priceData: PriceData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['prices'], 'readwrite');
      const store = transaction.objectStore('prices');
      const request = store.put(priceData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getRecentPrices(symbol: string, limit: number = 100): Promise<PriceData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['prices'], 'readonly');
      const store = transaction.objectStore('prices');
      const index = store.index('symbol');
      const request = index.getAll(symbol);

      request.onsuccess = () => {
        const prices = request.result
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
        resolve(prices);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async generateCandles(symbol: string, timeframe: string = '15m', limit: number = 100): Promise<CandleData[]> {
    const prices = await this.getRecentPrices(symbol, limit * 10); // Get more prices to generate candles
    
    if (prices.length === 0) return [];

    // Convert timeframe to milliseconds
    const timeframeMs = this.getTimeframeMs(timeframe);
    
    // Group prices by timeframe
    const candles: { [key: number]: PriceData[] } = {};
    
    prices.forEach(price => {
      const candleTime = Math.floor(price.timestamp / timeframeMs) * timeframeMs;
      if (!candles[candleTime]) {
        candles[candleTime] = [];
      }
      candles[candleTime].push(price);
    });

    // Generate candle data
    const candleData: CandleData[] = Object.keys(candles)
      .map(time => parseInt(time))
      .sort((a, b) => a - b)
      .map(time => {
        const candlePrices = candles[time];
        const open = candlePrices[0].midPrice;
        const close = candlePrices[candlePrices.length - 1].midPrice;
        const high = Math.max(...candlePrices.map(p => p.midPrice));
        const low = Math.min(...candlePrices.map(p => p.midPrice));

        return {
          time: time / 1000, // Convert to seconds for chart
          open,
          high,
          low,
          close
        };
      })
      .slice(-limit); // Get last N candles

    return candleData;
  }

  private getTimeframeMs(timeframe: string): number {
    const timeframes: { [key: string]: number } = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || 15 * 60 * 1000; // Default to 15m
  }

  async clearOldData(symbol: string, olderThanHours: number = 24): Promise<void> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['prices'], 'readwrite');
      const store = transaction.objectStore('prices');
      const index = store.index('symbol');
      const request = index.getAll(symbol);

      request.onsuccess = () => {
        const prices = request.result;
        const deletePromises = prices
          .filter(price => price.timestamp < cutoffTime)
          .map(price => {
            return new Promise<void>((resolveDelete, rejectDelete) => {
              const deleteRequest = store.delete([symbol, price.timestamp]);
              deleteRequest.onsuccess = () => resolveDelete();
              deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
            });
          });

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const priceStorage = new PriceStorageService();
export type { PriceData, CandleData };
