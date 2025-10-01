import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TradeForm } from "./TradeForm";
import { ForexPair } from "@/lib/mockData";

interface QuickTradeModalProps {
  pair: ForexPair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrade?: (direction: "BUY" | "SELL", data: any) => void | Promise<void>;
}

export const QuickTradeModal = ({ pair, open, onOpenChange, onTrade }: QuickTradeModalProps) => {
  if (!pair) return null;

  const handleTrade = (direction: "BUY" | "SELL") => async (data: any) => {
    if (onTrade) {
      await onTrade(direction, data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{pair.name} - Quick Trade</DialogTitle>
          <DialogDescription>
            Place a buy or sell order for {pair.name}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="buy">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="mt-4">
            <TradeForm
              symbol={pair.symbol}
              currentPrice={pair.price}
              direction="BUY"
              onSubmit={handleTrade("BUY")}
            />
          </TabsContent>
          <TabsContent value="sell" className="mt-4">
            <TradeForm
              symbol={pair.symbol}
              currentPrice={pair.price}
              direction="SELL"
              onSubmit={handleTrade("SELL")}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
