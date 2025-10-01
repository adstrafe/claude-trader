import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CandlestickChart } from "@/components/CandlestickChart";
import { TradeForm } from "@/components/TradeForm";
import { RiskGauge } from "@/components/RiskGauge";
import { MOCK_PAIRS, ForexPair } from "@/lib/mockData";
import { formatPrice } from "@/lib/tradingUtils";
import { CandlestickData } from "lightweight-charts";
import { toast } from "sonner";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];

export default function PairDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [pair, setPair] = useState<ForexPair | null>(null);
  const [timeframe, setTimeframe] = useState("15m");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [aiRiskScore, setAiRiskScore] = useState(45);

  useEffect(() => {
    const foundPair = MOCK_PAIRS.find((p) => p.symbol === symbol);
    setPair(foundPair || null);

    // Generate mock candlestick data
    if (foundPair) {
      const data: CandlestickData[] = [];
      const now = Math.floor(Date.now() / 1000);
      const basePrice = foundPair.price;

      for (let i = 100; i > 0; i--) {
        const time = (now - i * 900) as any; // 15 min intervals
        const open = basePrice + (Math.random() - 0.5) * 0.5;
        const close = open + (Math.random() - 0.5) * 0.3;
        const high = Math.max(open, close) + Math.random() * 0.2;
        const low = Math.min(open, close) - Math.random() * 0.2;

        data.push({ time, open, high, low, close });
      }

      setChartData(data);
    }
  }, [symbol]);

  if (!pair) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pair Not Found</h2>
          <Link to="/">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleTrade = (data: any) => {
    toast.success(`${direction} order placed for ${pair.symbol}`, {
      description: `${data.lots} lots @ ${formatPrice(pair.price, pair.symbol)}`,
    });
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
          <div>
            <h1 className="text-xl font-bold">{pair.name}</h1>
            <div className="text-sm text-muted-foreground">
              {formatPrice(pair.price, pair.symbol)}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Chart</h2>
                <div className="flex gap-1">
                  {TIMEFRAMES.map((tf) => (
                    <Button
                      key={tf}
                      variant={timeframe === tf ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
              <CandlestickChart data={chartData} height={500} />
            </Card>

            {/* AI Analysis */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">AI Analysis</h3>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <RiskGauge score={aiRiskScore} />
              <p className="mt-4 text-sm text-muted-foreground">
                Based on current market conditions, {pair.symbol} shows moderate volatility.
                Recent price action suggests potential {pair.changePercent > 0 ? "upward" : "downward"} momentum.
                Consider your risk tolerance before trading.
              </p>
            </Card>
          </div>

          {/* Trade Panel */}
          <div>
            <Card className="p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Trade Panel</h2>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={direction === "BUY" ? "buy" : "outline"}
                  className="flex-1"
                  onClick={() => setDirection("BUY")}
                >
                  BUY
                </Button>
                <Button
                  variant={direction === "SELL" ? "sell" : "outline"}
                  className="flex-1"
                  onClick={() => setDirection("SELL")}
                >
                  SELL
                </Button>
              </div>
              <TradeForm
                symbol={pair.symbol}
                currentPrice={pair.price}
                direction={direction}
                onSubmit={handleTrade}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
