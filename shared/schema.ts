import { pgTable, text, serial, integer, real, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gamesRelations = relations(games, ({ many }) => ({
  cards: many(cards),
}));

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull().default(""),
  frontImageUrl: text("front_image_url").default(""),
  backImageUrl: text("back_image_url").default(""),
  width: real("width").default(63),
  height: real("height").default(88),
  order: integer("order").default(0),
  description: text("description"),
  attributes: jsonb("attributes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("cards_game_id_idx").on(table.gameId),
  index("cards_order_idx").on(table.order),
]);

export const cardsRelations = relations(cards, ({ one }) => ({
  game: one(games, {
    fields: [cards.gameId],
    references: [games.id],
  }),
}));

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCardSchema = createInsertSchema(cards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;

export const balanceRequestSchema = z.object({
  name: z.string(),
  attack: z.coerce.number(),
  hp: z.coerce.number(),
  effect: z.string(),
  type: z.enum(["monster", "spell", "trap"]),
});

export const balanceResponseSchema = z.object({
  suggested_attack: z.number(),
  suggested_hp: z.number(),
  reason: z.string(),
});

export type BalanceRequest = z.infer<typeof balanceRequestSchema>;
export type BalanceResponse = z.infer<typeof balanceResponseSchema>;
