import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { calculateAutoTPSL, formatPrice } from "@/lib/tradingUtils";
import { useRiskProfile } from "@/lib/riskProfiles";
import { toast } from "sonner";
import { AlertTriangle, Settings } from "lucide-react";

interface TradeFormData {
  lots: number;
  stopLoss: number;
  takeProfit: number;
}

interface TradeFormProps {
  symbol: string;
  currentPrice: number;
  direction: "BUY" | "SELL";
  onSubmit: (data: TradeFormData) => void;
}

export const TradeForm = ({ symbol, currentPrice, direction, onSubmit }: TradeFormProps) => {
  const { getProfile } = useRiskProfile();
  const profile = getProfile();
  const [autoTPSL, setAutoTPSL] = useState(true);

  const { register, handleSubmit, watch, setValue } = useForm<TradeFormData>({
    defaultValues: {
      lots: 0.5,
      ...calculateAutoTPSL(currentPrice, direction, symbol),
    },
  });

  const lots = watch("lots");
  const stopLoss = watch("stopLoss");
  const takeProfit = watch("takeProfit");

  // Update TP/SL values when current price changes (for real-time updates)
  useEffect(() => {
    if (autoTPSL) {
      const auto = calculateAutoTPSL(currentPrice, direction, symbol);
      setValue("stopLoss", auto.stopLoss);
      setValue("takeProfit", auto.takeProfit);
    }
  }, [currentPrice, direction, symbol, autoTPSL, setValue]);

  // Simple risk calculation for demo
  const riskScore = Math.min(100, (lots / profile.maxLots) * 100);

  const handleFormSubmit = (data: TradeFormData) => {
    if (data.lots > profile.maxLots) {
      toast.error(`Maximum lot size is ${profile.maxLots} for ${profile.name} profile`);
      return;
    }

    if (riskScore > profile.blockThreshold) {
      toast.error(`Risk score ${riskScore.toFixed(0)} exceeds limit ${profile.blockThreshold}`);
      return;
    }

    if (riskScore > profile.warnThreshold) {
      toast.warning(`High risk trade: ${riskScore.toFixed(0)}/100`);
    }

    // Validate TP/SL direction
    if (direction === "BUY") {
      if (data.takeProfit <= currentPrice) {
        toast.error("Take Profit must be above entry price for BUY");
        return;
      }
      if (data.stopLoss >= currentPrice) {
        toast.error("Stop Loss must be below entry price for BUY");
        return;
      }
    } else {
      if (data.takeProfit >= currentPrice) {
        toast.error("Take Profit must be below entry price for SELL");
        return;
      }
      if (data.stopLoss <= currentPrice) {
        toast.error("Stop Loss must be above entry price for SELL");
        return;
      }
    }

    onSubmit(data);
  };

  const handleAutoTPSL = () => {
    const auto = calculateAutoTPSL(currentPrice, direction, symbol);
    setValue("stopLoss", auto.stopLoss);
    setValue("takeProfit", auto.takeProfit);
    setAutoTPSL(true);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Direction</Label>
        <div className="text-2xl font-bold data-cell">
          {direction} @ {formatPrice(currentPrice, symbol)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lots">Lot Size</Label>
        <Input
          id="lots"
          type="number"
          step="0.01"
          min="0.01"
          max={profile.maxLots}
          {...register("lots", { valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Max: {profile.maxLots} lots ({profile.name} profile)
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>TP/SL Settings</Label>
          <Button type="button" variant="ghost" size="sm" onClick={handleAutoTPSL}>
            Auto 1:2 RR
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="stopLoss" className="text-xs">
              Stop Loss
            </Label>
            <Input
              id="stopLoss"
              type="number"
              step={symbol === "BTCUSD" ? "0.01" : symbol.includes("JPY") ? "0.001" : "0.00001"}
              {...register("stopLoss", { valueAsNumber: true })}
              onChange={() => setAutoTPSL(false)}
            />
          </div>
          <div>
            <Label htmlFor="takeProfit" className="text-xs">
              Take Profit
            </Label>
            <Input
              id="takeProfit"
              type="number"
              step={symbol === "BTCUSD" ? "0.01" : symbol.includes("JPY") ? "0.001" : "0.00001"}
              {...register("takeProfit", { valueAsNumber: true })}
              onChange={() => setAutoTPSL(false)}
            />
          </div>
        </div>
        </div>

        {/* Risk Warning Alert */}
        {riskScore > profile.warnThreshold && (
          <Alert className={riskScore > profile.blockThreshold ? "border-danger" : "border-warning"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {riskScore > profile.blockThreshold ? (
                <>
                  <strong>Trade blocked:</strong> Risk score {riskScore.toFixed(0)}/100 exceeds your limit of {profile.blockThreshold}. 
                  You can increase your risk tolerance in{" "}
                  <Link to="/settings#risk" className="text-purple-500 hover:underline inline-flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Settings
                  </Link>
                  .
                </>
              ) : (
                <>
                  <strong>High risk warning:</strong> Risk score {riskScore.toFixed(0)}/100 is above your warning threshold of {profile.warnThreshold}. 
                  Consider reducing lot size or adjust your risk profile in{" "}
                  <Link to="/settings#risk" className="text-purple-500 hover:underline inline-flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Settings
                  </Link>
                  .
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg bg-muted p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Risk Score</span>
          <span
            className={
              riskScore > profile.blockThreshold
                ? "text-danger font-semibold"
                : riskScore > profile.warnThreshold
                ? "text-warning font-semibold"
                : "text-success"
            }
          >
            {riskScore.toFixed(0)}/100
          </span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className={
              riskScore > profile.blockThreshold
                ? "bg-danger h-full"
                : riskScore > profile.warnThreshold
                ? "bg-warning h-full"
                : "bg-success h-full"
            }
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant={direction === "BUY" ? "buy" : "sell"}
        size="lg"
        className="w-full"
        disabled={riskScore > profile.blockThreshold}
      >
        {direction === "BUY" ? "Place Buy Order" : "Place Sell Order"}
      </Button>
    </form>
  );
};
