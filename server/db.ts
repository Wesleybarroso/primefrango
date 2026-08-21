import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, IntegrationProvider, Promotion, coupons, emailDeliverySettings, googleMetricsSettings, integrationSettings, menuCategories, menuItems, promotions, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { isPublicPromotion } from "./promotions";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listIntegrationSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ provider: integrationSettings.provider, label: integrationSettings.label, maskedSecret: integrationSettings.maskedSecret, paymentLink: integrationSettings.paymentLink, isEnabled: integrationSettings.isEnabled, updatedAt: integrationSettings.updatedAt }).from(integrationSettings);
}

export async function getPrivateIntegrationSetting(provider: IntegrationProvider) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ secretCiphertext: integrationSettings.secretCiphertext, isEnabled: integrationSettings.isEnabled, webhookUrl: integrationSettings.webhookUrl })
    .from(integrationSettings)
    .where(eq(integrationSettings.provider, provider))
    .limit(1);
  return result[0];
}

export async function getPublicStripePaymentLink() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({ paymentLink: integrationSettings.paymentLink, isEnabled: integrationSettings.isEnabled }).from(integrationSettings).where(eq(integrationSettings.provider, "stripe")).limit(1);
  const setting = result[0];
  return setting?.isEnabled && setting.paymentLink ? setting.paymentLink : null;
}

export async function saveIntegrationSetting(input: {
  provider: IntegrationProvider;
  label: string;
  maskedSecret: string;
  secretCiphertext: string;
  paymentLink?: string;
  webhookUrl?: string;
  webhookCiphertext?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para salvar a integração.");
  await db.insert(integrationSettings).values({ ...input, isEnabled: true }).onDuplicateKeyUpdate({
    set: {
      label: input.label,
      maskedSecret: input.maskedSecret,
      secretCiphertext: input.secretCiphertext,
      paymentLink: input.paymentLink ?? null,
      webhookUrl: input.webhookUrl ?? null,
      webhookCiphertext: input.webhookCiphertext ?? null,
      isEnabled: true,
    },
  });
}

export type GoogleMetricsInput = { gaMeasurementId?: string | null; gtmContainerId?: string | null; searchConsoleProperty?: string | null; searchConsoleVerification?: string | null };

export async function getGoogleMetricsSettings() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(googleMetricsSettings).limit(1);
  return result[0];
}

export async function saveGoogleMetricsSettings(input: GoogleMetricsInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para salvar as métricas Google.");
  const current = await getGoogleMetricsSettings();
  const isEnabled = Boolean(input.gaMeasurementId || input.gtmContainerId || input.searchConsoleProperty);
  if (current) {
    await db.update(googleMetricsSettings).set({ ...input, isEnabled }).where(eq(googleMetricsSettings.id, current.id));
    return current.id;
  }
  const result = await db.insert(googleMetricsSettings).values({ ...input, isEnabled });
  return Number(result[0].insertId);
}

export type MenuCategoryInput = { name: string; isActive: boolean; sortOrder: number };
export type MenuItemInput = { categoryId: number; title: string; description?: string | null; priceCents: number; imageUrl?: string | null; isAvailable: boolean; sortOrder: number };

export async function listMenuCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuCategories).orderBy(menuCategories.sortOrder, menuCategories.name);
}

export async function getMenuCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(menuCategories).where(eq(menuCategories.id, id)).limit(1);
  return result[0];
}

export async function listMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).orderBy(menuItems.sortOrder, menuItems.title);
}

export async function listPublicMenuCatalog() {
  const [categories, items] = await Promise.all([listMenuCategories(), listMenuItems()]);
  return categories.filter((category) => category.isActive).map((category) => ({ ...category, items: items.filter((item) => item.categoryId === category.id && item.isAvailable) }));
}

export async function createMenuCategory(input: MenuCategoryInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para salvar a categoria.");
  const result = await db.insert(menuCategories).values(input);
  return Number(result[0].insertId);
}

export async function updateMenuCategory(id: number, input: MenuCategoryInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para atualizar a categoria.");
  await db.update(menuCategories).set(input).where(eq(menuCategories.id, id));
}

export async function removeMenuCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para remover a categoria.");
  const items = await db.select({ id: menuItems.id }).from(menuItems).where(eq(menuItems.categoryId, id)).limit(1);
  if (items.length) throw new Error("Remova ou mova os itens desta categoria antes de excluí-la.");
  await db.delete(menuCategories).where(eq(menuCategories.id, id));
}

