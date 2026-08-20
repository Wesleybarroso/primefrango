import { describe, expect, it } from "vitest";
import { metadataForPath } from "../client/src/seo";

describe("SEO e rotas públicas", () => {
  it("mantém a página inicial indexável e com dados estruturados institucionais", () => {
    const metadata = metadataForPath("/");

    expect(metadata.noindex).toBeUndefined();
    expect(metadata.canonicalPath).toBe("/");
    expect(metadata.structuredData).toMatchObject({
      "@type": "Organization",
      name: "Prime Frango Assado",
    });
  });

  it("mantém páginas de compra e administração fora do índice", () => {
    expect(metadataForPath("/checkout").noindex).toBe(true);
    expect(metadataForPath("/acesso").noindex).toBe(true);
    expect(metadataForPath("/admin/financeiro").noindex).toBe(true);
  });

  it("mantém cardápio e quem somos como páginas públicas canônicas", () => {
    expect(metadataForPath("/cardapio").canonicalPath).toBe("/cardapio");
    expect(metadataForPath("/quem-somos").canonicalPath).toBe("/quem-somos");
  });
});
