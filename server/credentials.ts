import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const algorithm = "aes-256-gcm";

function credentialKey() {
  const source = process.env.JWT_SECRET;
  if (!source) throw new Error("JWT_SECRET é obrigatório para proteger credenciais de integração.");
  return createHash("sha256").update(source).digest();
}

export function encryptCredential(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, credentialKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptCredential(ciphertext: string) {
  const [iv, tag, encrypted] = ciphertext.split(".");
  if (!iv || !tag || !encrypted) throw new Error("Formato de credencial inválido.");
  const decipher = createDecipheriv(algorithm, credentialKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8");
}

export function maskCredential(value: string) {
  const suffix = value.trim().slice(-4);
  return suffix ? `••••••••${suffix}` : "Não configurada";
}
