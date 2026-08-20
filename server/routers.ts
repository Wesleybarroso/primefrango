import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { encryptCredential, maskCredential } from "./credentials";
import { getSessionCookieOptions } from "./_core/cookies";
import { listIntegrationSettings, saveIntegrationSetting } from "./db";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const integrationProviderSchema = z.enum(["stripe", "mercado_pago", "google_maps", "whatsapp", "email", "assistant_ia"]);

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  integrations: router({
    list: adminProcedure.query(async () => listIntegrationSettings()),
    saveCredential: adminProcedure.input(z.object({
      provider: integrationProviderSchema,
      label: z.string().min(2).max(80),
      secret: z.string().min(8).max(4096),
      webhookUrl: z.string().url().max(2048).optional().or(z.literal("")),
      webhookSecret: z.string().max(4096).optional(),
    })).mutation(async ({ input }) => {
      await saveIntegrationSetting({
        provider: input.provider,
        label: input.label,
        maskedSecret: maskCredential(input.secret),
        secretCiphertext: encryptCredential(input.secret),
        webhookUrl: input.webhookUrl || undefined,
        webhookCiphertext: input.webhookSecret ? encryptCredential(input.webhookSecret) : undefined,
      });
      return { provider: input.provider, configured: true, maskedSecret: maskCredential(input.secret) };
    }),
  }),
  payments: router({
    availableProviders: publicProcedure.query(async () => {
      const settings = await listIntegrationSettings();
      return settings
        .filter((item) => item.isEnabled && (item.provider === "stripe" || item.provider === "mercado_pago"))
        .map((item) => ({ provider: item.provider, label: item.label }));
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
