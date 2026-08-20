import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { encryptCredential, maskCredential } from "./credentials";
import { getSessionCookieOptions } from "./_core/cookies";
import { createPromotion, listIntegrationSettings, listPromotions, listPublicPromotions, removePromotion, saveIntegrationSetting, setPromotionStatus, updatePromotion } from "./db";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const integrationProviderSchema = z.enum(["stripe", "mercado_pago", "google_maps", "whatsapp", "email", "assistant_ia"]);
const promotionStatusSchema = z.enum(["draft", "active", "archived"]);
const promotionInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(8).max(600),
  badge: z.string().trim().max(48).optional().or(z.literal("")),
  originalPriceCents: z.number().int().positive(),
  salePriceCents: z.number().int().positive().nullable().optional(),
  imageUrls: z.array(z.string().startsWith("/manus-storage/")).max(3).default([]),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  status: promotionStatusSchema,
}).refine((value) => !value.startsAt || !value.endsAt || value.endsAt >= value.startsAt, {
  message: "O fim da vigência deve ser posterior ao início.",
  path: ["endsAt"],
}).refine((value) => !value.salePriceCents || value.salePriceCents < value.originalPriceCents, {
  message: "O preço promocional precisa ser menor que o preço original.",
  path: ["salePriceCents"],
});

const promotionImageSchema = z.object({ dataUrl: z.string().min(32).max(7_000_000) });
const promotionImageDataUrl = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

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
  promotions: router({
    publicList: publicProcedure.query(async () => listPublicPromotions()),
    list: adminProcedure.query(async () => listPromotions()),
    uploadImages: adminProcedure.input(z.object({ images: z.array(promotionImageSchema).min(1).max(3) })).mutation(async ({ ctx, input }) => {
      const images = await Promise.all(input.images.map(async ({ dataUrl }, index) => {
        const match = promotionImageDataUrl.exec(dataUrl);
        if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Envie somente imagens PNG, JPEG ou WebP." });
        const [, contentType, base64] = match;
        const bytes = Buffer.from(base64, "base64");
        if (bytes.byteLength > 5 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Cada imagem deve ter no máximo 5 MB." });
        const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
        return storagePut(`promotions/${ctx.user.id}/combo-${Date.now()}-${index}.${extension}`, bytes, contentType);
      }));
      return { images };
    }),
    create: adminProcedure.input(promotionInputSchema).mutation(async ({ input }) => {
      const id = await createPromotion({ ...input, badge: input.badge || null });
      return { id };
    }),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), data: promotionInputSchema })).mutation(async ({ input }) => {
      await updatePromotion(input.id, { ...input.data, badge: input.data.badge || null });
      return { success: true } as const;
    }),
    setStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: promotionStatusSchema })).mutation(async ({ input }) => {
      await setPromotionStatus(input.id, input.status);
      return { success: true } as const;
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await removePromotion(input.id);
      return { success: true } as const;
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
