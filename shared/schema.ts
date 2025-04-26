import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  mobileNo: text("mobile_no"),
  balance: doublePrecision("balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const tournaments = pgTable("tournaments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  prizePool: doublePrecision("prize_pool").notNull(),
  entryFee: doublePrecision("entry_fee").notNull().default(0),
  maxPlayers: integer("max_players").notNull(),
  currentPlayers: integer("current_players").notNull().default(0),
  status: text("status").notNull().default("upcoming"), // upcoming, live, completed
  tournamentType: text("tournament_type").notNull(), // solo, duo, squad
  featured: boolean("featured").default(false),
  imageUrl: text("image_url"),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id).notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  status: text("status").notNull().default("registered"), // registered, playing, completed
  placement: integer("placement"),
  earnings: doublePrecision("earnings").default(0),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, entry_fee, prize
  description: text("description").notNull(),
  tournamentId: integer("tournament_id").references(() => tournaments.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").notNull().default("completed"), // pending, completed, failed
  metadata: jsonb("metadata"),
});

// Zod schemas for inserts
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  balance: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  currentPlayers: true,
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  registeredAt: true,
  placement: true,
  earnings: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Auth type
export type LoginData = Pick<InsertUser, "username" | "password">;
