import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Fighters table
export const fighters = pgTable("fighters", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  nickname: text("nickname"),
  image: text("image").notNull(),
  record: text("record").notNull(),
  weightClass: text("weight_class").notNull(),
  nationality: text("nationality").notNull(),
});

// Markets table
export const markets = pgTable("markets", {
  id: varchar("id").primaryKey(),
  event: text("event").notNull(),
  date: timestamp("date").notNull(),
  fighterAId: varchar("fighter_a_id").notNull().references(() => fighters.id),
  fighterBId: varchar("fighter_b_id").notNull().references(() => fighters.id),
  poolTotalVTHO: decimal("pool_total_vtho", { precision: 20, scale: 2 }).notNull().default('0'),
  oddsA: decimal("odds_a", { precision: 10, scale: 2 }).notNull(),
  oddsB: decimal("odds_b", { precision: 10, scale: 2 }).notNull(),
  volume24h: decimal("volume_24h", { precision: 20, scale: 2 }).notNull().default('0'),
  isLive: boolean("is_live").notNull().default(false),
  status: text("status").notNull().default('upcoming'), // upcoming, live, completed, cancelled
});

// User bets/positions table
export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(), // VeChain wallet address
  marketId: varchar("market_id").notNull().references(() => markets.id),
  side: text("side").notNull(), // 'A' or 'B'
  amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
  odds: decimal("odds", { precision: 10, scale: 2 }).notNull(),
  potentialReturn: decimal("potential_return", { precision: 20, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  status: text("status").notNull().default('active'), // active, won, lost, refunded
});

// Insert schemas
export const insertFighterSchema = createInsertSchema(fighters);
export const insertMarketSchema = createInsertSchema(markets).omit({ id: true });
export const insertBetSchema = createInsertSchema(bets).omit({ id: true, createdAt: true });

// Types
export type Fighter = typeof fighters.$inferSelect;
export type InsertFighter = z.infer<typeof insertFighterSchema>;

export type Market = typeof markets.$inferSelect;
export type InsertMarket = z.infer<typeof insertMarketSchema>;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

// Extended market type with fighter details (for API responses)
export type MarketWithFighters = Market & {
  fighterA: Fighter;
  fighterB: Fighter;
};
