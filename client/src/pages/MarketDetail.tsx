import { useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { mockMarkets, userBalance } from "@/lib/mockData";
import { PriceChart } from "@/components/PriceChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { TrendingUp, Clock, Users, Zap, Shield, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { BettingModal } from "@/components/BettingModal";

export default function MarketDetail() {
  const params = useParams();
  const market = mockMarkets.find(m => m.id === params.id);
  const [bettingSide, setBettingSide] = useState<'A' | 'B' | null>(null);

  if (!market) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        Market not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <Link href="/">
          <a className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Markets
          </a>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-black/40">
                   {/* Combined Avatar for Event */}
                   <div className="absolute inset-0 flex">
                     <img src={market.fighterA.image} className="w-1/2 h-full object-cover" />
                     <img src={market.fighterB.image} className="w-1/2 h-full object-cover scale-x-[-1]" />
                   </div>
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-white uppercase tracking-wide">
                    {market.fighterA.name} vs {market.fighterB.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {market.event}
                    </Badge>
                    <span className="text-muted-foreground text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(market.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="font-mono font-bold text-white">${market.volume24h.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <Card className="glass-card p-6 border-white/5 bg-black/20">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-display font-bold text-white">Odds History</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 text-xs bg-white/5 text-white">1H</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-white">4H</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-white">1D</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-white">ALL</Button>
                </div>
              </div>
              <PriceChart />
            </Card>

            {/* Market Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/50 border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-white">Resolution Source</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This market will resolve to "Yes" for the fighter who is declared the winner by official announcement at the end of the match. Draws resolve 50/50.
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <span>Oracle:</span>
                  <span className="text-primary bg-primary/10 px-2 py-0.5 rounded">Chainlink MMA Data Feed</span>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-secondary" />
                  <h3 className="font-bold text-white">Market Liquidity</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">VTHO Pool</span>
                    <span className="font-mono text-white">{market.poolTotalVTHO.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Liquidity Providers</span>
                    <span className="font-mono text-white">1,245</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-mono text-green-400">+{market.volume24h.toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar / Betting Interface */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="p-6 bg-card border-white/10 shadow-2xl">
                <Tabs defaultValue="buy" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-black/40 mb-6">
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buy" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Pick Fighter</label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className={`h-24 flex flex-col justify-between items-start p-3 border-white/10 hover:bg-red-500/10 hover:border-red-500/50 relative overflow-hidden ${bettingSide === 'A' ? 'border-red-500 bg-red-500/10' : ''}`}
                          onClick={() => setBettingSide('A')}
                        >
                          <div className="flex justify-between w-full">
                            <span className="font-display font-bold text-lg text-white">{market.fighterA.name.split(' ').pop()}</span>
                            <span className="font-mono text-red-400">{market.oddsA}x</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                             <div className="h-full bg-red-500 w-[45%]" />
                          </div>
                        </Button>

                        <Button 
                          variant="outline" 
                          className={`h-24 flex flex-col justify-between items-start p-3 border-white/10 hover:bg-blue-500/10 hover:border-blue-500/50 relative overflow-hidden ${bettingSide === 'B' ? 'border-blue-500 bg-blue-500/10' : ''}`}
                          onClick={() => setBettingSide('B')}
                        >
                          <div className="flex justify-between w-full">
                            <span className="font-display font-bold text-lg text-white">{market.fighterB.name.split(' ').pop()}</span>
                            <span className="font-mono text-blue-400">{market.oddsB}x</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                             <div className="h-full bg-blue-500 w-[55%]" />
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                       <Button 
                        className="w-full h-12 text-lg font-bold font-display uppercase tracking-widest bg-white text-black hover:bg-white/90"
                        onClick={() => setBettingSide(bettingSide || 'A')} // Default to A if none selected, or just open modal for last selected
                       >
                         Trade
                       </Button>
                    </div>

                    <div className="text-center text-xs text-muted-foreground mt-4">
                      Balance: <span className="text-secondary font-mono">{userBalance.vtho.toLocaleString()} VTHO</span>
                    </div>
                  </TabsContent>

                  <TabsContent value="sell">
                     <div className="text-center py-8 text-muted-foreground text-sm">
                       You don't have any open positions to sell.
                     </div>
                  </TabsContent>
                </Tabs>
              </Card>
              
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
                 <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                 <div className="text-xs text-muted-foreground">
                   <strong className="text-primary block mb-1">Fee Rebate Active</strong>
                   Hold a VeChain X-Node to receive 50% trading fee rebates in VTHO.
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BettingModal 
        isOpen={!!bettingSide} 
        onClose={() => setBettingSide(null)}
        market={market}
        side={bettingSide}
      />
    </div>
  );
}
