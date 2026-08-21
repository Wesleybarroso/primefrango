export type CartLine = { id: string; title: string; priceCents: number; imageUrl: string | null; quantity: number };

export function hydrateCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && typeof item.title === "string" && typeof item.priceCents === "number" && typeof item.quantity === "number").map((item) => ({ id: String(item.id), title: String(item.title), priceCents: Number(item.priceCents), imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null, quantity: Math.max(1, Math.floor(Number(item.quantity))) }));
}

export function addCartLine(current: CartLine[], line: Omit<CartLine, "quantity">): CartLine[] {
  const existing = current.find((item) => item.id === line.id);
  return existing ? current.map((item) => item.id === line.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...line, quantity: 1 }];
}

export function changeCartQuantity(current: CartLine[], id: string, nextQuantity: number): CartLine[] {
  return nextQuantity <= 0 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity: nextQuantity } : item);
}
