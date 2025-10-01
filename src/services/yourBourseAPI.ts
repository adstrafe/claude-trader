import CryptoJS from 'crypto-js';

const BASE_URL = 'https://yourbourse.trade:32220/api/v1';
const WS_URL = 'wss://yourbourse.trade:32220/ws/v1';

interface YBSymbol {
  n: string;      // Symbol name
  d: string;      // Description
  v?: number;     // Version/volume
  dp: number;     // Decimal places
  l: number;      // Lot size
  a?: number;     // Current ask price
  bid?: number;   // Current bid price
  c?: number;     // Last price change
  cp?: number;    // Change percent
  h?: number;     // 24h high
  low?: number;   // 24h low
}

interface YBAccountState {
  b: number;      // Balance
  C: number;      // Credit
  pl: number;     // Unrealized P/L
  e: number;      // Equity
  m: number;      // Margin
  c: string;      // Currency
}

interface YBPosition {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  sl: number;
  tp: number;
  profit: number;
  openTime: number;
}

class YourBourseAPI {
  private accountId: number;
  private password: string;
  private apiToken: string | null = null;
  private ws: WebSocket | null = null;
  private priceSubscriptions: Map<string, (data: any) => void> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private shouldReconnect: boolean = true;

  constructor() {
    this.accountId = parseInt(import.meta.env.VITE_YB_ACCOUNT_ID || '0');
    this.password = import.meta.env.VITE_YB_PASSWORD || '';
  }

