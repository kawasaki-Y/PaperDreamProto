import { db } from "./db.ts";
import { games, cards, type InsertGame, type Game, type InsertCard, type Card } from "@shared/schema";
import { eq, asc, desc } from "drizzle-orm";

export interface IStorage {
  createGame(game: InsertGame): Promise<Game>;
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  updateGame(id: number, data: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<boolean>;

  createCard(card: InsertCard): Promise<Card>;
  getCardsByGame(gameId: number): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  updateCard(id: number, data: Partial<InsertCard>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async getGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(desc(games.updatedAt));
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async updateGame(id: number, data: Partial<InsertGame>): Promise<Game | undefined> {
    const [game] = await db.update(games).set({ ...data, updatedAt: new Date() }).where(eq(games.id, id)).returning();
    return game;
  }

  async deleteGame(id: number): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id)).returning();
    return result.length > 0;
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const [card] = await db.insert(cards).values(insertCard).returning();
    await db.update(games).set({ updatedAt: new Date() }).where(eq(games.id, insertCard.gameId));
    return card;
  }

  async getCardsByGame(gameId: number): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.gameId, gameId)).orderBy(asc(cards.order));
  }

  async getCard(id: number): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card;
  }

  async updateCard(id: number, data: Partial<InsertCard>): Promise<Card | undefined> {
    const [card] = await db.update(cards).set({ ...data, updatedAt: new Date() }).where(eq(cards.id, id)).returning();
    if (card) {
      await db.update(games).set({ updatedAt: new Date() }).where(eq(games.id, card.gameId));
    }
    return card;
  }

  async deleteCard(id: number): Promise<boolean> {
    const result = await db.delete(cards).where(eq(cards.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
