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
  "pagbank",
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
  paymentLink: varchar("paymentLink", { length: 2048 }),
  webhookUrl: varchar("webhookUrl", { length: 2048 }),
  webhookCiphertext: text("webhookCiphertext"),
  isEnabled: boolean("isEnabled").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const googleMetricsSettings = mysqlTable("google_metrics_settings", {
  id: int("id").autoincrement().primaryKey(),
  gaMeasurementId: varchar("gaMeasurementId", { length: 32 }),
  gtmContainerId: varchar("gtmContainerId", { length: 32 }),
  searchConsoleProperty: varchar("searchConsoleProperty", { length: 2048 }),
  searchConsoleVerification: varchar("searchConsoleVerification", { length: 512 }),
  isEnabled: boolean("isEnabled").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const menuCategories = mysqlTable("menu_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  isActive: boolean("isActive").notNull().default(true),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  description: varchar("description", { length: 600 }),
  priceCents: int("priceCents").notNull(),
  imageUrl: varchar("imageUrl", { length: 2048 }),
  isAvailable: boolean("isAvailable").notNull().default(true),
  sortOrder: int("sortOrder").notNull().default(0),
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

export const couponStatus = mysqlEnum("coupon_status", ["draft", "active", "archived"]);
export const couponDiscountType = mysqlEnum("coupon_discount_type", ["percentage", "fixed"]);

export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  description: varchar("description", { length: 180 }),
  discountType: couponDiscountType.notNull(),
  discountValue: int("discountValue").notNull(),
  minimumOrderCents: int("minimumOrderCents").notNull().default(0),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").notNull().default(0),
  startsAt: timestamp("startsAt"),
  endsAt: timestamp("endsAt"),
  status: couponStatus.notNull().default("draft"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const emailProvider = mysqlEnum("email_provider", ["resend", "smtp"]);

export const emailDeliverySettings = mysqlTable("email_delivery_settings", {
  id: int("id").autoincrement().primaryKey(),
  provider: emailProvider.notNull().unique(),
  senderName: varchar("senderName", { length: 120 }).notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }).notNull(),
  replyToEmail: varchar("replyToEmail", { length: 320 }),
  secretCiphertext: text("secretCiphertext").notNull(),
  maskedSecret: varchar("maskedSecret", { length: 32 }).notNull(),
  smtpHost: varchar("smtpHost", { length: 320 }),
  smtpPort: int("smtpPort"),
  smtpUsernameCiphertext: text("smtpUsernameCiphertext"),
  smtpUsernameMasked: varchar("smtpUsernameMasked", { length: 64 }),
  notificationsJson: text("notificationsJson").notNull(),
  isEnabled: boolean("isEnabled").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type IntegrationProvider = "stripe" | "mercado_pago" | "pagbank" | "google_maps" | "whatsapp" | "email" | "assistant_ia";
export type IntegrationSetting = typeof integrationSettings.$inferSelect;
export type GoogleMetricsSetting = typeof googleMetricsSettings.$inferSelect;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type EmailDeliverySetting = typeof emailDeliverySettings.$inferSelect;

// TODO: Add your tables here
