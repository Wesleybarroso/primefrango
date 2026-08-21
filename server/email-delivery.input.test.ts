import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const caller = appRouter.createCaller({ user: { role: "admin" }, req: {}, res: {} } as any);

const baseInput = {
  provider: "smtp" as const,
  senderName: "Prime Frango Assado",
  senderEmail: "pedidos@primefrango.com",
  replyToEmail: "",
  secret: "senha-segura",
  smtpHost: "smtp.primefrango.com",
  smtpPort: 587,
  smtpUsername: "pedidos@primefrango.com",
  notifications: { login: true, passwordReset: true, passwordChanged: true, orderUpdates: true, errors: true, discounts: true },
};

describe("validação de integrações de e-mail", () => {
  it("rejeita SMTP sem servidor configurado", async () => {
    await expect(caller.emailDelivery.save({ ...baseInput, smtpHost: "" })).rejects.toThrow("Informe o servidor SMTP.");
  });

  it("rejeita remetente em formato inválido", async () => {
    await expect(caller.emailDelivery.save({ ...baseInput, senderEmail: "email-invalido" })).rejects.toBeDefined();
  });
});
