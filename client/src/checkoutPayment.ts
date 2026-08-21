export type CheckoutProvider = "stripe" | "mercado_pago" | "pagbank";

export function hostedCheckoutDestination(provider: CheckoutProvider | null, paymentLink: string | null | undefined) {
  if (provider !== "stripe") return null;
  const normalized = paymentLink?.trim();
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
