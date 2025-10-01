import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { PositionCard } from "./PositionCard";
import { Position } from "@/lib/mockData";

interface PositionsSectionProps {
  positions: Position[];
  onClosePosition: (positionId: string) => void;
}

export function PositionsSection({ positions, onClosePosition }: PositionsSectionProps) {
  return (
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
              onClose={() => onClosePosition(position.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
