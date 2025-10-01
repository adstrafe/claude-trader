import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VolatilityCalculator } from "@/lib/volatilityCalculator";
import { ForexPair } from "@/lib/mockData";

interface MarketVolatilityIndexProps {
  pairs: ForexPair[];
}

export function MarketVolatilityIndex({ pairs }: MarketVolatilityIndexProps) {
  const [volatility, setVolatility] = useState(0);
  const [previousVolatility, setPreviousVolatility] = useState(0);

  useEffect(() => {
    if (pairs.length > 0) {
      const newVolatility = VolatilityCalculator.calculateMarketVolatility(pairs);
      setPreviousVolatility(volatility);
      setVolatility(newVolatility);
    }
  }, [pairs]);

  const getColor = () => {
    if (volatility >= 80) return 'from-red-500 to-orange-500';
    if (volatility >= 60) return 'from-orange-500 to-yellow-500';
    if (volatility >= 40) return 'from-yellow-500 to-blue-500';
    return 'from-green-500 to-blue-500';
  };

  const getMessage = () => {
    const volatilityInfo = VolatilityCalculator.getVolatilityLevel(volatility);
    const trend = VolatilityCalculator.getVolatilityTrend(volatility, previousVolatility);
    
    return `${volatilityInfo.description}. Trend: ${trend.trend}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-4 py-3 bg-card/50 rounded-lg border cursor-pointer hover:bg-card transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className={cn(
                  "h-4 w-4",
                  volatility >= 80 && "text-red-500 animate-pulse"
                )} />
                <span className="text-sm font-medium">Market Volatility Level</span>
              </div>
              <span className={cn(
                "text-sm font-bold tabular-nums",
                volatility >= 70 ? "text-red-500" : 
                volatility >= 50 ? "text-orange-500" : 
                volatility >= 30 ? "text-yellow-500" : "text-green-500"
              )}>
                {Math.round(volatility)}%
              </span>
            </div>
            
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r transition-all duration-1000 rounded-full",
                  getColor(),
                  volatility >= 80 && "animate-pulse"
                )}
                style={{ width: `${volatility}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
