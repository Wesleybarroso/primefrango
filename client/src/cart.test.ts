import { describe, expect, it } from "vitest";
import { addCartLine, changeCartQuantity, hydrateCart } from "./cart";

describe("carrinho do Cardápio", () => {
  const combo = { id: "promotion-9", title: "Combo de domingo", priceCents: 4000, imageUrl: null };

  it("mantém o combo ao retornar para editar o pedido", () => {
    const cart = addCartLine([], combo);
    expect(cart).toEqual([{ ...combo, quantity: 1 }]);
    expect(changeCartQuantity(cart, "promotion-9", 1)).toEqual(cart);
  });

  it("soma o mesmo combo sem colidir com um item do Cardápio", () => {
    const withCombo = addCartLine([], combo);
    const result = addCartLine(withCombo, { id: "item-9", title: "Frango inteiro", priceCents: 5000, imageUrl: null });
    expect(result).toHaveLength(2);
  });

  it("reidrata o carrinho previamente salvo quando o cliente retorna ao checkout após o login", () => {
    const beforeLogin = addCartLine([], combo);
    const persisted = JSON.parse(JSON.stringify(beforeLogin));
    expect(hydrateCart(persisted)).toEqual(beforeLogin);
  });
});
