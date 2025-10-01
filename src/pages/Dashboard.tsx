import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { AIAssistant } from "@/components/AIAssistant";
import { QuickTradeModal } from "@/components/QuickTradeModal";
import { DailyCheckIn } from "@/components/DailyCheckIn";
import { TradeBattleMode } from "@/components/TradeBattleMode";
import { RecommendedTrades } from "@/components/RecommendedTrades";
import { StatsBar } from "@/components/StatsBar";
import { MarketsSection } from "@/components/MarketsSection";
import { PositionsSection } from "@/components/PositionsSection";
import { MOCK_PAIRS, MOCK_OPEN_POSITIONS, ForexPair } from "@/lib/mockData";
import { priceSimulator } from "@/lib/priceSimulator";
import { generateTradeSuggestions, TradeSuggestion } from "@/services/claudeAPI";
import { useRiskProfile } from "@/lib/riskProfiles";
import { emotionDetector } from "@/lib/emotionDetection";
import { cn } from "@/lib/utils";
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
    <div className="min-h-screen bg-background max-w-full overflow-x-hidden" style={{ borderTop: `3px solid ${borderColor}` }}>
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

      <div className="flex max-w-full overflow-x-hidden">
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-full overflow-x-hidden">
          <DailyCheckIn />

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

          <PositionsSection
            positions={positions}
            onClosePosition={(positionId) => {
              setPositions(positions.filter((p) => p.id !== positionId));
              toast.success(`Position ${positionId} closed`);
            }}
          />
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
