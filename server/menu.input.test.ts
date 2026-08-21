import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const caller = appRouter.createCaller({ user: { role: "admin" }, req: {}, res: {} } as any);
const baseItem = { categoryId: 1, title: "Frango assado inteiro", description: "Frango assado tradicional", priceCents: 4990, imageUrl: "", isAvailable: true, sortOrder: 0 };

describe("validação do Cardápio", () => {
  it("rejeita item sem preço comercial válido", async () => {
    await expect(caller.menu.createItem({ ...baseItem, priceCents: 0 })).rejects.toBeDefined();
  });

  it("rejeita item associado a categoria inexistente", async () => {
    await expect(caller.menu.createItem({ ...baseItem, categoryId: 999_999 })).rejects.toMatchObject({
      message: "A categoria selecionada não existe mais. Atualize o Cardápio e tente novamente.",
    });
  });

  it("rejeita URL de imagem fora do armazenamento do projeto", async () => {
    await expect(caller.menu.createItem({ ...baseItem, imageUrl: "https://exemplo.com/foto.jpg" })).rejects.toBeDefined();
  });
});
