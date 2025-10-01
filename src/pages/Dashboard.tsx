import { useState, useEffect } from "react";
import { Menu, Moon, Sun, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForexCard } from "@/components/ForexCard";
import { AIAssistant } from "@/components/AIAssistant";
import { PositionCard } from "@/components/PositionCard";
import { QuickTradeModal } from "@/components/QuickTradeModal";
import { EmotionScoreBar } from "@/components/EmotionScoreBar";
import { GhostTrades } from "@/components/GhostTrades";
import { MarketPanicIndex } from "@/components/MarketPanicIndex";
import { TradeBattleMode } from "@/components/TradeBattleMode";
import { ForexPair, Position } from "@/lib/mockData";
import { generateTradeSuggestions, TradeSuggestion } from "@/services/claudeAPI";
import { useRiskProfile } from "@/lib/riskProfiles";
import { emotionDetector } from "@/lib/emotionDetection";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { yourBourseAPI } from "@/services/yourBourseAPI";
import { 
  convertSymbolsToForexPairs, 
  convertYBPositionsToPositions,
  filterPopularForexPairs 
} from "@/lib/yourBourseAdapter";
import { simulatedTrading } from "@/lib/simulatedTrading";

export default function Dashboard() {
  const [pairs, setPairs] = useState<ForexPair[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [suggestions, setSuggestions] = useState<TradeSuggestion[]>([]);
  const [selectedPair, setSelectedPair] = useState<ForexPair | null>(null);
  const [showQuickTrade, setShowQuickTrade] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const { getProfile } = useRiskProfile();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Initialize API connection and load data
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        setLoading(true);
        
        // Authenticate
        await yourBourseAPI.authenticate();
        toast.success("Connected to YourBourse API");

        // Load symbols
        const symbols = await yourBourseAPI.getSymbols();
        
        if (!Array.isArray(symbols)) {
          toast.error('Invalid symbols data format from API');
          setLoading(false);
          return;
        }
        
        const forexPairs = convertSymbolsToForexPairs(symbols);
        const popularPairs = filterPopularForexPairs(forexPairs);
        
        // Set initial pairs (will update via WebSocket)
        setPairs(popularPairs);

        // Use simulated balance for demo
        setAccountBalance(simulatedTrading.getEquity());

        // Load simulated positions
        const simulatedPositions = simulatedTrading.getOpenTrades().map(t => 
          simulatedTrading.toPosition(t)
        );
        setPositions(simulatedPositions);

        // Connect WebSocket for real-time updates
        await yourBourseAPI.connectWebSocket();

        // Subscribe to price updates for each symbol
        popularPairs.forEach(pair => {
          yourBourseAPI.subscribeToPrices(pair.symbol, (data) => {
            setPairs(prev => prev.map(p => {
              // WebSocket data may use 's' or match by symbol name
              const symbolMatch = data.s === p.symbol || data.n === p.symbol;
              if (symbolMatch && data.a && data.bid) {
                const newPrice = (data.a + data.bid) / 2;
                const change = newPrice - p.price;
                const changePercent = p.price !== 0 ? (change / p.price) * 100 : 0;
                
                // Update simulated trades with new prices
                const openTrades = simulatedTrading.getOpenTrades();
                let tradesUpdated = false;
                openTrades.forEach(trade => {
                  if (trade.symbol === p.symbol) {
                    const updatedTrade = simulatedTrading.updateTradePrice(trade.id, newPrice);
                    tradesUpdated = true;
                    if (updatedTrade && updatedTrade.status === 'CLOSED') {
                      // Trade hit TP or SL
                      toast.info(`Position closed automatically`, {
                        description: `${updatedTrade.symbol} ${updatedTrade.direction} - P/L: ${updatedTrade.pnl >= 0 ? '+' : ''}$${updatedTrade.pnl.toFixed(2)}`
                      });
                    }
                  }
                });
                
                // Update positions display if any trades changed
                if (tradesUpdated) {
                  setPositions(simulatedTrading.getOpenTrades().map(t => 
                    simulatedTrading.toPosition(t)
                  ));
                  setAccountBalance(simulatedTrading.getEquity());
                }
                
                return {
                  ...p,
                  price: newPrice,
                  change: change,
                  changePercent: changePercent,
                  high24h: Math.max(p.high24h, newPrice),
                  low24h: Math.min(p.low24h, newPrice),
                };
              }
              return p;
            }));
          });
        });

        setLoading(false);
      } catch (error) {
        console.error("Failed to initialize API:", error);
        toast.error("Failed to connect to YourBourse API");
        setLoading(false);
      }
    };

    initializeAPI();

    // Cleanup
    return () => {
      yourBourseAPI.disconnectWebSocket();
    };
  }, []);

  const loadAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const profile = getProfile();
      const results = await generateTradeSuggestions(pairs, profile);
      setSuggestions(results);
      toast.success("AI suggestions generated");
    } catch (error) {
      toast.error("Failed to generate suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleQuickTrade = (pair: ForexPair) => {
    setSelectedPair(pair);
    setShowQuickTrade(true);
  };

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const emotionScore = emotionDetector.getScore();
  const borderColor = emotionDetector.getBorderColor();

  useEffect(() => {
    if (emotionDetector.shouldShowWarning()) {
      toast.warning('High Risk Pattern Detected', {
        description: emotionDetector.getWarningMessage(),
        duration: 7000
      });
    }
  }, [emotionScore]);

  return (
    <div className="min-h-screen bg-background" style={{ borderTop: `3px solid ${borderColor}` }}>
      {/* Top Bar */}
      <header className="border-b sticky top-0 bg-card z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">AI Trading Platform</h1>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Balance:</span>
              <span className="data-cell font-semibold">
                ${accountBalance.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EmotionScoreBar />
            <Link to="/history">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                History
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Connecting to YourBourse API...</p>
              </div>
            </div>
          ) : (
            <>
              <MarketPanicIndex />

              {/* Disclaimer */}
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm text-primary">
                <strong>Demo Mode:</strong> Using real-time YourBourse price data with simulated trading. No real money at risk.
              </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Total P&L</div>
              <div className={cn("text-2xl font-bold data-cell", totalPnL >= 0 ? "text-success" : "text-danger")}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Open Positions</div>
              <div className="text-2xl font-bold data-cell">{positions.length}</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm text-muted-foreground">Risk Profile</div>
              <div className="text-2xl font-bold">{getProfile().name}</div>
            </div>
          </div>

          {/* Forex Pairs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Markets</h2>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowAI(!showAI)}
              >
                <Menu className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pairs.map((pair) => (
                <ForexCard
                  key={pair.symbol}
                  pair={pair}
                  onQuickTrade={() => handleQuickTrade(pair)}
                />
              ))}
            </div>
          </section>

          <GhostTrades />

          {/* AI Suggestions - Battle Mode */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trade Battle Arena</h2>
            </div>
            <TradeBattleMode
              suggestions={suggestions}
              onTrade={(suggestion) => {
                emotionDetector.recordTrade();
                const pair = pairs.find((p) => p.symbol === suggestion.pair);
                if (pair) handleQuickTrade(pair);
              }}
              onLoadSuggestions={loadAISuggestions}
              loading={loadingSuggestions}
            />
          </section>

          {/* Open Positions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Open Positions</h2>
              <Link to="/positions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {positions.length === 0 ? (
              <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
                No open positions
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {positions.slice(0, 3).map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    onClose={async () => {
                      try {
                        // Close simulated trade
                        const closedTrade = simulatedTrading.closeTrade(position.id);
                        if (closedTrade) {
                          toast.success(`Position closed (DEMO)`, {
                            description: `P/L: ${closedTrade.pnl >= 0 ? '+' : ''}$${closedTrade.pnl.toFixed(2)}`
                          });
                          
                          // Reload positions
                          const simulatedPositions = simulatedTrading.getOpenTrades().map(t => 
                            simulatedTrading.toPosition(t)
                          );
                          setPositions(simulatedPositions);
                          setAccountBalance(simulatedTrading.getEquity());
                        }
                      } catch (error) {
                        toast.error(`Failed to close position: ${error}`);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </section>
            </>
          )}
        </main>

        {/* AI Sidebar - Desktop */}
        <aside className={cn(
          "hidden lg:block w-96 border-l bg-card transition-all",
          showAI && "block"
        )}>
          <div className="sticky top-[57px] h-[calc(100vh-57px)]">
            <AIAssistant
              pairs={pairs}
              openPositions={positions.length}
              onTradeFromAI={(trade) => {
                const pair = pairs.find((p) => p.symbol === trade.pair);
                if (pair) handleQuickTrade(pair);
              }}
            />
          </div>
        </aside>

        {/* AI Mobile Modal */}
        {showAI && (
          <div className="lg:hidden fixed inset-0 bg-background z-50">
            <AIAssistant
              pairs={pairs}
              openPositions={positions.length}
              onClose={() => setShowAI(false)}
              onTradeFromAI={(trade) => {
                const pair = pairs.find((p) => p.symbol === trade.pair);
                if (pair) {
                  setShowAI(false);
                  handleQuickTrade(pair);
                }
              }}
            />
          </div>
        )}
      </div>

      <QuickTradeModal
        pair={selectedPair}
        open={showQuickTrade}
        onOpenChange={setShowQuickTrade}
        onTrade={async (direction, data) => {
          try {
            // Create simulated trade instead of real order
            const trade = simulatedTrading.openTrade({
              symbol: selectedPair!.symbol,
              direction: direction,
              lots: data.lots,
              entryPrice: selectedPair!.price,
              stopLoss: data.stopLoss,
              takeProfit: data.takeProfit,
            });
            
            toast.success(`${direction} order placed for ${selectedPair!.symbol} (DEMO)`, {
              description: `${data.lots} lots @ ${selectedPair!.price.toFixed(5)}`
            });
            
            // Track emotional behavior
            emotionDetector.recordTrade();
            
            // Reload positions
            const simulatedPositions = simulatedTrading.getOpenTrades().map(t => 
              simulatedTrading.toPosition(t)
            );
            setPositions(simulatedPositions);
            setAccountBalance(simulatedTrading.getEquity());
          } catch (error) {
            toast.error(`Failed to place order: ${error}`);
          }
        }}
      />
    </div>
  );
}
