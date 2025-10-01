import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Ghost, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/tradingUtils";

interface GhostTrade {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  viewedAt: Date;
  entryPrice: number;
  currentPrice: number;
  hypotheticalPips: number;
  hypotheticalPnL: number;
}

const STORAGE_KEY = 'ghost_trades';

export function GhostTrades() {
  const [ghostTrades, setGhostTrades] = useState<GhostTrade[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const trades = JSON.parse(stored).map((t: any) => ({
        ...t,
        viewedAt: new Date(t.viewedAt)
      }));
      setGhostTrades(trades.slice(0, 5)); // Show last 5
    }
  }, []);

  if (ghostTrades.length === 0) {
    return (
      <Card className="p-6 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <Ghost className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">What If Machine</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Trades you consider but don't execute will appear here as "ghost trades" - 
          showing what could have happened.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50">
      <div className="flex items-center gap-2 mb-4">
        <Ghost className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">What If Machine</h3>
      </div>
      
      <div className="space-y-3">
        {ghostTrades.map((trade) => {
          const isProfit = trade.hypotheticalPnL > 0;
          
          return (
            <div
              key={trade.id}
              className={cn(
                "p-3 rounded-lg border bg-background/50 transition-all hover:bg-background",
                isProfit ? "border-success/20" : "border-danger/20"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{trade.symbol}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      trade.direction === 'BUY' 
                        ? "bg-success/10 text-success" 
                        : "bg-danger/10 text-danger"
                    )}>
                      {trade.direction}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(trade.viewedAt)} you considered this trade
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={cn(
                    "flex items-center gap-1 font-semibold text-sm",
                    isProfit ? "text-success" : "text-danger"
                  )}>
                    {isProfit ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {isProfit ? '+' : ''}{trade.hypotheticalPips.toFixed(1)} pips
                  </div>
                  <div className={cn(
                    "text-xs tabular-nums",
                    isProfit ? "text-success" : "text-danger"
                  )}>
                    {isProfit ? '+' : ''}${trade.hypotheticalPnL.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Helper function to track when user views a pair
export function trackGhostTrade(
  symbol: string,
  direction: 'BUY' | 'SELL',
  entryPrice: number
) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const trades = stored ? JSON.parse(stored) : [];
  
  const newTrade: GhostTrade = {
    id: `ghost-${Date.now()}`,
    symbol,
    direction,
    viewedAt: new Date(),
    entryPrice,
    currentPrice: entryPrice,
    hypotheticalPips: 0,
    hypotheticalPnL: 0
  };
  
  trades.unshift(newTrade);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades.slice(0, 20))); // Keep last 20
}
