import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, IntegrationProvider, integrationSettings, users } from "../drizzle/schema";
import { ENV } from './_core/env';

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
  return db.select({ provider: integrationSettings.provider, label: integrationSettings.label, maskedSecret: integrationSettings.maskedSecret, isEnabled: integrationSettings.isEnabled, updatedAt: integrationSettings.updatedAt }).from(integrationSettings);
}

export async function saveIntegrationSetting(input: {
  provider: IntegrationProvider;
  label: string;
  maskedSecret: string;
  secretCiphertext: string;
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
      webhookUrl: input.webhookUrl ?? null,
      webhookCiphertext: input.webhookCiphertext ?? null,
      isEnabled: true,
    },
  });
}

// TODO: add feature queries here as your schema grows.
