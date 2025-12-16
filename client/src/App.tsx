import { DAppKitProvider } from "@vechain/dapp-kit-react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MarketDetail from "@/pages/MarketDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/market/:id" component={MarketDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <DAppKitProvider
      requireCertificate={false}
      nodeUrl="https://testnet.vechain.org/"
      logLevel="DEBUG"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </DAppKitProvider>
  );
}

export default App;
