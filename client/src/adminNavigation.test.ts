import { describe, expect, it } from "vitest";
import { adminViews, adminViewFromPath } from "./navigation";

describe("navegação da lateral administrativa", () => {
  it("resolve todos os módulos da lateral em uma rota administrativa válida", () => {
    expect(adminViews).toHaveLength(12);
    expect(new Set(adminViews).size).toBe(adminViews.length);
    for (const view of adminViews) expect(adminViewFromPath(`/admin/${view}`)).toBe(view);
  });

  it("retorna ao dashboard somente para uma rota administrativa desconhecida", () => {
    expect(adminViewFromPath("/admin/modulo-inexistente")).toBe("dashboard");
  });
});
