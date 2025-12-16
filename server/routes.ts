import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get all markets with fighter details
  app.get("/api/markets", async (req, res) => {
    try {
      const markets = await storage.getAllMarketsWithFighters();
      
      // Transform to match frontend format
      const formattedMarkets = markets.map(market => ({
        id: market.id,
        event: market.event,
        date: market.date.toISOString(),
        fighterA: market.fighterA,
        fighterB: market.fighterB,
        poolTotalVTHO: parseFloat(market.poolTotalVTHO),
        oddsA: parseFloat(market.oddsA),
        oddsB: parseFloat(market.oddsB),
        volume24h: parseFloat(market.volume24h),
        isLive: market.isLive,
      }));
      
      res.json(formattedMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      res.status(500).json({ error: "Failed to fetch markets" });
    }
  });

  // Get specific market with fighter details
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const market = await storage.getMarketWithFighters(req.params.id);
      
      if (!market) {
        return res.status(404).json({ error: "Market not found" });
      }
      
      // Transform to match frontend format
      const formattedMarket = {
        id: market.id,
        event: market.event,
        date: market.date.toISOString(),
        fighterA: market.fighterA,
        fighterB: market.fighterB,
        poolTotalVTHO: parseFloat(market.poolTotalVTHO),
        oddsA: parseFloat(market.oddsA),
        oddsB: parseFloat(market.oddsB),
        volume24h: parseFloat(market.volume24h),
        isLive: market.isLive,
      };
      
      res.json(formattedMarket);
    } catch (error) {
      console.error("Error fetching market:", error);
      res.status(500).json({ error: "Failed to fetch market" });
    }
  });

  // Place a bet
  app.post("/api/bets", async (req, res) => {
    try {
      // Validate request body
      const validation = insertBetSchema.safeParse(req.body);
      
      if (!validation.success) {
        const error = fromZodError(validation.error);
        return res.status(400).json({ error: error.message });
      }
      
      const bet = await storage.createBet(validation.data);
      
      // Update market stats (pool total and volume)
      const market = await storage.getMarket(bet.marketId);
      if (market) {
        const newPoolTotal = (parseFloat(market.poolTotalVTHO) + parseFloat(bet.amount)).toString();
        const newVolume = (parseFloat(market.volume24h) + parseFloat(bet.amount)).toString();
        await storage.updateMarketStats(bet.marketId, newPoolTotal, newVolume);
      }
      
      res.json(bet);
    } catch (error) {
      console.error("Error placing bet:", error);
      res.status(500).json({ error: "Failed to place bet" });
    }
  });

  // Get user's bets
  app.get("/api/bets/:walletAddress", async (req, res) => {
    try {
      const bets = await storage.getUserBets(req.params.walletAddress);
      res.json(bets);
    } catch (error) {
      console.error("Error fetching user bets:", error);
      res.status(500).json({ error: "Failed to fetch bets" });
    }
  });

  // Get market bets (for analytics/stats)
  app.get("/api/markets/:id/bets", async (req, res) => {
    try {
      const bets = await storage.getMarketBets(req.params.id);
      res.json(bets);
    } catch (error) {
      console.error("Error fetching market bets:", error);
      res.status(500).json({ error: "Failed to fetch market bets" });
    }
  });

  return httpServer;
}
