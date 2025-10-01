import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AIAssistant } from "@/components/AIAssistant";
import { QuickTradeModal } from "@/components/QuickTradeModal";
import { TradeBattleMode } from "@/components/TradeBattleMode";
import { RecommendedTrades } from "@/components/RecommendedTrades";
import { StatsBar } from "@/components/StatsBar";
import { MarketsSection } from "@/components/MarketsSection";
import { PositionsSection } from "@/components/PositionsSection";
import { ForexPair, Position } from "@/lib/mockData";
import { generateTradeSuggestions, TradeSuggestion } from "@/services/claudeAPI";
import { useRiskProfile } from "@/lib/riskProfiles";
import { emotionDetector } from "@/lib/emotionDetection";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { yourBourseAPI } from "@/services/yourBourseAPI";
import { 
  convertSymbolsToForexPairs, 
  filterPopularForexPairs 
} from "@/lib/yourBourseAdapter";
import { simulatedTrading } from "@/lib/simulatedTrading";

export default function Dashboard() {
  const [pairs, setPairs] = useState<ForexPair[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [suggestions, setSuggestions] = useState<TradeSuggestion[]>([]);
  const [selectedPair, setSelectedPair] = useState<ForexPair | null>(null);
  const [showQuickTrade, setShowQuickTrade] = useState(false);
  const isMobile = useIsMobile();
  const [showAI, setShowAI] = useState(!isMobile);
  const [darkMode, setDarkMode] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const { getProfile } = useRiskProfile();
  const [currentRiskProfile, setCurrentRiskProfile] = useState(getProfile());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Handle screen size changes - close AI on mobile, open on desktop
  useEffect(() => {
    if (isMobile) {
      setShowAI(false);
    } else {
      setShowAI(true);
    }
  }, [isMobile]);

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
                      toast.info(`Position closed automatically`, {
                        description: `${updatedTrade.symbol} ${updatedTrade.direction} - P/L: ${updatedTrade.pnl >= 0 ? '+' : ''}$${updatedTrade.pnl.toFixed(2)}`
                      });
                    }
                  }
                });
                
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

    return () => {
      yourBourseAPI.disconnectWebSocket();
    };
  }, []);

  // Listen for risk profile changes
  useEffect(() => {
    const checkRiskProfile = () => {
      const newProfile = getProfile();
      if (newProfile.name !== currentRiskProfile.name) {
        setCurrentRiskProfile(newProfile);
        toast.success(`Risk profile changed to ${newProfile.name} - Recommendations will refresh automatically`);
      }
    };

    const interval = setInterval(checkRiskProfile, 2000);
    return () => clearInterval(interval);
  }, [currentRiskProfile.name, getProfile]);

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
  const borderColor = emotionScore >= 70
    ? "rgb(34, 197, 94)"
    : emotionScore >= 40
    ? "rgb(234, 179, 8)"
    : "rgb(239, 68, 68)";

  useEffect(() => {
    if (emotionScore < 40) {
      toast.warning(
        "Your trading emotion score is low. Consider taking a break!",
        { duration: 5000 }
      );
    }
  }, [emotionScore]);

  return (
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden" style={{ borderTop: `3px solid ${borderColor}` }}>
      <Header 
        darkMode={darkMode} 
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        balance={accountBalance}
      />

      <div className="flex max-w-full overflow-x-hidden">
        {/* Main Content */}
        <main className={cn(
          "flex-1 p-4 lg:p-6 space-y-6 max-w-full overflow-x-hidden transition-all",
          showAI ? "lg:mr-96" : ""
        )}>
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Connecting to YourBourse API...</p>
              </div>
            </div>
          ) : (
            <>
              <StatsBar
                totalPnL={totalPnL}
                positionsCount={positions.length}
                riskProfile={currentRiskProfile}
              />

              <MarketsSection
                pairs={pairs}
                onQuickTrade={handleQuickTrade}
              />

              <RecommendedTrades
                pairs={pairs}
                riskProfile={currentRiskProfile}
                onTrade={(trade) => {
                  emotionDetector.recordTrade();
                  const pair = pairs.find((p) => p.symbol === trade.pair);
                  if (pair) handleQuickTrade(pair);
                }}
              />

              {/* AI Suggestions - Battle Mode */}
              <section>
                <TradeBattleMode
                  suggestions={suggestions}
                  onTrade={(suggestion) => {
                    const pair = pairs.find((p) => p.symbol === suggestion.pair);
                    if (pair) handleQuickTrade(pair);
                  }}
                  loading={loadingSuggestions}
                  onLoadSuggestions={loadAISuggestions}
                />
              </section>

              <PositionsSection
                positions={positions}
                onClosePosition={async (positionId) => {
                  try {
                    const closedTrade = simulatedTrading.closeTrade(positionId);
                    if (closedTrade) {
                      toast.success(`Position closed (DEMO)`, {
                        description: `P/L: ${closedTrade.pnl >= 0 ? '+' : ''}$${closedTrade.pnl.toFixed(2)}`
                      });
                      
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
            </>
          )}
        </main>

        {/* AI Sidebar - Desktop */}
        <aside className={cn(
          "hidden lg:block fixed right-0 top-0 h-screen w-96 border-l bg-card transition-transform duration-300",
          showAI ? "translate-x-0" : "translate-x-full"
        )}>
          <AIAssistant
            pairs={pairs}
            openPositions={positions.length}
            onClose={() => setShowAI(false)}
          />
        </aside>

        {/* AI Sidebar - Mobile Overlay */}
        {showAI && (
          <div
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setShowAI(false)}
          >
            <div
              className="absolute right-0 top-0 h-full w-full sm:w-96 bg-card border-l"
              onClick={(e) => e.stopPropagation()}
            >
              <AIAssistant
                pairs={pairs}
                openPositions={positions.length}
                onClose={() => setShowAI(false)}
              />
            </div>
          </div>
        )}
      </div>

      <QuickTradeModal
        pair={selectedPair}
        open={showQuickTrade}
        onOpenChange={setShowQuickTrade}
        onTrade={async (direction, data) => {
          try {
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
            
            emotionDetector.recordTrade();
            
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

      {/* Floating Action Button - Only show when AI is closed */}
      {!showAI && (
        <Button
          onClick={() => setShowAI(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 z-10"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
