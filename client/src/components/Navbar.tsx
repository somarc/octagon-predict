import { Link } from "wouter";
import { Wallet, Menu, Search, Bell } from "lucide-react";
import { userBalance } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import logo from "@assets/generated_images/vechain_ufc_concept_logo.png";
import { useWallet } from "@vechain/dapp-kit-react";
import { Connex } from "@vechain/connex";
import { useEffect, useState } from "react";

export function Navbar() {
  const { account, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState({ vet: "0", vtho: "0" });

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try {
          const connex = new Connex({
            node: "https://testnet.vechain.org",
            network: "test"
          });
          
          const vet = await connex.thor.account(account).get();
          const vtho = await connex.thor.account(account).method({
             "constant": true,
             "inputs": [{"name": "_owner", "type": "address"}],
             "name": "balanceOf",
             "outputs": [{"name": "balance", "type": "uint256"}],
             "payable": false,
             "stateMutability": "view",
             "type": "function"
          }).call("0x0000000000000000000000000000456E65726779", account); // VTHO Contract on Testnet/Mainnet is same address

          setBalance({
            vet: (parseInt(vet.balance, 16) / 1e18).toFixed(2),
            vtho: (parseInt(vtho.decoded.balance) / 1e18).toFixed(2)
          });
        } catch (e) {
          console.error("Error fetching balance:", e);
        }
      }
    };

    fetchBalance();
  }, [account]);

  const handleWalletClick = async () => {
    if (account) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  };

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
                {account ? balance.vtho : userBalance.vtho.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">VET</span>
              <span className="text-xs font-mono text-white">
                {account ? balance.vet : userBalance.vet.toLocaleString()}
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary font-mono hidden sm:flex"
            onClick={handleWalletClick}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
