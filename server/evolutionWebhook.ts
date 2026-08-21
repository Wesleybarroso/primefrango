import { timingSafeEqual } from "node:crypto";

export function isValidEvolutionWebhookToken(received: string | undefined, expected: string) {
  if (!received) return false;
  const receivedBytes = Buffer.from(received);
  const expectedBytes = Buffer.from(expected);
  return receivedBytes.length === expectedBytes.length && timingSafeEqual(receivedBytes, expectedBytes);
}

export function evolutionEventType(body: unknown) {
  if (!body || typeof body !== "object") return "unknown";
  const record = body as Record<string, unknown>;
  return typeof record.event === "string" ? record.event.slice(0, 100) : "unknown";
}
