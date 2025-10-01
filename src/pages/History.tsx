import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_TRADE_HISTORY, TradeHistory } from "@/lib/mockData";
import { formatPrice, formatRelativeTime } from "@/lib/tradingUtils";
import { cn } from "@/lib/utils";

export default function History() {
  const [trades] = useState<TradeHistory[]>(MOCK_TRADE_HISTORY);
  const [visibleCount, setVisibleCount] = useState(10);

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const avgWin = winningTrades > 0 ? trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0) / losingTrades : 0;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-card z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Trade History</h1>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Trades</div>
            <div className="text-2xl font-bold data-cell">{totalTrades}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total P&L</div>
            <div className={cn("text-2xl font-bold data-cell", totalPnL >= 0 ? "text-success" : "text-danger")}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Win Rate</div>
            <div className="text-2xl font-bold data-cell">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {winningTrades}W / {losingTrades}L
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Avg Win/Loss</div>
            <div className="text-lg font-bold data-cell text-success">+${avgWin.toFixed(2)}</div>
            <div className="text-lg font-bold data-cell text-danger">${avgLoss.toFixed(2)}</div>
          </Card>
        </div>

        {/* Trades Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 text-sm font-semibold">Symbol</th>
                  <th className="p-4 text-sm font-semibold">Direction</th>
                  <th className="p-4 text-sm font-semibold">Lots</th>
                  <th className="p-4 text-sm font-semibold">Entry</th>
                  <th className="p-4 text-sm font-semibold">Exit</th>
                  <th className="p-4 text-sm font-semibold">P&L</th>
                  <th className="p-4 text-sm font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, visibleCount).map((trade) => {
                  const isBuy = trade.direction === "BUY";
                  const isProfit = trade.pnl > 0;
                  const isLoss = trade.pnl < 0;
                  const isNeutral = trade.pnl === 0;
                  
                  // Separate logic for percentage values
                  const isPercentProfit = trade.pnlPercent > 0.01;
                  const isPercentLoss = trade.pnlPercent < -0.01;
                  const isPercentNeutral = Math.abs(trade.pnlPercent) <= 0.01;

                  return (
                    <tr key={trade.id} className="border-b hover:bg-accent/5">
                      <td className="p-4 font-semibold">{trade.symbol}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isBuy ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-danger" />
                          )}
                          <span className={isBuy ? "text-success" : "text-danger"}>
                            {trade.direction}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 data-cell">{trade.lots}</td>
                      <td className="p-4 data-cell">
                        {formatPrice(trade.entryPrice, trade.symbol)}
                      </td>
                      <td className="p-4 data-cell">
                        {trade.exitPrice ? formatPrice(trade.exitPrice, trade.symbol) : "-"}
                      </td>
                      <td className="p-4">
                        <div className={cn("font-bold data-cell", 
                          isProfit ? "text-success" : 
                          isLoss ? "text-danger" : 
                          "text-muted-foreground"
                        )}>
                          {isProfit ? "+" : isLoss ? "-" : ""}${Math.abs(trade.pnl).toFixed(2)}
                        </div>
                        <div className={cn("text-xs", 
                          isPercentProfit ? "text-success" : 
                          isPercentLoss ? "text-danger" : 
                          "text-muted-foreground"
                        )}>
                          {Math.abs(trade.pnlPercent) < 0.01 ? 
                            "0.00" : 
                            trade.pnlPercent.toFixed(2)
                          }%
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {trade.closeTime ? formatRelativeTime(trade.closeTime) : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {visibleCount < trades.length && (
            <div className="p-4 text-center border-t">
              <Button variant="outline" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
