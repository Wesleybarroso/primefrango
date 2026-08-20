import { describe, expect, it } from "vitest";
import { isPublicPromotion } from "./promotions";

const now = new Date("2026-08-20T12:00:00.000Z");

describe("visibilidade pública de promoções", () => {
  it("publica apenas promoções ativas dentro da vigência", () => {
    expect(isPublicPromotion({ status: "active", startsAt: new Date("2026-08-20T00:00:00.000Z"), endsAt: new Date("2026-08-21T00:00:00.000Z") }, now)).toBe(true);
    expect(isPublicPromotion({ status: "draft", startsAt: null, endsAt: null }, now)).toBe(false);
    expect(isPublicPromotion({ status: "active", startsAt: new Date("2026-08-21T00:00:00.000Z"), endsAt: null }, now)).toBe(false);
    expect(isPublicPromotion({ status: "active", startsAt: null, endsAt: new Date("2026-08-19T00:00:00.000Z") }, now)).toBe(false);
  });
});
