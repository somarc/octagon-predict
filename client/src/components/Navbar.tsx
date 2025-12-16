import { Link } from "wouter";
import { Wallet, Menu, Search, Bell } from "lucide-react";
import { userBalance } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import logo from "@assets/generated_images/vechain_ufc_concept_logo.png";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <img 
              src={logo} 
              alt="VeChain UFC" 
              className="h-10 w-10 object-contain group-hover:scale-105 transition-transform" 
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-wider leading-none text-white">
                VECHAIN<span className="text-primary">THOR</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                Prediction Market
              </span>
            </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">MARKETS</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">LEADERBOARD</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">PORTFOLIO</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary transition-colors">GOVERNANCE</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">VTHO</span>
              <span className="font-bold font-mono text-secondary text-glow-gold">
                {userBalance.vtho.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">VET</span>
              <span className="text-xs font-mono text-white">
                {userBalance.vet.toLocaleString()}
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary font-mono hidden sm:flex"
          >
            <Wallet className="w-4 h-4 mr-2" />
            0x7A...4B2C
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
