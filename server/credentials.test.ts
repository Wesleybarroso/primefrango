import { describe, expect, it } from "vitest";
import { decryptCredential, encryptCredential, maskCredential } from "./credentials";

describe("proteção de credenciais", () => {
  it("cifra e recupera uma chave sem expor seu valor no texto cifrado", () => {
    const original = "TEST-SECRET-123456";
    const encrypted = encryptCredential(original);
    expect(encrypted).not.toContain(original);
    expect(decryptCredential(encrypted)).toBe(original);
  });

  it("exibe apenas os últimos caracteres em interfaces administrativas", () => {
    expect(maskCredential("APP_USR-1234")).toBe("••••••••1234");
  });
});
