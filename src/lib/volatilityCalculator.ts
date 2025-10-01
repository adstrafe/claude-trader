import { ForexPair } from "./mockData";

/**
 * Calculate market volatility based on forex pair data
 */
export class VolatilityCalculator {
  /**
   * Calculate overall market volatility percentage based on forex pairs
   * @param pairs Array of forex pairs with price data
   * @returns Volatility percentage (0-100)
   */
  static calculateMarketVolatility(pairs: ForexPair[]): number {
    if (pairs.length === 0) return 0;

    // Filter out non-forex pairs (like BTCUSD) for more accurate forex volatility
    const forexPairs = pairs.filter(pair => !pair.symbol.includes('BTC'));
    
    if (forexPairs.length === 0) return 0;

    // Calculate volatility using multiple methods
    const changePercentVolatility = this.calculateChangePercentVolatility(forexPairs);
    const dailyRangeVolatility = this.calculateDailyRangeVolatility(forexPairs);
    const priceMovementVolatility = this.calculatePriceMovementVolatility(forexPairs);

    // Weighted average of different volatility measures
    const weightedVolatility = (
      changePercentVolatility * 0.4 +  // 40% weight - current price changes
      dailyRangeVolatility * 0.4 +     // 40% weight - daily price ranges
      priceMovementVolatility * 0.2    // 20% weight - overall price movements
    );

    // Convert to 0-100 scale and cap at 100
    return Math.min(100, Math.max(0, weightedVolatility));
  }

  /**
   * Calculate volatility based on current price change percentages
   */
  private static calculateChangePercentVolatility(pairs: ForexPair[]): number {
    const changePercentages = pairs.map(pair => Math.abs(pair.changePercent));
    
    if (changePercentages.length === 0) return 0;

    // Calculate average absolute change percentage
    const avgChange = changePercentages.reduce((sum, change) => sum + change, 0) / changePercentages.length;
    
    // Calculate standard deviation for volatility measure
    const variance = changePercentages.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changePercentages.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Convert to 0-100 scale (typical forex daily changes are 0-2%, so scale accordingly)
    return Math.min(100, (avgChange + standardDeviation) * 25);
  }

  /**
   * Calculate volatility based on daily price ranges (high24h - low24h)
   */
  private static calculateDailyRangeVolatility(pairs: ForexPair[]): number {
    const dailyRanges = pairs.map(pair => {
      const range = pair.high24h - pair.low24h;
      const rangePercent = (range / pair.price) * 100;
      return rangePercent;
    });

    if (dailyRanges.length === 0) return 0;

    const avgRange = dailyRanges.reduce((sum, range) => sum + range, 0) / dailyRanges.length;
    
    // Convert to 0-100 scale (typical forex daily ranges are 0-3%, so scale accordingly)
    return Math.min(100, avgRange * 20);
  }

  /**
   * Calculate volatility based on overall price movements and volume
   */
  private static calculatePriceMovementVolatility(pairs: ForexPair[]): number {
    // Calculate weighted volatility based on volume (higher volume = more significant)
    const totalVolume = pairs.reduce((sum, pair) => sum + pair.volume, 0);
    
    if (totalVolume === 0) return 0;

    const weightedVolatility = pairs.reduce((sum, pair) => {
      const weight = pair.volume / totalVolume;
      const pairVolatility = Math.abs(pair.changePercent) * weight;
      return sum + pairVolatility;
    }, 0);

    // Convert to 0-100 scale
    return Math.min(100, weightedVolatility * 25);
  }

  /**
   * Get volatility level description
   */
  static getVolatilityLevel(volatility: number): {
    level: 'Low' | 'Moderate' | 'High' | 'Extreme';
    description: string;
    color: string;
  } {
    if (volatility >= 80) {
      return {
        level: 'Extreme',
        description: 'Extreme volatility - High risk/reward opportunities',
        color: 'text-red-500'
      };
    } else if (volatility >= 60) {
      return {
        level: 'High',
        description: 'High volatility - Active trading conditions',
        color: 'text-orange-500'
      };
    } else if (volatility >= 40) {
      return {
        level: 'Moderate',
        description: 'Moderate volatility - Normal market conditions',
        color: 'text-yellow-500'
      };
    } else {
      return {
        level: 'Low',
        description: 'Low volatility - Calm market conditions',
        color: 'text-green-500'
      };
    }
  }

  /**
   * Get volatility trend (increasing, decreasing, stable)
   */
  static getVolatilityTrend(currentVolatility: number, previousVolatility: number): {
    trend: 'Increasing' | 'Decreasing' | 'Stable';
    change: number;
  } {
    const change = currentVolatility - previousVolatility;
    const threshold = 5; // 5% change threshold

    if (change > threshold) {
      return { trend: 'Increasing', change };
    } else if (change < -threshold) {
      return { trend: 'Decreasing', change };
    } else {
      return { trend: 'Stable', change };
    }
  }
}
