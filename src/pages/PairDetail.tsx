import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CandlestickChart } from "@/components/CandlestickChart";
import { TradeForm } from "@/components/TradeForm";
import { RiskGauge } from "@/components/RiskGauge";
import { ForexPair } from "@/lib/mockData";
import { formatPrice } from "@/lib/tradingUtils";
import { CandlestickData } from "lightweight-charts";
import { toast } from "sonner";
import { yourBourseAPI } from "@/services/yourBourseAPI";
import { 
  convertSymbolsToForexPairs, 
  filterPopularForexPairs 
} from "@/lib/yourBourseAdapter";
import { priceStorage, PriceData } from "@/lib/priceStorage";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];

export default function PairDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [pair, setPair] = useState<ForexPair | null>(null);
  const [timeframe, setTimeframe] = useState("15m");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [aiRiskScore, setAiRiskScore] = useState(45);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Handle theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const loadPairData = async () => {
      if (!symbol) return;
      
      try {
        setLoading(true);
        
        // Initialize IndexedDB
        await priceStorage.init();
        
        // Authenticate if not already done
        await yourBourseAPI.authenticate();
        
        // Ensure WebSocket is connected for real-time updates
        console.log('PairDetail: Ensuring WebSocket connection...');
        await yourBourseAPI.connectWebSocket();
        
        // Load symbols from YourBourse API
        const symbols = await yourBourseAPI.getSymbols();
        
        if (!Array.isArray(symbols)) {
          toast.error('Invalid symbols data format from API');
          setLoading(false);
          return;
        }
        
        const forexPairs = convertSymbolsToForexPairs(symbols);
        const foundPair = forexPairs.find((p) => p.symbol === symbol);
        
        if (!foundPair) {
          toast.error(`Pair ${symbol} not found in available symbols`);
          setLoading(false);
          return;
        }
        
        setPair(foundPair);

        // Load existing chart data from IndexedDB
        try {
          const existingCandles = await priceStorage.generateCandles(symbol, timeframe, 100);
          if (existingCandles.length > 0) {
            setChartData(existingCandles);
          } else {
            // Generate initial chart data if no stored data
            const data: CandlestickData[] = [];
            const now = Math.floor(Date.now() / 1000);
            const basePrice = foundPair.price;

            for (let i = 100; i > 0; i--) {
              const time = (now - i * 900) as any; // 15 min intervals
              const priceVariation = basePrice * 0.001; // 0.1% variation
              const open = basePrice + (Math.random() - 0.5) * priceVariation;
              const close = open + (Math.random() - 0.5) * priceVariation * 0.5;
              const high = Math.max(open, close) + Math.random() * priceVariation * 0.3;
              const low = Math.min(open, close) - Math.random() * priceVariation * 0.3;

              data.push({ time, open, high, low, close });
            }
            setChartData(data);
          }
        } catch (error) {
          console.error('Error loading chart data from IndexedDB:', error);
          // Fallback to generated data
          const data: CandlestickData[] = [];
          const now = Math.floor(Date.now() / 1000);
          const basePrice = foundPair.price;

          for (let i = 100; i > 0; i--) {
            const time = (now - i * 900) as any;
            const priceVariation = basePrice * 0.001;
            const open = basePrice + (Math.random() - 0.5) * priceVariation;
            const close = open + (Math.random() - 0.5) * priceVariation * 0.5;
            const high = Math.max(open, close) + Math.random() * priceVariation * 0.3;
            const low = Math.min(open, close) - Math.random() * priceVariation * 0.3;

            data.push({ time, open, high, low, close });
          }
          setChartData(data);
        }
        
        // Subscribe to real-time price updates for this symbol
        console.log(`PairDetail: Subscribing to ${symbol} price updates...`);
        
        // Wait a moment for WebSocket to be fully ready
        setTimeout(() => {
          yourBourseAPI.subscribeToPrices(symbol, async (data) => {
            try {
              console.log(`${symbol} PairDetail WebSocket Data Received:`, {
                ask: data.a,
                bid: data.bid,
                change: data.c,
                changePercent: data.cp,
                high24h: data.h,
                low24h: data.low
              });
              
              if (data.a && data.bid) {
                const newPrice = (data.a + data.bid) / 2;
                const change = data.c || 0;
                const changePercent = data.cp || 0;
                
                // Store price data in IndexedDB
                const priceData: PriceData = {
                  symbol: symbol,
                  timestamp: Date.now(),
                  ask: data.a,
                  bid: data.bid,
                  midPrice: newPrice,
                  change: change,
                  changePercent: changePercent,
                  high24h: data.h,
                  low24h: data.low
                };
                
                await priceStorage.storePrice(priceData);
                
                // Update pair data safely
                setPair(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    price: newPrice,
                    change: change,
                    changePercent: changePercent,
                    high24h: data.h || Math.max(prev.high24h, newPrice),
                    low24h: data.low || Math.min(prev.low24h, newPrice),
                  };
                });
                
                // Update chart data from IndexedDB
                try {
                  const updatedCandles = await priceStorage.generateCandles(symbol, timeframe, 100);
                  setChartData(updatedCandles);
                } catch (error) {
                  console.error('Error updating chart data:', error);
                }
              }
            } catch (error) {
              console.error('Error processing price update:', error);
            }
          });
        }, 1000);
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to load pair data:", error);
        toast.error("Failed to load pair data from YourBourse API");
        setLoading(false);
      }
    };

    loadPairData();

    return () => {
      // Cleanup subscription when component unmounts
      if (symbol) {
        yourBourseAPI.unsubscribeFromPrices(symbol);
      }
    };
  }, [symbol, timeframe]);

  // Handle timeframe changes
  const handleTimeframeChange = async (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    if (symbol) {
      try {
        const candles = await priceStorage.generateCandles(symbol, newTimeframe, 100);
        setChartData(candles);
      } catch (error) {
        console.error('Error loading chart data for new timeframe:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading pair data from YourBourse API...</p>
        </div>
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pair Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The pair "{symbol}" was not found in the available symbols from YourBourse API.
          </p>
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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
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
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="hover:bg-muted"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
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
                      onClick={() => handleTimeframeChange(tf)}
                    >
                      {tf}
                    </Button>
                  ))}
                </div>
              </div>
              <CandlestickChart data={chartData} height={500} isDarkMode={darkMode} />
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
