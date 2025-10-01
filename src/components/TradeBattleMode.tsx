import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradeSuggestion } from "@/services/claudeAPI";
import { RiskGauge } from "./RiskGauge";

interface TradeBattleModeProps {
  suggestions: TradeSuggestion[];
  onTrade: (suggestion: TradeSuggestion) => void;
  onLoadSuggestions: () => void;
  loading: boolean;
}

interface BattleStats {
  userWins: number;
  aiWins: number;
  userWinRate: number;
  aiWinRate: number;
}

export function TradeBattleMode({ 
  suggestions, 
  onTrade, 
  onLoadSuggestions,
  loading 
}: TradeBattleModeProps) {
  const [stats] = useState<BattleStats>({
    userWins: 12,
    aiWins: 18,
    userWinRate: 45,
    aiWinRate: 67
  });

  if (suggestions.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <Swords className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">Trade Battle Mode</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Challenge the AI! Generate suggestions and see how your analysis compares.
        </p>
        <Button onClick={onLoadSuggestions} disabled={loading}>
          {loading ? "Loading Battle..." : "Start Battle"}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Battle Stats Header */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Swords className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold">Trade Battle Arena</h3>
              <p className="text-xs text-muted-foreground">Who has the edge?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">You</div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="font-bold">{stats.userWinRate}%</span>
              </div>
              <div className="text-xs text-muted-foreground">{stats.userWins} wins</div>
            </div>
            
            <div className="h-12 w-px bg-border" />
            
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">AI</div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-bold">{stats.aiWinRate}%</span>
              </div>
              <div className="text-xs text-muted-foreground">{stats.aiWins} wins</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Battle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, idx) => (
          <Card key={idx} className="p-4 hover:shadow-lg transition-all border-primary/20 bg-card/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-lg">{suggestion.pair}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded font-medium",
                    suggestion.direction === 'BUY' 
                      ? "bg-success/10 text-success" 
                      : "bg-danger/10 text-danger"
                  )}>
                    {suggestion.direction}
                  </span>
                </div>
              </div>
              <RiskGauge score={suggestion.riskScore} size="sm" />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Entry</span>
                <span className="font-mono">{suggestion.entry}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Target</span>
                <span className="font-mono text-success">{suggestion.takeProfit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Stop</span>
                <span className="font-mono text-danger">{suggestion.stopLoss}</span>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">AI Analysis</span>
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-bold">67%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {suggestion.rationale}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => onTrade(suggestion)} 
                size="sm"
                className="flex-1"
                variant={suggestion.direction === 'BUY' ? 'default' : 'destructive'}
              >
                Challenge AI
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={onLoadSuggestions}
          disabled={loading}
        >
          {loading ? "Loading..." : "New Battle Round"}
        </Button>
      </div>
    </div>
  );
}
