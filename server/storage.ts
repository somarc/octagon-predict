import { db } from "db";
import { eq, desc, and } from "drizzle-orm";
import { 
  fighters, 
  markets, 
  bets,
  type Fighter, 
  type InsertFighter,
  type Market,
  type InsertMarket,
  type MarketWithFighters,
  type Bet,
  type InsertBet
} from "@shared/schema";

export interface IStorage {
  // Fighters
  getFighter(id: string): Promise<Fighter | undefined>;
  getAllFighters(): Promise<Fighter[]>;
  createFighter(fighter: InsertFighter): Promise<Fighter>;
  
  // Markets
  getMarket(id: string): Promise<Market | undefined>;
  getMarketWithFighters(id: string): Promise<MarketWithFighters | undefined>;
  getAllMarkets(): Promise<Market[]>;
  getAllMarketsWithFighters(): Promise<MarketWithFighters[]>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarketOdds(id: string, oddsA: string, oddsB: string): Promise<Market | undefined>;
  updateMarketStats(id: string, poolTotal: string, volume24h: string): Promise<Market | undefined>;
  
  // Bets
  getBet(id: string): Promise<Bet | undefined>;
  getUserBets(walletAddress: string): Promise<Bet[]>;
  getMarketBets(marketId: string): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
}

export class DbStorage implements IStorage {
  // Fighters
  async getFighter(id: string): Promise<Fighter | undefined> {
    const result = await db.select().from(fighters).where(eq(fighters.id, id));
    return result[0];
  }

  async getAllFighters(): Promise<Fighter[]> {
    return await db.select().from(fighters);
  }

  async createFighter(fighter: InsertFighter): Promise<Fighter> {
    const result = await db.insert(fighters).values(fighter).returning();
    return result[0];
  }

  // Markets
  async getMarket(id: string): Promise<Market | undefined> {
    const result = await db.select().from(markets).where(eq(markets.id, id));
    return result[0];
  }

  async getMarketWithFighters(id: string): Promise<MarketWithFighters | undefined> {
    const result = await db
      .select()
      .from(markets)
      .leftJoin(fighters, eq(markets.fighterAId, fighters.id))
      .where(eq(markets.id, id))
      .limit(1);

    if (result.length === 0) return undefined;

    const market = result[0].markets;
    const fighterA = result[0].fighters;

    // Get fighter B separately
    const fighterBResult = await db
      .select()
      .from(fighters)
      .where(eq(fighters.id, market.fighterBId));

    if (!fighterA || fighterBResult.length === 0) return undefined;

    return {
      ...market,
      fighterA,
      fighterB: fighterBResult[0],
    };
  }

  async getAllMarkets(): Promise<Market[]> {
    return await db.select().from(markets).orderBy(desc(markets.date));
  }

  async getAllMarketsWithFighters(): Promise<MarketWithFighters[]> {
    const allMarkets = await this.getAllMarkets();
    const marketsWithFighters: MarketWithFighters[] = [];

    for (const market of allMarkets) {
      const fighterA = await this.getFighter(market.fighterAId);
      const fighterB = await this.getFighter(market.fighterBId);

      if (fighterA && fighterB) {
        marketsWithFighters.push({
          ...market,
          fighterA,
          fighterB,
        });
      }
    }

    return marketsWithFighters;
  }

  async createMarket(market: InsertMarket): Promise<Market> {
    const result = await db.insert(markets).values(market).returning();
    return result[0];
  }

  async updateMarketOdds(id: string, oddsA: string, oddsB: string): Promise<Market | undefined> {
    const result = await db
      .update(markets)
      .set({ oddsA, oddsB })
      .where(eq(markets.id, id))
      .returning();
    return result[0];
  }

  async updateMarketStats(id: string, poolTotal: string, volume24h: string): Promise<Market | undefined> {
    const result = await db
      .update(markets)
      .set({ poolTotalVTHO: poolTotal, volume24h })
      .where(eq(markets.id, id))
      .returning();
    return result[0];
  }

  // Bets
  async getBet(id: string): Promise<Bet | undefined> {
    const result = await db.select().from(bets).where(eq(bets.id, id));
    return result[0];
  }

  async getUserBets(walletAddress: string): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.walletAddress, walletAddress))
      .orderBy(desc(bets.createdAt));
  }

  async getMarketBets(marketId: string): Promise<Bet[]> {
    return await db
      .select()
      .from(bets)
      .where(eq(bets.marketId, marketId))
      .orderBy(desc(bets.createdAt));
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const result = await db.insert(bets).values(bet).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
