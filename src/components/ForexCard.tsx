import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ForexPair } from "@/lib/mockData";
import { formatPrice } from "@/lib/tradingUtils";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ForexCardProps {
  pair: ForexPair;
  onQuickTrade?: () => void;
  onToggleFavorite?: (symbol: string) => void;
}

export const ForexCard = ({ pair, onQuickTrade, onToggleFavorite }: ForexCardProps) => {
  const isPositive = pair.changePercent >= 0;

  return (
    <Card className="p-4 hover:bg-accent/5 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link to={`/pair/${pair.symbol}`} className="hover:text-primary">
            <h3 className="font-semibold text-lg">{pair.name}</h3>
          </Link>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(pair.symbol);
              }}
              title={pair.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={cn("h-4 w-4", pair.isFavorite ? "fill-purple-500 text-purple-500" : "text-muted-foreground")} />
            </Button>
          )}
          {!onToggleFavorite && pair.isFavorite && <Star className="h-4 w-4 fill-purple-500 text-purple-500" />}
        </div>
        <div className={cn("flex items-center gap-1", isPositive ? "text-success" : "text-danger")}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {isPositive ? "+" : ""}
            {pair.changePercent.toFixed(3)}%
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="data-cell text-2xl font-bold mb-1">
          {formatPrice(pair.price, pair.symbol)}
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>H: {formatPrice(pair.high24h, pair.symbol)}</span>
          <span>L: {formatPrice(pair.low24h, pair.symbol)}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={onQuickTrade}>
        Quick Trade
      </Button>
    </Card>
  );
};
