import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MarketPanicIndex() {
  const [panicLevel, setPanicLevel] = useState(45);

  useEffect(() => {
    // Simulate panic level changes
    const interval = setInterval(() => {
      setPanicLevel(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    if (panicLevel > 80) return 'from-danger to-warning';
    if (panicLevel > 60) return 'from-warning to-warning';
    if (panicLevel > 40) return 'from-accent to-primary';
    return 'from-success to-accent';
  };

  const getMessage = () => {
    if (panicLevel > 80) return 'Extreme panic = Major opportunity';
    if (panicLevel > 60) return 'High panic = Potential opportunity';
    if (panicLevel > 40) return 'Moderate market sentiment';
    return 'Calm market conditions';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-4 py-3 bg-card/50 rounded-lg border cursor-pointer hover:bg-card transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  panicLevel > 80 && "text-danger animate-pulse"
                )} />
                <span className="text-sm font-medium">Market Panic Level</span>
              </div>
              <span className={cn(
                "text-sm font-bold tabular-nums",
                panicLevel > 70 ? "text-danger" : 
                panicLevel > 50 ? "text-warning" : "text-success"
              )}>
                {Math.round(panicLevel)}%
              </span>
            </div>
            
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r transition-all duration-1000 rounded-full",
                  getColor(),
                  panicLevel > 80 && "animate-pulse"
                )}
                style={{ width: `${panicLevel}%` }}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
