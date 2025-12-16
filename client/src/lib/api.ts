import type { Market } from "@/lib/mockData";

const API_BASE = "/api";

export async function fetchMarkets(): Promise<Market[]> {
  const response = await fetch(`${API_BASE}/markets`);
  if (!response.ok) {
    throw new Error("Failed to fetch markets");
  }
  return response.json();
}

export async function fetchMarket(id: string): Promise<Market> {
  const response = await fetch(`${API_BASE}/markets/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch market");
  }
  return response.json();
}

export interface PlaceBetRequest {
  walletAddress: string;
  marketId: string;
  side: string;
  amount: string;
  odds: string;
  potentialReturn: string;
}

export async function placeBet(bet: PlaceBetRequest) {
  const response = await fetch(`${API_BASE}/bets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bet),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to place bet");
  }
  
  return response.json();
}

export async function fetchUserBets(walletAddress: string) {
  const response = await fetch(`${API_BASE}/bets/${walletAddress}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user bets");
  }
  return response.json();
}
