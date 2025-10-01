import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TradeForm } from "./TradeForm";
import { ForexPair } from "@/lib/mockData";
import { toast } from "sonner";

interface QuickTradeModalProps {
  pair: ForexPair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickTradeModal = ({ pair, open, onOpenChange }: QuickTradeModalProps) => {
  if (!pair) return null;

  const handleTrade = (direction: "BUY" | "SELL") => (data: any) => {
    toast.success(`${direction} order placed for ${pair.symbol}`, {
      description: `${data.lots} lots @ ${pair.price.toFixed(pair.symbol === "BTCUSD" ? 2 : 5)}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{pair.name} - Quick Trade</DialogTitle>
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
