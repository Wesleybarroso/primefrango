import { describe, expect, it } from "vitest";
import { metadataForPath } from "./seo";

describe("metadataForPath", () => {
  it("returns indexable metadata for the public landing page", () => {
    const metadata = metadataForPath("/");
    expect(metadata.noindex).toBeUndefined();
    expect(metadata.structuredData).toMatchObject({ "@type": "Organization", name: "Prime Frango Assado" });
  });

  it("marks client and admin pages as non-indexable", () => {
    expect(metadataForPath("/checkout").noindex).toBe(true);
    expect(metadataForPath("/admin/financeiro").noindex).toBe(true);
  });
});
