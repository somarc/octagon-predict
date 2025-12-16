import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { MarketCard } from "@/components/MarketCard";
import { mockMarkets } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Search, Filter, Trophy, Flame } from "lucide-react";
import heroBg from "@assets/generated_images/cinematic_mma_octagon_with_neon_lights.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] w-full flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Octagon" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest animate-pulse">
                Powered by VeChainThor
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-[0.9] mb-6">
              PREDICT<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">THE FIGHT</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              The first decentralized prediction market dedicated to MMA. 
              Stake VTHO on your favorite fighters with zero-gas fee transactions.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-primary text-black hover:bg-primary/90 font-bold px-8 h-12 rounded-none clip-path-polygon">
                VIEW MARKETS
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 h-12 rounded-none">
                HOW IT WORKS
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="container mx-auto px-4 -mt-20 relative z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Button variant="ghost" className="text-white border-b-2 border-primary rounded-none px-2 py-6 hover:bg-transparent">
              <Flame className="w-4 h-4 mr-2 text-primary" />
              Trending
            </Button>
            <Button variant="ghost" className="text-muted-foreground border-b-2 border-transparent rounded-none px-2 py-6 hover:text-white hover:bg-transparent">
              <Trophy className="w-4 h-4 mr-2" />
              Championships
            </Button>
            <Button variant="ghost" className="text-muted-foreground border-b-2 border-transparent rounded-none px-2 py-6 hover:text-white hover:bg-transparent">
              Live
            </Button>
            <Button variant="ghost" className="text-muted-foreground border-b-2 border-transparent rounded-none px-2 py-6 hover:text-white hover:bg-transparent">
              Upcoming
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search fighter..." 
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-64"
              />
            </div>
            <Button variant="outline" size="icon" className="border-white/10 text-white hover:bg-white/5 rounded-full shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </section>
    </div>
  );
}
