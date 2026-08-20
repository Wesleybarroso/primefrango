import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const integrationProvider = mysqlEnum("integration_provider", [
  "stripe",
  "mercado_pago",
  "google_maps",
  "whatsapp",
  "email",
  "assistant_ia",
]);

export const integrationSettings = mysqlTable("integration_settings", {
  id: int("id").autoincrement().primaryKey(),
  provider: integrationProvider.notNull().unique(),
  label: varchar("label", { length: 80 }).notNull(),
  maskedSecret: varchar("maskedSecret", { length: 32 }).notNull(),
  secretCiphertext: text("secretCiphertext").notNull(),
  webhookUrl: varchar("webhookUrl", { length: 2048 }),
  webhookCiphertext: text("webhookCiphertext"),
  isEnabled: boolean("isEnabled").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const promotionStatus = mysqlEnum("promotion_status", ["draft", "active", "archived"]);

export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 120 }).notNull(),
  description: text("description").notNull(),
  badge: varchar("badge", { length: 48 }),
  originalPriceCents: int("originalPriceCents").notNull().default(0),
  salePriceCents: int("salePriceCents"),
  image1Url: varchar("image1Url", { length: 2048 }),
  image2Url: varchar("image2Url", { length: 2048 }),
  image3Url: varchar("image3Url", { length: 2048 }),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  status: promotionStatus.notNull().default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type IntegrationProvider = "stripe" | "mercado_pago" | "google_maps" | "whatsapp" | "email" | "assistant_ia";
export type IntegrationSetting = typeof integrationSettings.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;

// TODO: Add your tables here
