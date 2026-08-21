import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const caller = appRouter.createCaller({ user: { role: "admin" }, req: {}, res: {} } as any);

const baseCoupon = {
  code: "DOMINGO10",
  description: "Desconto no combo de domingo.",
  discountType: "percentage" as const,
  discountValue: 10,
  minimumOrderCents: 0,
  maxUses: null,
  startsAt: null,
  endsAt: null,
  status: "draft" as const,
};

describe("validação comercial de cupons", () => {
  it("rejeita percentual superior a cem por cento", async () => {
    await expect(caller.coupons.create({ ...baseCoupon, discountValue: 101 })).rejects.toThrow(
      "O desconto percentual deve estar entre 1% e 100%.",
    );
  });

  it("rejeita códigos com caracteres comerciais inválidos", async () => {
    await expect(caller.coupons.create({ ...baseCoupon, code: "DOMINGO 10!" })).rejects.toBeDefined();
  });

  it("rejeita vigência com término anterior ao início", async () => {
    await expect(caller.coupons.create({ ...baseCoupon, startsAt: new Date("2026-09-10T00:00:00Z"), endsAt: new Date("2026-09-09T00:00:00Z") })).rejects.toThrow(
      "O fim da vigência deve ser posterior ao início.",
    );
  });
});
