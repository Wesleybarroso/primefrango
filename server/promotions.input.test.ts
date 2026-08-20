import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const caller = appRouter.createCaller({
  user: { role: "admin" },
  req: {},
  res: {},
} as any);

const basePromotion = {
  title: "Combo da família",
  description: "Frango assado, acompanhamento e bebida para compartilhar.",
  badge: "OFERTA",
  originalPriceCents: 5990,
  salePriceCents: 4990,
  imageUrls: [],
  startsAt: null,
  endsAt: null,
  status: "draft" as const,
};

describe("validação comercial de promoções", () => {
  it("rejeita preço promocional igual ou superior ao preço original", async () => {
    await expect(caller.promotions.create({ ...basePromotion, salePriceCents: 5990 })).rejects.toThrow(
      "O preço promocional precisa ser menor que o preço original.",
    );
  });

  it("rejeita mais de três imagens para o mesmo combo", async () => {
    await expect(caller.promotions.create({ ...basePromotion, imageUrls: ["/manus-storage/1.png", "/manus-storage/2.png", "/manus-storage/3.png", "/manus-storage/4.png"] })).rejects.toBeDefined();
  });
});
