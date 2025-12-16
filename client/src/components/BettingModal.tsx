import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Market, userBalance } from "@/lib/mockData";
import { useState, useEffect } from "react";
import { Zap, AlertCircle } from "lucide-react";

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: Market;
  side: 'A' | 'B' | null;
}

export function BettingModal({ isOpen, onClose, market, side }: BettingModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState([0]);

  const fighter = side === 'A' ? market.fighterA : market.fighterB;
  const odds = side === 'A' ? market.oddsA : market.oddsB;
  const potentialReturn = amount * odds;
  const maxBet = userBalance.vtho;

  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setSliderValue([0]);
    }
  }, [isOpen]);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setAmount(Math.floor((value[0] / 100) * maxBet));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setAmount(val);
      setSliderValue([(val / maxBet) * 100]);
    } else {
      setAmount(0);
    }
  };

  const handleQuickBet = (percent: number) => {
    const val = (percent / 100) * maxBet;
    setAmount(Math.floor(val));
    setSliderValue([percent]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-wider flex items-center gap-2">
            Bet on {fighter?.name}
            {side === 'A' ? 
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red]" /> : 
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_blue]" />
            }
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Current Odds: <span className="text-white font-bold">{odds}x</span> • Event: {market.event}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Stake Amount (VTHO)</label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <Input 
                type="number" 
                value={amount} 
                onChange={handleInputChange}
                className="pl-9 bg-black/20 border-white/10 text-xl font-mono focus-visible:ring-secondary"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>Balance: {userBalance.vtho.toLocaleString()} VTHO</span>
              <span className="text-secondary cursor-pointer hover:underline" onClick={() => handleQuickBet(100)}>Max</span>
            </div>
          </div>

          <div className="space-y-4">
            <Slider 
              value={sliderValue} 
              onValueChange={handleSliderChange} 
              max={100} 
              step={1}
              className="py-2"
            />
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 75].map((pct) => (
                <Button 
                  key={pct} 
                  variant="outline" 
                  size="sm" 
                  className="text-xs font-mono border-white/10 hover:bg-white/5 hover:text-white"
                  onClick={() => handleQuickBet(pct)}
                >
                  {pct}%
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Est. Returns</span>
              <span className="font-mono font-bold text-green-400 text-lg">
                {potentialReturn.toLocaleString(undefined, { maximumFractionDigits: 2 })} VTHO
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Fee (1%)</span>
              <span>{(amount * 0.01).toFixed(2)} VTHO</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button className="w-full bg-primary text-black hover:bg-primary/90 font-display font-bold tracking-wider text-lg h-12">
            PLACE BET
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
