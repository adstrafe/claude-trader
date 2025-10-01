import { ForexCard } from "./ForexCard";
import { MarketPanicIndex } from "./MarketPanicIndex";
import { ForexPair } from "@/lib/mockData";

interface MarketsSectionProps {
  pairs: ForexPair[];
  onQuickTrade: (pair: ForexPair) => void;
}

export function MarketsSection({ pairs, onQuickTrade }: MarketsSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Markets</h2>
      </div>
      
      <div className="mb-4">
        <MarketPanicIndex />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pairs.map((pair) => (
          <ForexCard
            key={pair.symbol}
            pair={pair}
            onQuickTrade={() => onQuickTrade(pair)}
          />
        ))}
      </div>
    </section>
  );
}
