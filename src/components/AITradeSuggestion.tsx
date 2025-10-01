import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { RiskGauge } from "./RiskGauge";
import { TradeSuggestion } from "@/services/claudeAPI";
import { formatPrice } from "@/lib/tradingUtils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AITradeSuggestionProps {
  suggestion: TradeSuggestion;
  onTrade: () => void;
}

export const AITradeSuggestion = ({ suggestion, onTrade }: AITradeSuggestionProps) => {
  const isBuy = suggestion.direction === "BUY";

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{suggestion.pair}</h4>
          <div className="flex items-center gap-2 mt-1">
            {isBuy ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
            <span className={isBuy ? "text-success" : "text-danger"}>
              {suggestion.direction}
            </span>
            <span className="text-sm text-muted-foreground">
              {suggestion.lots} lots
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Entry:</span>
          <div className="data-cell font-semibold">
            {formatPrice(suggestion.entry, suggestion.pair)}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">TP:</span>
          <div className="data-cell font-semibold text-success">
            {formatPrice(suggestion.takeProfit, suggestion.pair)}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">SL:</span>
          <div className="data-cell font-semibold text-danger">
            {formatPrice(suggestion.stopLoss, suggestion.pair)}
          </div>
        </div>
      </div>

      <RiskGauge score={suggestion.riskScore} size="sm" />

      <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>

      <Button variant={isBuy ? "buy" : "sell"} size="sm" className="w-full" onClick={onTrade}>
        Trade Now
      </Button>
    </Card>
  );
};
