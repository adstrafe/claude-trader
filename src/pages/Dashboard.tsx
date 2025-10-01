import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ForexCard } from "@/components/ForexCard";
import { AIAssistant } from "@/components/AIAssistant";
import { PositionCard } from "@/components/PositionCard";
import { QuickTradeModal } from "@/components/QuickTradeModal";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { MarketPanicIndex } from "@/components/MarketPanicIndex";
import { TradeBattleMode } from "@/components/TradeBattleMode";
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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    priceSimulator.start(pairs, setPairs);
    return () => priceSimulator.stop();
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
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

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
              <div className="text-2xl font-bold">{getProfile().name}</div>
            </div>
          </div>

          {/* Forex Pairs */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Markets</h2>
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
        {showAI && (
          <aside className="hidden lg:block w-96 border-l bg-card transition-all">
            <div className="sticky top-[57px] h-[calc(100vh-57px)]">
              <AIAssistant
                pairs={pairs}
                openPositions={positions.length}
                onClose={() => setShowAI(false)}
                onTradeFromAI={(trade) => {
                  const pair = pairs.find((p) => p.symbol === trade.pair);
                  if (pair) handleQuickTrade(pair);
                }}
              />
            </div>
          </aside>
        )}

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
