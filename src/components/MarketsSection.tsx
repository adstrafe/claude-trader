import { ForexCard } from "./ForexCard";
import { MarketPanicIndex } from "./MarketPanicIndex";
import { ForexPair } from "@/lib/mockData";
import { TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { getDashboardPairs, toggleFavorite } from "@/lib/favorites";

interface MarketsSectionProps {
  pairs: ForexPair[];
  onQuickTrade: (pair: ForexPair) => void;
  onToggleFavorite?: (symbol: string) => void;
}

export function MarketsSection({ pairs, onQuickTrade, onToggleFavorite }: MarketsSectionProps) {
  // Get exactly 4 pairs for dashboard (favorites + defaults)
  const displayPairs = getDashboardPairs(pairs);

  return (
    <section className="@container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Markets</h2>
        </div>
        <Link to="/pairs">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>
      
      <div className="mb-4">
        <MarketPanicIndex />
      </div>
      
      <div className="grid grid-cols-1 @lg:grid-cols-2 @4xl:grid-cols-4 gap-4">
        {displayPairs.map((pair) => (
          <ForexCard
            key={pair.symbol}
            pair={pair}
            onQuickTrade={() => onQuickTrade(pair)}
            onToggleFavorite={onToggleFavorite || toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