export async function createMenuItem(input: MenuItemInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para salvar o item.");
  const result = await db.insert(menuItems).values(input);
  return Number(result[0].insertId);
}

export async function updateMenuItem(id: number, input: MenuItemInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para atualizar o item.");
  await db.update(menuItems).set(input).where(eq(menuItems.id, id));
}

export async function removeMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para remover o item.");
  await db.delete(menuItems).where(eq(menuItems.id, id));
}

export type EmailDeliveryInput = {
  provider: "resend" | "smtp";
  senderName: string;
  senderEmail: string;
  replyToEmail?: string | null;
  secretCiphertext: string;
  maskedSecret: string;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUsernameCiphertext?: string | null;
  smtpUsernameMasked?: string | null;
  notificationsJson: string;
};

export async function listEmailDeliverySettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ provider: emailDeliverySettings.provider, senderName: emailDeliverySettings.senderName, senderEmail: emailDeliverySettings.senderEmail, replyToEmail: emailDeliverySettings.replyToEmail, maskedSecret: emailDeliverySettings.maskedSecret, smtpHost: emailDeliverySettings.smtpHost, smtpPort: emailDeliverySettings.smtpPort, smtpUsernameMasked: emailDeliverySettings.smtpUsernameMasked, notificationsJson: emailDeliverySettings.notificationsJson, isEnabled: emailDeliverySettings.isEnabled, updatedAt: emailDeliverySettings.updatedAt }).from(emailDeliverySettings);
}

export async function saveEmailDeliverySetting(input: EmailDeliveryInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para salvar a integração de e-mail.");
  await db.insert(emailDeliverySettings).values({ ...input, isEnabled: true }).onDuplicateKeyUpdate({ set: { ...input, isEnabled: true } });
}

export async function getPrivateEmailDeliverySetting(provider: "resend" | "smtp") {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailDeliverySettings).where(eq(emailDeliverySettings.provider, provider)).limit(1);
  return result[0];
}

export type PromotionInput = {
  title: string;
  description: string;
  badge?: string | null;
  originalPriceCents: number;
  salePriceCents?: number | null;
  imageUrls?: string[];
  startsAt?: Date | null;
  endsAt?: Date | null;
  status: "draft" | "active" | "archived";
};

export async function listPromotions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promotions).orderBy(desc(promotions.updatedAt));
}

export async function listPublicPromotions() {
  const allPromotions = await listPromotions();
  return allPromotions.filter((promotion) => isPublicPromotion(promotion));
}

export async function createPromotion(input: PromotionInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para salvar a promoção.");
  const { imageUrls = [], ...data } = input;
  const result = await db.insert(promotions).values({ ...data, image1Url: imageUrls[0] ?? null, image2Url: imageUrls[1] ?? null, image3Url: imageUrls[2] ?? null });
  return Number(result[0].insertId);
}

export async function updatePromotion(id: number, input: PromotionInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para atualizar a promoção.");
  const { imageUrls = [], ...data } = input;
  await db.update(promotions).set({ ...data, image1Url: imageUrls[0] ?? null, image2Url: imageUrls[1] ?? null, image3Url: imageUrls[2] ?? null }).where(eq(promotions.id, id));
}

export async function setPromotionStatus(id: number, status: PromotionInput["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para atualizar a promoção.");
  await db.update(promotions).set({ status }).where(eq(promotions.id, id));
}

export async function removePromotion(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para remover a promoção.");
  await db.delete(promotions).where(eq(promotions.id, id));
}

export type CouponInput = {
  code: string;
  description?: string | null;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderCents: number;
  maxUses?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  status: "draft" | "active" | "archived";
};

export async function listCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons).orderBy(desc(coupons.updatedAt));
}

export async function createCoupon(input: CouponInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para salvar o cupom.");
  const result = await db.insert(coupons).values({ ...input, code: input.code.toUpperCase() });
  return Number(result[0].insertId);
}

export async function updateCoupon(id: number, input: CouponInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para atualizar o cupom.");
  await db.update(coupons).set({ ...input, code: input.code.toUpperCase() }).where(eq(coupons.id, id));
}

export async function setCouponStatus(id: number, status: CouponInput["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para atualizar o cupom.");
  await db.update(coupons).set({ status }).where(eq(coupons.id, id));
}

export async function removeCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível para remover o cupom.");
  await db.delete(coupons).where(eq(coupons.id, id));
}

// TODO: add feature queries here as your schema grows.
