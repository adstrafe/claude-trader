import { cn } from "@/lib/utils";
import { RiskProfile } from "@/lib/riskProfiles";

interface StatsBarProps {
  totalPnL: number;
  positionsCount: number;
  riskProfile: RiskProfile;
}

export function StatsBar({ totalPnL, positionsCount, riskProfile }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground">Total P&L</div>
        <div className={cn("text-2xl font-bold data-cell", totalPnL >= 0 ? "text-success" : "text-danger")}>
          {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground">Open Positions</div>
        <div className="text-2xl font-bold data-cell">{positionsCount}</div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <div className="text-sm text-muted-foreground">Risk Profile</div>
        <div className="text-2xl font-bold">{riskProfile.name}</div>
      </div>
    </div>
  );
}
