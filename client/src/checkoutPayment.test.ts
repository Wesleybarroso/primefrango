import { describe, expect, it } from "vitest";
import { hostedCheckoutDestination } from "./checkoutPayment";

describe("redirecionamento Stripe hospedado", () => {
  it("retorna somente o link HTTPS do Stripe selecionado, sem iniciar cobrança", () => {
    expect(hostedCheckoutDestination("stripe", "https://buy.stripe.com/5kQaEZ5L8bHucAC8Vt97G00")).toBe("https://buy.stripe.com/5kQaEZ5L8bHucAC8Vt97G00");
    expect(hostedCheckoutDestination("mercado_pago", "https://buy.stripe.com/test")).toBeNull();
  });

  it("recusa links ausentes, malformados ou não HTTPS", () => {
    expect(hostedCheckoutDestination("stripe", null)).toBeNull();
    expect(hostedCheckoutDestination("stripe", "not a url")).toBeNull();
    expect(hostedCheckoutDestination("stripe", "http://buy.stripe.com/test")).toBeNull();
  });
});
