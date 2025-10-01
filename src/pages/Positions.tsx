import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PositionCard } from "@/components/PositionCard";
import { MOCK_OPEN_POSITIONS } from "@/lib/mockData";
import { toast } from "sonner";

export default function Positions() {
  const [positions, setPositions] = useState(MOCK_OPEN_POSITIONS);

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalExposure = positions.reduce((sum, pos) => sum + pos.lots * pos.entryPrice, 0);

  const handleClosePosition = (positionId: string) => {
    setPositions(positions.filter((p) => p.id !== positionId));
    toast.success(`Position ${positionId} closed`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-card z-10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">All Positions</h1>
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total P&L</div>
            <div className={`text-2xl font-bold data-cell ${totalPnL >= 0 ? "text-success" : "text-danger"}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Open Positions</div>
            <div className="text-2xl font-bold data-cell">{positions.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Exposure</div>
            <div className="text-2xl font-bold data-cell">${totalExposure.toFixed(2)}</div>
          </Card>
        </div>

        {/* Positions Grid */}
        {positions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No open positions</p>
            <Link to="/">
              <Button>Go to Dashboard</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((position) => (
              <PositionCard
                key={position.id}
                position={position}
                onClose={() => handleClosePosition(position.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
