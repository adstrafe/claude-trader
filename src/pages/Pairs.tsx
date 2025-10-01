import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ForexCard } from "@/components/ForexCard";
import { QuickTradeModal } from "@/components/QuickTradeModal";
import { MOCK_PAIRS, ForexPair } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { applyFavoritesToPairs, toggleFavorite, getFavoritePairsFromList, getFavoritesCount } from "@/lib/favorites";
import { simulatedTrading } from "@/lib/simulatedTrading";
import { emotionDetector } from "@/lib/emotionDetection";
import { toast } from "sonner";

export default function Pairs() {
  const navigate = useNavigate();
  const [pairs, setPairs] = useState<ForexPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<ForexPair | null>(null);
  const [showQuickTrade, setShowQuickTrade] = useState(false);

  useEffect(() => {
    // Apply favorites from cookies to the pairs
    const pairsWithFavorites = applyFavoritesToPairs(MOCK_PAIRS);
    setPairs(pairsWithFavorites);
  }, []);

  const handleToggleFavorite = (symbol: string) => {
    // Update favorites in cookies
    toggleFavorite(symbol);
    
    // Update local state
    setPairs(pairs.map(pair => 
      pair.symbol === symbol 
        ? { ...pair, isFavorite: !pair.isFavorite }
        : pair
    ));
  };

  const handleQuickTrade = (pair: ForexPair) => {
    setSelectedPair(pair);
    setShowQuickTrade(true);
  };

  const favoritePairs = getFavoritePairsFromList(pairs);
  const nonFavoritePairs = pairs.filter(pair => !pair.isFavorite);
  const favoritesCount = getFavoritesCount();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-card z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">All Pairs</h1>
          </div>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Pairs</div>
            <div className="text-2xl font-bold data-cell">{pairs.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Favorites</div>
            <div className="text-2xl font-bold data-cell">{favoritesCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Active Markets</div>
            <div className="text-2xl font-bold data-cell">{pairs.length}</div>
          </Card>
        </div>

        {/* Favorite Pairs */}
        {favoritePairs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Favorite Pairs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {favoritePairs.map((pair) => (
                <ForexCard
                  key={pair.symbol}
                  pair={pair}
                  onQuickTrade={() => handleQuickTrade(pair)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        {/* Other Pairs */}
        {nonFavoritePairs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Other Pairs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {nonFavoritePairs.map((pair) => (
                <ForexCard
                  key={pair.symbol}
                  pair={pair}
                  onQuickTrade={() => handleQuickTrade(pair)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </section>
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
            
            // Close the modal after successful trade
            setShowQuickTrade(false);
            
            // Navigate back to dashboard to see the new position
            setTimeout(() => {
              navigate('/');
            }, 1500);
          } catch (error) {
            toast.error(`Failed to place order: ${error}`);
          }
        }}
      />
    </div>
  );
}
