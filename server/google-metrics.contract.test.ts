import { describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({ getGoogleMetricsSettings: vi.fn() }));

vi.mock("./db", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./db")>()),
  ...dbMocks,
}));

import { appRouter } from "./routers";

const adminCaller = appRouter.createCaller({ user: { role: "admin" }, req: {}, res: {} } as any);

describe("contrato administrativo de métricas Google", () => {
  it("retorna nulo explícito antes da primeira configuração", async () => {
    dbMocks.getGoogleMetricsSettings.mockResolvedValue(undefined);
    await expect(adminCaller.googleMetrics.adminConfig()).resolves.toBeNull();
  });
});
