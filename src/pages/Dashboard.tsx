import { useState, useEffect } from "react";
import { Menu, Moon, Sun, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForexCard } from "@/components/ForexCard";
import { AIAssistant } from "@/components/AIAssistant";
import { PositionCard } from "@/components/PositionCard";
import { QuickTradeModal } from "@/components/QuickTradeModal";
import { EmotionScoreBar } from "@/components/EmotionScoreBar";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { GhostTrades } from "@/components/GhostTrades";
import { MarketPanicIndex } from "@/components/MarketPanicIndex";
import { TradeBattleMode } from "@/components/TradeBattleMode";
import { RecommendedTrades, RecommendedTrade } from "@/components/RecommendedTrades";
import { MOCK_PAIRS, MOCK_OPEN_POSITIONS, ForexPair } from "@/lib/mockData";
import { priceSimulator } from "@/lib/priceSimulator";
import { generateTradeSuggestions, TradeSuggestion } from "@/services/claudeAPI";
import { useRiskProfile } from "@/lib/riskProfiles";
import { emotionDetector } from "@/lib/emotionDetection";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
  const [pairs, setPairs] = useState<ForexPair[]>(MOCK_PAIRS);
  const [positions, setPositions] = useState(MOCK_OPEN_POSITIONS);
  const [suggestions, setSuggestions] = useState<TradeSuggestion[]>([]);
  const [selectedPair, setSelectedPair] = useState<ForexPair | null>(null);
  const [showQuickTrade, setShowQuickTrade] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { getProfile } = useRiskProfile();
  const [currentRiskProfile, setCurrentRiskProfile] = useState(getProfile());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    priceSimulator.start(pairs, setPairs);
    return () => priceSimulator.stop();
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

    // Check every 2 seconds for risk profile changes
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
              <span className="data-cell font-semibold">$50,000.00</span>
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
          <DailyCheckIn />
          
          <MarketPanicIndex />

          {/* Disclaimer */}
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm text-warning">
            <strong>Educational Demo:</strong> This is a simulation. No real money or trading occurs. Not financial advice.
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
              <div className="text-2xl font-bold">{currentRiskProfile.name}</div>
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

          <RecommendedTrades 
            pairs={pairs}
            riskProfile={currentRiskProfile}
            onTrade={(trade) => {
              emotionDetector.recordTrade();
              const pair = pairs.find((p) => p.symbol === trade.pair);
              if (pair) handleQuickTrade(pair);
            }}
          />

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
                    onClose={() => {
                      setPositions(positions.filter((p) => p.id !== position.id));
                      toast.success(`Position ${position.id} closed`);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
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
      />
    </div>
  );
}