  /**
   * Generate HMAC-SHA256 signature for authentication
   */
  private generateSignature(body: string): string {
    const hash = CryptoJS.HmacSHA256(body, this.password);
    const base64 = CryptoJS.enc.Base64.stringify(hash);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  /**
   * Authenticate and get API token
   */
  async authenticate(): Promise<string> {
    const timestamp = Date.now() * 1000; // Microseconds
    const data = { login: this.accountId };
    const content = JSON.stringify(data);
    const body = `Content=${content}\nTimestamp=${timestamp}`;
    const signature = this.generateSignature(body);

    const response = await fetch(`${BASE_URL}/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-YB-Timestamp': timestamp.toString(),
        'X-YB-API-Key': '',
        'X-YB-Sign': signature,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const result = await response.json();
    this.apiToken = result.token;
    return result.token;
  }

  /**
   * Ensure we have a valid API token
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.apiToken) {
      await this.authenticate();
    }
  }

  /**
   * Get list of all available symbols
   */
  async getSymbols(): Promise<YBSymbol[]> {
    await this.ensureAuthenticated();

    const response = await fetch(`${BASE_URL}/symbols/query`, {
      method: 'GET',
      headers: {
        'X-YB-API-Key': this.apiToken!,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch symbols: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Symbols API response:', data);
    
    // Check if response is an object with symbols array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Try to find the symbols array in the response
      if (data.symbols && Array.isArray(data.symbols)) {
        return data.symbols;
      }
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      // If it's an object of symbols, convert to array
      if (Object.keys(data).length > 0) {
        return Object.values(data);
      }
    }
    
    // If it's already an array, return it
    if (Array.isArray(data)) {
      return data;
    }
    
    console.error('Unexpected symbols response format:', data);
    return [];
  }

  /**
   * Get specific symbol information
   */
  async getSymbol(symbol: string): Promise<YBSymbol> {
    await this.ensureAuthenticated();

    const response = await fetch(`${BASE_URL}/symbols/get/${symbol}`, {
      method: 'GET',
      headers: {
        'X-YB-API-Key': this.apiToken!,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch symbol ${symbol}: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get account state (balance, equity, P/L, etc.)
   */
  async getAccountState(): Promise<YBAccountState> {
    await this.ensureAuthenticated();

    const timestamp = Date.now() * 1000;
    // Special case: no Content in HMAC for this endpoint
    const body = `Timestamp=${timestamp}`;
    const signature = this.generateSignature(body);

    const response = await fetch(`${BASE_URL}/account/state`, {
      method: 'POST',
      headers: {
        'X-YB-Timestamp': timestamp.toString(),
        'X-YB-API-Key': this.apiToken!,
        'X-YB-Sign': signature,
      },
      // No body sent
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch account state: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create a new order
   */
  async createOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    volume: number;
    sl?: number;
    tp?: number;
  }): Promise<any> {
    await this.ensureAuthenticated();

    const timestamp = Date.now() * 1000;
    const payload = {
      symbol: params.symbol,
      side: params.side,
      volume: params.volume,
      type: 'MARKET',
      ...(params.sl && { sl: params.sl }),
      ...(params.tp && { tp: params.tp }),
    };
    const content = JSON.stringify(payload);
    const body = `Content=${content}\nTimestamp=${timestamp}`;
    const signature = this.generateSignature(body);

    const response = await fetch(`${BASE_URL}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-YB-Timestamp': timestamp.toString(),
        'X-YB-API-Key': this.apiToken!,
        'X-YB-Sign': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Query orders
   */
  async getOrders(): Promise<any[]> {
    await this.ensureAuthenticated();

    const response = await fetch(`${BASE_URL}/orders/query`, {
      method: 'GET',
      headers: {
        'X-YB-API-Key': this.apiToken!,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Query positions
   */
  async getPositions(): Promise<YBPosition[]> {
    await this.ensureAuthenticated();

    try {
      const response = await fetch(`${BASE_URL}/positions/query`, {
        method: 'GET',
        headers: {
          'X-YB-API-Key': this.apiToken!,
        },
      });

      if (!response.ok) {
        console.warn(`Positions query returned ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      }
      if (data && data.positions && Array.isArray(data.positions)) {
        return data.positions;
      }
      if (data && data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      console.warn('Unexpected positions response format:', data);
      return [];
    } catch (error) {
      console.warn('Failed to fetch positions (might be empty or endpoint not available):', error);
      return [];
    }
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string, volume?: number): Promise<any> {
    await this.ensureAuthenticated();

    const timestamp = Date.now() * 1000;
    const payload = {
      id: positionId,
      ...(volume && { volume }),
    };
    const content = JSON.stringify(payload);
    const body = `Content=${content}\nTimestamp=${timestamp}`;
    const signature = this.generateSignature(body);

    const response = await fetch(`${BASE_URL}/positions/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-YB-Timestamp': timestamp.toString(),
        'X-YB-API-Key': this.apiToken!,
        'X-YB-Sign': signature,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to close position: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Connect to WebSocket for real-time data
   */
  async connectWebSocket(): Promise<void> {
    // Don't connect if already connected or connecting
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }
    
    await this.ensureAuthenticated();
    
    this.shouldReconnect = true; // Enable auto-reconnect for this connection

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.startPingInterval();
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopPingInterval();
        
        // Only auto-reconnect if it's an unexpected disconnection
        if (this.shouldReconnect) {
          // Clear any existing reconnect timeout
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
          }
          
          // Store current subscriptions before reconnecting
          const subscribedSymbols = Array.from(this.priceSubscriptions.keys());
          
          // Auto-reconnect after 3 seconds
          this.reconnectTimeout = setTimeout(async () => {
            try {
              console.log('Attempting to reconnect WebSocket...');
              await this.connectWebSocket();
              
              // Resubscribe to all previously subscribed symbols
              subscribedSymbols.forEach(symbol => {
                const callback = this.priceSubscriptions.get(symbol);
                if (callback) {
                  this.subscribeToPrices(symbol, callback);
                }
              });
            } catch (err) {
              console.error('Failed to reconnect WebSocket:', err);
            }
          }, 3000);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle pong responses
          if (data.m === 'pong') {
            return;
          }

          // Handle price updates - data.d is an array!
          if (data.c === 'L1' && data.d && Array.isArray(data.d) && data.d.length > 0) {
            const priceData = data.d[0]; // Get first element
            const symbol = priceData.s;
            const callback = this.priceSubscriptions.get(symbol);
            if (callback) {
              // Transform the data to match expected format
              const transformedData = {
                s: priceData.s,
                bid: priceData.bp,  // bid price
                a: priceData.ap,    // ask price
                t: priceData.t,
              };
              callback(transformedData);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    });
  }

  /**
   * Subscribe to real-time price updates for a symbol
   */
  subscribeToPrices(symbol: string, callback: (data: any) => void): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    this.priceSubscriptions.set(symbol, callback);

    const subscribeMsg = {
      m: 'subscribe',
      c: 'L1',
      p: {
        s: symbol,
        streaming: true,
      },
      h: {
        'X-YB-API-Key': this.apiToken,
        'X-YB-LOCALE': 'en',
      },
      reqId: `req_${Date.now()}`,
    };

    this.ws.send(JSON.stringify(subscribeMsg));
  }

  /**
   * Unsubscribe from price updates
   */
  unsubscribeFromPrices(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.priceSubscriptions.delete(symbol);

    const unsubscribeMsg = {
      m: 'unsubscribe',
      c: 'L1',
      p: {
        s: symbol,
      },
      h: {
        'X-YB-API-Key': this.apiToken,
        'X-YB-LOCALE': 'en',
      },
      reqId: `req_${Date.now()}`,
    };

    this.ws.send(JSON.stringify(unsubscribeMsg));
  }

  /**
   * Start ping interval to keep WebSocket alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ m: 'ping' }));
      }
    }, 10000); // Every 10 seconds (more frequent to prevent timeout)
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    this.shouldReconnect = false; // Prevent auto-reconnect on intentional disconnect
    this.stopPingInterval();
    
    // Clear any pending reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.priceSubscriptions.clear();
  }
}

// Export singleton instance
export const yourBourseAPI = new YourBourseAPI();
export type { YBSymbol, YBAccountState, YBPosition };

