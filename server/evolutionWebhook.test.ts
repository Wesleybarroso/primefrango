import { describe, expect, it } from "vitest";
import { evolutionEventType, isValidEvolutionWebhookToken } from "./evolutionWebhook";

describe("webhook Evolution Go", () => {
  it("aceita apenas a chave esperada", () => {
    expect(isValidEvolutionWebhookToken("chave-correta", "chave-correta")).toBe(true);
    expect(isValidEvolutionWebhookToken("chave-errada", "chave-correta")).toBe(false);
    expect(isValidEvolutionWebhookToken(undefined, "chave-correta")).toBe(false);
  });

  it("registra somente o tipo do evento recebido", () => {
    expect(evolutionEventType({ event: "messages.upsert", data: { text: "conteúdo privado" } })).toBe("messages.upsert");
  });
});
