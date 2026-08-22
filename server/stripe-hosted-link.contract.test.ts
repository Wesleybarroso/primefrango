import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ getPublicStripePaymentLink: vi.fn() }));

vi.mock("./db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./db")>()),
  ...dbMocks,
}));

import { appRouter } from "./routers";

const caller = appRouter.createCaller({ user: null, req: {}, res: {} } as any);

describe("contrato público do link Stripe hospedado", () => {
  it("retorna apenas o link configurado e não cria uma cobrança", async () => {
    dbMocks.getPublicStripePaymentLink.mockResolvedValue("https://buy.stripe.com/checkout-teste");

    await expect(caller.payments.hostedStripeLink()).resolves.toEqual({ url: "https://buy.stripe.com/checkout-teste" });
    expect(dbMocks.getPublicStripePaymentLink).toHaveBeenCalledTimes(1);
  });

  it("retorna nulo quando não há link hospedado configurado", async () => {
    dbMocks.getPublicStripePaymentLink.mockResolvedValue(null);

    await expect(caller.payments.hostedStripeLink()).resolves.toEqual({ url: null });
  });
});
