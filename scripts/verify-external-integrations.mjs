import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { integrationSettings } from "../drizzle/schema.ts";
import { decryptCredential } from "../server/credentials.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL indisponível.");

const db = drizzle(process.env.DATABASE_URL);
const targets = ["stripe", "assistant_ia"];
const rows = await db.select({ provider: integrationSettings.provider, ciphertext: integrationSettings.secretCiphertext, enabled: integrationSettings.isEnabled }).from(integrationSettings);
const settings = rows.filter((row) => targets.includes(row.provider) && row.enabled);
const results = [];

for (const setting of settings) {
  try {
    const token = decryptCredential(setting.ciphertext);
    if (setting.provider === "stripe") {
      const response = await fetch("https://api.stripe.com/v1/account", { headers: { Authorization: `Bearer ${token}` } });
      results.push({ provider: "stripe", reachable: response.ok, status: response.status, detail: response.ok ? "Credencial aceita pela API Stripe." : "A API Stripe recusou a credencial." });
    }
    if (setting.provider === "assistant_ia") {
      const response = await fetch("https://api.x.ai/v1/models", { headers: { Authorization: `Bearer ${token}` } });
      results.push({ provider: "grok", reachable: response.ok, status: response.status, detail: response.ok ? "Credencial aceita pela API xAI/Grok." : "A API xAI/Grok recusou a credencial." });
    }
  } catch {
    results.push({ provider: setting.provider === "assistant_ia" ? "grok" : setting.provider, reachable: false, status: null, detail: "Não foi possível validar a configuração sem expor a credencial." });
  }
}

for (const provider of ["stripe", "grok"]) {
  if (!results.some((result) => result.provider === provider)) results.push({ provider, reachable: false, status: null, detail: "Integração não encontrada ou desativada." });
}

console.log(JSON.stringify(results));
