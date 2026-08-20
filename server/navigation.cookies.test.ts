import { describe, expect, it } from "vitest";
import { readCookiePreference, saveCookiePreference, type PreferenceStorage } from "../client/src/cookiePreferences";
import { adminViewFromPath, postLoginDestination, publicRoutes, publicViewFromPath } from "../client/src/navigation";

function createStorage(): PreferenceStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe("navegação e preferências persistentes", () => {
  it("mapeia as rotas públicas, inclusive com barra final", () => {
    expect(publicViewFromPath("/cardapio/")).toBe("cardapio");
    expect(publicViewFromPath("/quem-somos")).toBe("quem-somos");
    expect(publicViewFromPath("/minha-conta")).toBe("conta");
    expect(publicViewFromPath("/rota-inexistente")).toBe("inicio");
    expect(publicRoutes.checkout).toBe("/checkout");
  });

  it("mapeia cada módulo administrativo e usa dashboard como fallback", () => {
    expect(adminViewFromPath("/admin/avaliacoes")).toBe("avaliacoes");
    expect(adminViewFromPath("/admin/operacoes/")).toBe("operacoes");
    expect(adminViewFromPath("/admin/sem-rota")).toBe("dashboard");
  });

  it("encaminha cada perfil autenticado para a área correta", () => {
    expect(postLoginDestination("customer", "user")).toBe("/minha-conta");
    expect(postLoginDestination("admin", "user")).toBe("/minha-conta");
    expect(postLoginDestination("admin", "admin")).toBe("/admin/dashboard");
  });

  it("persiste e recupera a escolha de cookies após uma nova leitura", () => {
    const storage = createStorage();

    expect(readCookiePreference(storage)).toBeNull();
    saveCookiePreference(storage, "necessary");
    expect(readCookiePreference(storage)).toBe("necessary");
    saveCookiePreference(storage, "accepted");
    expect(readCookiePreference(storage)).toBe("accepted");
  });
});
