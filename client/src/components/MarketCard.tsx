import { useState } from "react";
import { motion } from "framer-motion";
import { Market } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Clock, Zap } from "lucide-react";
import { BettingModal } from "./BettingModal";
import { Link } from "wouter";

interface MarketCardProps {
  market: Market;
}

export function MarketCard({ market }: MarketCardProps) {
  const [bettingSide, setBettingSide] = useState<'A' | 'B' | null>(null);

  // Calculate percentages for the visual bar
  const totalOdds = market.oddsA + market.oddsB; // Not mathematically perfect for probability but good for visual ratio
  const percentA = (market.oddsB / totalOdds) * 100; // Inverse relationship for visual probability

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass-card border-0 overflow-hidden group hover:shadow-[0_0_30px_rgba(0,180,216,0.15)] transition-all duration-300 cursor-pointer">
          <Link href={`/market/${market.id}`} className="absolute inset-0 z-0" />
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20 relative z-10 pointer-events-none">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                {market.event}
              </Badge>
              {market.isLive && (
                <Badge variant="destructive" className="animate-pulse text-[10px] uppercase tracking-wider">
                  Live Now
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
              <Clock className="w-3 h-3" />
              {new Date(market.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Fighters Visual */}
          <div className="relative h-48 w-full overflow-hidden z-10 pointer-events-none">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-blue-900/20 z-0" />
            
            {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="font-display font-black text-4xl italic text-white/10 select-none">VS</div>
            </div>

            <div className="grid grid-cols-2 h-full relative z-10">
              {/* Fighter A (Red) */}
              <div className="relative h-full flex items-end justify-start pl-4 pb-0 group/fighter">
                <img 
                  src={market.fighterA.image} 
                  alt={market.fighterA.name}
                  className="h-[110%] w-auto object-cover object-top mask-image-gradient-b transition-transform duration-500 group-hover/fighter:scale-105"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Red Corner</div>
                  <h3 className="font-display font-bold text-2xl text-white leading-none uppercase">{market.fighterA.name}</h3>
                  <div className="text-xs text-white/60 font-mono mt-1">{market.fighterA.record}</div>
                </div>
              </div>

              {/* Fighter B (Blue) */}
              <div className="relative h-full flex items-end justify-end pr-4 pb-0 group/fighter">
                <img 
                  src={market.fighterB.image} 
                  alt={market.fighterB.name}
                  className="h-[110%] w-auto object-cover object-top mask-image-gradient-b transition-transform duration-500 group-hover/fighter:scale-105 scale-x-[-1]"
                />
                <div className="absolute bottom-4 right-4 z-20 text-right">
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Blue Corner</div>
                  <h3 className="font-display font-bold text-2xl text-white leading-none uppercase">{market.fighterB.name}</h3>
                  <div className="text-xs text-white/60 font-mono mt-1">{market.fighterB.record}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Actions */}
          <div className="p-4 grid grid-cols-2 gap-4 bg-black/40 backdrop-blur-sm relative z-20">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                setBettingSide('A');
              }}
              className="h-auto py-3 flex flex-col items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/50 transition-all group/btn"
            >
              <span className="text-xs text-red-400 font-bold mb-1">WINNER</span>
              <span className="text-xl font-display font-bold text-white group-hover/btn:text-red-400 transition-colors">{market.oddsA}x</span>
            </Button>

            <Button 
              onClick={(e) => {
                e.stopPropagation();
                setBettingSide('B');
              }}
              className="h-auto py-3 flex flex-col items-center justify-center bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/50 transition-all group/btn"
            >
              <span className="text-xs text-blue-400 font-bold mb-1">WINNER</span>
              <span className="text-xl font-display font-bold text-white group-hover/btn:text-blue-400 transition-colors">{market.oddsB}x</span>
            </Button>
          </div>

          {/* Stats Footer */}
          <div className="px-4 py-3 bg-card border-t border-white/5 flex items-center justify-between relative z-10 pointer-events-none">
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Users className="w-3 h-3" />
              <span>{Math.floor(market.volume24h / 100)} Bets</span>
            </div>
            <div className="flex items-center gap-2 text-secondary text-xs font-mono font-medium">
              <Zap className="w-3 h-3" />
              <span>{market.poolTotalVTHO.toLocaleString()} VTHO Pool</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <BettingModal 
        isOpen={!!bettingSide} 
        onClose={() => setBettingSide(null)}
        market={market}
        side={bettingSide}
      />
    </>
  );
}
