import { appRouter } from "./routers";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const caller = appRouter.createCaller({ user: { role: "admin" }, req: {}, res: {} } as any);

describe("validação de métricas Google", () => {
  it("rejeita identificadores GA4 e GTM malformados antes de gravar", async () => {
    await expect(caller.googleMetrics.save({ gaMeasurementId: "UA-123", gtmContainerId: "", searchConsoleProperty: "", searchConsoleVerification: "" })).rejects.toBeDefined();
    await expect(caller.googleMetrics.save({ gaMeasurementId: "", gtmContainerId: "GTM inválido", searchConsoleProperty: "", searchConsoleVerification: "" })).rejects.toBeDefined();
  });

  it("rejeita propriedade Search Console que não é URL", async () => {
    await expect(caller.googleMetrics.save({ gaMeasurementId: "", gtmContainerId: "", searchConsoleProperty: "dominio-sem-protocolo", searchConsoleVerification: "" })).rejects.toBeDefined();
  });
});
