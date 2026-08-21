import { drizzle } from "drizzle-orm/mysql2";
import { integrationSettings } from "../drizzle/schema.ts";
import { encryptCredential, maskCredential } from "../server/credentials.ts";

const baseUrl = "https://evo-go-evolution-go.xzhrcw.easypanel.host";
const candidatePaths = ["/instance/fetchInstances", "/api/instance/fetchInstances", "/manager/instance/fetchInstances", "/manager/api/instance/fetchInstances"];

const apiKey = await new Promise((resolve) => {
  process.stdin.setEncoding("utf8");
  process.stdin.once("data", (chunk) => resolve(String(chunk).trim()));
});

try {
  if (!apiKey) throw new Error("Chave não informada.");
  const attempts = [];
  for (const path of candidatePaths) {
    const response = await fetch(`${baseUrl}${path}`, { headers: { apikey: apiKey } });
    attempts.push({ path, status: response.status, accepted: response.ok });
    if (response.ok) break;
  }
  const success = attempts.find((attempt) => attempt.accepted);
  const shouldPersist = process.env.PERSIST_VALIDATED_KEY === "true";
  if (success && shouldPersist) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL indisponível.");
    const db = drizzle(process.env.DATABASE_URL);
    await db.insert(integrationSettings).values({
      provider: "whatsapp",
      label: "WhatsApp + Evolution Go",
      maskedSecret: maskCredential(apiKey),
      secretCiphertext: encryptCredential(apiKey),
      webhookUrl: baseUrl,
      isEnabled: true,
    }).onDuplicateKeyUpdate({
      set: {
        label: "WhatsApp + Evolution Go",
        maskedSecret: maskCredential(apiKey),
        secretCiphertext: encryptCredential(apiKey),
        webhookUrl: baseUrl,
        isEnabled: true,
      },
    });
  }
  console.log(JSON.stringify({ reachable: Boolean(success), matchedPath: success?.path || null, persisted: Boolean(success && shouldPersist), attempts }));
} catch {
  console.log(JSON.stringify({ reachable: false, matchedPath: null, attempts: [], detail: "Não foi possível validar a instância sem expor a credencial." }));
} finally {
  process.exit(0);
}
