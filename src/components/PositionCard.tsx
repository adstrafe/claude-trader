import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Position } from "@/lib/mockData";
import { formatPrice, formatRelativeTime } from "@/lib/tradingUtils";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PositionCardProps {
  position: Position;
  onClose?: () => void;
}

export const PositionCard = ({ position, onClose }: PositionCardProps) => {
  const isBuy = position.direction === "BUY";
  const isProfit = position.pnl >= 0;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isBuy ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-danger" />
          )}
          <div>
            <h4 className="font-semibold">{position.symbol}</h4>
            <span className="text-sm text-muted-foreground">
              {position.direction} {position.lots} lots
            </span>
          </div>
        </div>
        <div className={cn("text-right", isProfit ? "text-success" : "text-danger")}>
          <div className="data-cell font-bold">
            {isProfit ? "+" : ""}${position.pnl.toFixed(2)}
          </div>
          <div className="text-sm">
            {isProfit ? "+" : ""}
            {position.pnlPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-muted-foreground">Entry:</span>
          <div className="data-cell font-semibold">
            {formatPrice(position.entryPrice, position.symbol)}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Current:</span>
          <div className="data-cell font-semibold">
            {formatPrice(position.currentPrice, position.symbol)}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">TP:</span>
          <div className="data-cell font-semibold text-success">
            {formatPrice(position.takeProfit, position.symbol)}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">SL:</span>
          <div className="data-cell font-semibold text-danger">
            {formatPrice(position.stopLoss, position.symbol)}
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-3">
        Opened {formatRelativeTime(position.openTime)}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/position/${position.id}`}>
            <ExternalLink className="h-3 w-3" />
            Detail
          </Link>
        </Button>
        {onClose && (
          <Button variant="destructive" size="sm" className="flex-1" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </Card>
  );
};
