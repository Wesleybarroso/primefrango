import type { Promotion } from "../drizzle/schema";

export function isPublicPromotion(promotion: Pick<Promotion, "status" | "startsAt" | "endsAt">, now = new Date()) {
  if (promotion.status !== "active") return false;
  if (promotion.startsAt && promotion.startsAt > now) return false;
  if (promotion.endsAt && promotion.endsAt < now) return false;
  return true;
}
