import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CandlestickChart } from "@/components/CandlestickChart";
import { MOCK_OPEN_POSITIONS, Position } from "@/lib/mockData";
import { formatPrice, formatRelativeTime } from "@/lib/tradingUtils";
import { CandlestickData } from "lightweight-charts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PositionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [position, setPosition] = useState<Position | null>(null);
  const [chartData, setChartData] = useState<CandlestickData[]>([]);

  useEffect(() => {
    const foundPosition = MOCK_OPEN_POSITIONS.find((p) => p.id === id);
    setPosition(foundPosition || null);

    if (foundPosition) {
      // Generate chart data from entry to current
      const data: CandlestickData[] = [];
      const entryTime = Math.floor(foundPosition.openTime.getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);
      const intervals = 50;
      const timeStep = (now - entryTime) / intervals;

      for (let i = 0; i < intervals; i++) {
        const time = (entryTime + i * timeStep) as any;
        const progress = i / intervals;
        const price = foundPosition.entryPrice + (foundPosition.currentPrice - foundPosition.entryPrice) * progress;
        const volatility = 0.002;

        const open = price + (Math.random() - 0.5) * volatility;
        const close = open + (Math.random() - 0.5) * volatility;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;

        data.push({ time, open, high, low, close });
      }

      setChartData(data);
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page in browser history
  };

  if (!position) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Position Not Found</h2>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isBuy = position.direction === "BUY";
  const isProfit = position.pnl > 0;
  const isLoss = position.pnl < 0;
  const isNeutral = position.pnl === 0;
  
  // Separate logic for percentage values
  const isPercentProfit = position.pnlPercent > 0.01;
  const isPercentLoss = position.pnlPercent < -0.01;
  const isPercentNeutral = Math.abs(position.pnlPercent) <= 0.01;

  const handleClose = () => {
    toast.success(`Position ${position.id} closed at ${formatPrice(position.currentPrice, position.symbol)}`);
    // Navigate back would happen here
  };

  const handleModify = () => {
    toast.info("Modify TP/SL feature coming soon");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-card z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            {isBuy ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-danger" />
            )}
            <div>
              <h1 className="text-xl font-bold">{position.symbol}</h1>
              <span className="text-sm text-muted-foreground">
                {position.direction} {position.lots} lots
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart & Stats */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Position Performance</h2>
              <CandlestickChart data={chartData} height={400} />
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Entry Price</div>
                  <div className="data-cell font-semibold">
                    {formatPrice(position.entryPrice, position.symbol)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="data-cell font-semibold">
                    {formatPrice(position.currentPrice, position.symbol)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Stop Loss</div>
                  <div className="data-cell font-semibold text-danger">
                    {formatPrice(position.stopLoss, position.symbol)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Take Profit</div>
                  <div className="data-cell font-semibold text-success">
                    {formatPrice(position.takeProfit, position.symbol)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Lot Size</div>
                  <div className="data-cell font-semibold">{position.lots}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Opened</div>
                  <div className="text-sm">{formatRelativeTime(position.openTime)}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">P&L</h3>
              <div className={cn("text-3xl font-bold data-cell mb-2", 
                isProfit ? "text-success" : 
                isLoss ? "text-danger" : 
                "text-muted-foreground"
              )}>
                {isProfit ? "+" : isLoss ? "-" : ""}${Math.abs(position.pnl).toFixed(2)}
              </div>
              <div className={cn("text-lg", 
                isPercentProfit ? "text-success" : 
                isPercentLoss ? "text-danger" : 
                "text-muted-foreground"
              )}>
                {Math.abs(position.pnlPercent) < 0.01 ? 
                  "0.00" : 
                  position.pnlPercent.toFixed(2)
                }%
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Actions</h3>
              <div className="space-y-2">
                <Button variant="destructive" className="w-full" onClick={handleClose}>
                  Close Position
                </Button>
                <Button variant="outline" className="w-full" onClick={handleModify}>
                  Modify TP/SL
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Position is currently {isProfit ? "profitable" : "in loss"}.
                {isProfit
                  ? " Consider taking partial profits or adjusting stop loss to break-even."
                  : " Monitor price action and consider your risk tolerance."}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
