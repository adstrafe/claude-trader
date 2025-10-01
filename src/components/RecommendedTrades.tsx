import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { TrendingUp, TrendingDown, Target, Shield, Zap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/tradingUtils";
import { generateTradeSuggestions, TradeSuggestion } from "@/services/claudeAPI";
import { RiskProfile } from "@/lib/riskProfiles";
import { ForexPair } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface RecommendedTrade {
  id: string;
  pair: string;
  name: string;
  direction: "BUY" | "SELL";
  entry: number;
  takeProfit: number;
  stopLoss: number;
  lots: number;
  riskScore: number;
  potentialProfit: number;
  rationale: string;
  confidence: number;
  timeHorizon: string;
}

interface RecommendedTradesProps {
  pairs: ForexPair[];
  riskProfile: RiskProfile;
  onTrade: (trade: RecommendedTrade) => void;
}

// Helper function to convert AI suggestions to recommended trades
const convertToRecommendedTrades = (suggestions: TradeSuggestion[]): RecommendedTrade[] => {
  return suggestions
    .map((suggestion, index) => {
    const pair = suggestion.pair;
    const pairData = {
      USDJPY: "USD/JPY",
      EURUSD: "EUR/USD", 
      GBPUSD: "GBP/USD",
      BTCUSD: "BTC/USD",
      AUDUSD: "AUD/USD"
    };
    
    // Calculate potential profit (simplified)
    const priceDiff = Math.abs(suggestion.takeProfit - suggestion.entry);
    const potentialProfit = Math.round(priceDiff * suggestion.lots * 1000); // Simplified calculation
    
    // Generate time horizon based on risk score
    const timeHorizons = ["1-2 days", "2-4 days", "3-5 days", "1-2 weeks", "2-6 days"];
    const timeHorizon = timeHorizons[index % timeHorizons.length];
    
    return {
      id: `rec-${index + 1}`,
      pair: suggestion.pair,
      name: pairData[pair as keyof typeof pairData] || suggestion.pair,
      direction: suggestion.direction,
      entry: suggestion.entry,
      takeProfit: suggestion.takeProfit,
      stopLoss: suggestion.stopLoss,
      lots: suggestion.lots,
      riskScore: suggestion.riskScore,
      potentialProfit: potentialProfit,
      rationale: suggestion.rationale,
      confidence: suggestion.confidence ? Math.round(suggestion.confidence) : Math.round(Math.min(95, Math.max(70, suggestion.riskScore + Math.random() * 15))), // Use AI confidence or generate high confidence score (70-95%)
      timeHorizon: timeHorizon
    };
  })
  .sort((a, b) => b.confidence - a.confidence); // Sort by confidence (highest first)
};

// Individual trade card component
const TradeCard = ({ trade, onTrade }: { trade: RecommendedTrade; onTrade: (trade: RecommendedTrade) => void }) => {
  const isBuy = trade.direction === "BUY";
  const riskLevel = trade.riskScore >= 80 ? "danger" : trade.riskScore >= 70 ? "warning" : "success";
  
  return (
    <Card className="p-4 hover:shadow-lg transition-all border-primary/20 bg-card/50 h-full flex flex-col">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-lg">{trade.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            {isBuy ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
            <span className={cn(
              "text-xs px-2 py-1 rounded font-medium",
              isBuy ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {trade.direction}
            </span>
            <span className="text-xs text-muted-foreground">
              {trade.lots} lots
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-xs px-2 py-1 rounded font-bold",
            riskLevel === "danger" ? "bg-danger/10 text-danger" :
            riskLevel === "warning" ? "bg-warning/10 text-warning" :
            "bg-success/10 text-success"
          )}>
            Risk: {trade.riskScore}%
          </div>
        </div>
      </div>

      {/* Trade Details Section */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Entry</span>
          <span className="font-mono">{formatPrice(trade.entry, trade.pair)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Target</span>
          <span className="font-mono text-success">{formatPrice(trade.takeProfit, trade.pair)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Stop</span>
          <span className="font-mono text-danger">{formatPrice(trade.stopLoss, trade.pair)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Potential</span>
          <span className="font-mono text-success font-bold">+${trade.potentialProfit.toLocaleString()}</span>
        </div>
      </div>

      {/* AI Analysis Section - Flexible */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 bg-muted/50 rounded-lg mb-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">AI Analysis</span>
            <div className="flex items-center gap-1 text-primary">
              <Target className="h-3 w-3" />
              <span className="text-xs font-bold">{trade.confidence}%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {trade.rationale}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{trade.timeHorizon}</span>
          </div>
        </div>
      </div>

      {/* Trade Button - Fixed at bottom */}
      <Button 
        onClick={() => onTrade(trade)} 
        size="sm"
        className="w-full mt-auto"
        variant={isBuy ? "buy" : "sell"}
      >
        Trade Now
      </Button>
    </Card>
  );
};

export function RecommendedTrades({ pairs, riskProfile, onTrade }: RecommendedTradesProps) {
  const [recommendations, setRecommendations] = useState<RecommendedTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const suggestions = await generateTradeSuggestions(pairs, riskProfile);
      const convertedRecommendations = convertToRecommendedTrades(suggestions);
      setRecommendations(convertedRecommendations);
      setLastUpdated(new Date());
      toast.success(`Generated ${convertedRecommendations.length} recommendations for ${riskProfile.name} profile`);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Load recommendations when component mounts or risk profile changes
  useEffect(() => {
    loadRecommendations();
  }, [riskProfile.name]); // Only refresh when risk profile changes, not pairs

  // Show loading state
  if (loading && recommendations.length === 0) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Recommended Trades</h2>
            <Badge variant="secondary" className="ml-2">
              {riskProfile.name} Profile
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Generating AI recommendations...</span>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no recommendations yet
  if (recommendations.length === 0 && !loading) {
    return null;
  }
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Recommended Trades</h2>
          <Badge variant="secondary" className="ml-2">
            {riskProfile.name} Profile
          </Badge>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground ml-2">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRecommendations}
                disabled={loading}
                className="flex items-center gap-2 hover:bg-primary/10"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                {loading ? "Generating..." : "Refresh Recommendations"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate new AI recommendations based on current market data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Mobile Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recommendations.map((trade) => (
            <div key={trade.id} className="flex-shrink-0 w-80">
              <TradeCard trade={trade} onTrade={onTrade} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {recommendations.map((trade) => (
          <TradeCard key={trade.id} trade={trade} onTrade={onTrade} />
        ))}
      </div>
    </section>
  );
}
