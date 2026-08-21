import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { encryptCredential, maskCredential } from "./credentials";
import { getSessionCookieOptions } from "./_core/cookies";
import { createCoupon, createMenuCategory, createMenuItem, createPromotion, getGoogleMetricsSettings, getMenuCategoryById, getPublicStripePaymentLink, listCoupons, listEmailDeliverySettings, listIntegrationSettings, listMenuCategories, listMenuItems, listPromotions, listPublicMenuCatalog, listPublicPromotions, removeCoupon, removeMenuCategory, removeMenuItem, removePromotion, saveEmailDeliverySetting, saveGoogleMetricsSettings, saveIntegrationSetting, setCouponStatus, setPromotionStatus, updateCoupon, updateMenuCategory, updateMenuItem, updatePromotion } from "./db";
import { sendEmailConnectionTest } from "./emailDelivery";
import { storagePut } from "./storage";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";

const integrationProviderSchema = z.enum(["stripe", "mercado_pago", "pagbank", "google_maps", "whatsapp", "email", "assistant_ia"]);
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
const couponStatusSchema = z.enum(["draft", "active", "archived"]);
const couponInputSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/, "Use de 3 a 32 letras, números, hífen ou sublinhado."),
  description: z.string().trim().max(180).optional().or(z.literal("")),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().int().positive(),
  minimumOrderCents: z.number().int().min(0),
  maxUses: z.number().int().positive().nullable().optional(),
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  status: couponStatusSchema,
}).refine((value) => value.discountType !== "percentage" || value.discountValue <= 100, {
  message: "O desconto percentual deve estar entre 1% e 100%.", path: ["discountValue"],
}).refine((value) => !value.startsAt || !value.endsAt || value.endsAt >= value.startsAt, {
  message: "O fim da vigência deve ser posterior ao início.", path: ["endsAt"],
});
const emailDeliverySchema = z.object({
  provider: z.enum(["resend", "smtp"]),
  senderName: z.string().trim().min(2).max(120),
  senderEmail: z.string().trim().email().max(320),
  replyToEmail: z.string().trim().email().max(320).optional().or(z.literal("")),
  secret: z.string().trim().min(4).max(4096),
  smtpHost: z.string().trim().max(320).optional().or(z.literal("")),
  smtpPort: z.number().int().min(1).max(65535).optional().nullable(),
  smtpUsername: z.string().trim().max(320).optional().or(z.literal("")),
  notifications: z.object({ login: z.boolean(), passwordReset: z.boolean(), passwordChanged: z.boolean(), orderUpdates: z.boolean(), errors: z.boolean(), discounts: z.boolean() }),
}).superRefine((value, context) => {
  if (value.provider === "smtp" && !value.smtpHost) context.addIssue({ code: z.ZodIssueCode.custom, path: ["smtpHost"], message: "Informe o servidor SMTP." });
  if (value.provider === "smtp" && !value.smtpPort) context.addIssue({ code: z.ZodIssueCode.custom, path: ["smtpPort"], message: "Informe a porta SMTP." });
  if (value.provider === "smtp" && !value.smtpUsername) context.addIssue({ code: z.ZodIssueCode.custom, path: ["smtpUsername"], message: "Informe o usuário SMTP." });
});

const googleMetricsSchema = z.object({ gaMeasurementId: z.string().trim().regex(/^G-[A-Z0-9]+$/, "Use um ID GA4 no formato G-XXXXXXXX.").optional().or(z.literal("")), gtmContainerId: z.string().trim().regex(/^GTM-[A-Z0-9]+$/, "Use um contêiner GTM no formato GTM-XXXXXX.").optional().or(z.literal("")), searchConsoleProperty: z.string().trim().url().max(2048).optional().or(z.literal("")), searchConsoleVerification: z.string().trim().max(512).optional().or(z.literal("")) });
const menuCategorySchema = z.object({ name: z.string().trim().min(2).max(64), isActive: z.boolean(), sortOrder: z.number().int().min(0).max(999) });
const menuItemSchema = z.object({ categoryId: z.number().int().positive(), title: z.string().trim().min(2).max(120), description: z.string().trim().max(600).optional().or(z.literal("")), priceCents: z.number().int().positive(), imageUrl: z.string().startsWith("/manus-storage/").optional().or(z.literal("")), isAvailable: z.boolean(), sortOrder: z.number().int().min(0).max(999) });

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
      paymentLink: z.string().url().max(2048).optional().or(z.literal("")),
      webhookUrl: z.string().url().max(2048).optional().or(z.literal("")),
      webhookSecret: z.string().max(4096).optional(),
    })).mutation(async ({ input }) => {
      await saveIntegrationSetting({
        provider: input.provider,
        label: input.label,
        maskedSecret: maskCredential(input.secret),
        secretCiphertext: encryptCredential(input.secret),
        paymentLink: input.paymentLink || undefined,
        webhookUrl: input.webhookUrl || undefined,
        webhookCiphertext: input.webhookSecret ? encryptCredential(input.webhookSecret) : undefined,
      });
      return { provider: input.provider, configured: true, maskedSecret: maskCredential(input.secret) };
    }),
  }),
  emailDelivery: router({
    list: adminProcedure.query(async () => listEmailDeliverySettings()),
    save: adminProcedure.input(emailDeliverySchema).mutation(async ({ input }) => {
      await saveEmailDeliverySetting({ provider: input.provider, senderName: input.senderName, senderEmail: input.senderEmail, replyToEmail: input.replyToEmail || null, secretCiphertext: encryptCredential(input.secret), maskedSecret: maskCredential(input.secret), smtpHost: input.provider === "smtp" ? input.smtpHost || null : null, smtpPort: input.provider === "smtp" ? input.smtpPort || null : null, smtpUsernameCiphertext: input.provider === "smtp" ? encryptCredential(input.smtpUsername || "") : null, smtpUsernameMasked: input.provider === "smtp" ? maskCredential(input.smtpUsername || "") : null, notificationsJson: JSON.stringify(input.notifications) });
      return { provider: input.provider, configured: true } as const;
    }),
    sendTest: adminProcedure.input(z.object({ provider: z.enum(["resend", "smtp"]), recipient: z.string().trim().email().max(320) })).mutation(async ({ input }) => sendEmailConnectionTest(input)),
  }),
  payments: router({
    availableProviders: publicProcedure.query(async () => {
      const settings = await listIntegrationSettings();
      return settings
        .filter((item) => item.isEnabled && (item.provider === "stripe" || item.provider === "mercado_pago" || item.provider === "pagbank"))
        .map((item) => ({ provider: item.provider, label: item.label }));
    }),
    hostedStripeLink: publicProcedure.query(async () => ({ url: await getPublicStripePaymentLink() })),
  }),
  googleMetrics: router({
    publicConfig: publicProcedure.query(async () => { const setting = await getGoogleMetricsSettings(); return setting ? { gaMeasurementId: setting.gaMeasurementId, gtmContainerId: setting.gtmContainerId, searchConsoleVerification: setting.searchConsoleVerification, isEnabled: setting.isEnabled } : null; }),
    adminConfig: adminProcedure.query(async () => getGoogleMetricsSettings()),
    save: adminProcedure.input(googleMetricsSchema).mutation(async ({ input }) => ({ id: await saveGoogleMetricsSettings({ gaMeasurementId: input.gaMeasurementId || null, gtmContainerId: input.gtmContainerId || null, searchConsoleProperty: input.searchConsoleProperty || null, searchConsoleVerification: input.searchConsoleVerification || null }) })),
  }),
  menu: router({
    publicCatalog: publicProcedure.query(async () => listPublicMenuCatalog()),
    adminCatalog: adminProcedure.query(async () => ({ categories: await listMenuCategories(), items: await listMenuItems() })),
    uploadImage: adminProcedure.input(promotionImageSchema).mutation(async ({ ctx, input }) => {
      const match = promotionImageDataUrl.exec(input.dataUrl);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Envie somente imagens PNG, JPEG ou WebP." });
      const [, contentType, base64] = match;
      const bytes = Buffer.from(base64, "base64");
      if (bytes.byteLength > 5 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "A imagem deve ter no máximo 5 MB." });
      const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
      return storagePut(`menu/${ctx.user.id}/item-${Date.now()}.${extension}`, bytes, contentType);
    }),
    createCategory: adminProcedure.input(menuCategorySchema).mutation(async ({ input }) => ({ id: await createMenuCategory(input) })),
    updateCategory: adminProcedure.input(z.object({ id: z.number().int().positive(), data: menuCategorySchema })).mutation(async ({ input }) => { await updateMenuCategory(input.id, input.data); return { success: true } as const; }),
    removeCategory: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await removeMenuCategory(input.id); return { success: true } as const; }),
    createItem: adminProcedure.input(menuItemSchema).mutation(async ({ input }) => { if (!await getMenuCategoryById(input.categoryId)) throw new TRPCError({ code: "BAD_REQUEST", message: "A categoria selecionada não existe mais. Atualize o Cardápio e tente novamente." }); return { id: await createMenuItem({ ...input, description: input.description || null, imageUrl: input.imageUrl || null }) }; }),
    updateItem: adminProcedure.input(z.object({ id: z.number().int().positive(), data: menuItemSchema })).mutation(async ({ input }) => { if (!await getMenuCategoryById(input.data.categoryId)) throw new TRPCError({ code: "BAD_REQUEST", message: "A categoria selecionada não existe mais. Atualize o Cardápio e tente novamente." }); await updateMenuItem(input.id, { ...input.data, description: input.data.description || null, imageUrl: input.data.imageUrl || null }); return { success: true } as const; }),
    removeItem: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await removeMenuItem(input.id); return { success: true } as const; }),
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
  coupons: router({
    list: adminProcedure.query(async () => listCoupons()),
    create: adminProcedure.input(couponInputSchema).mutation(async ({ input }) => ({ id: await createCoupon({ ...input, description: input.description || null }) })),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), data: couponInputSchema })).mutation(async ({ input }) => { await updateCoupon(input.id, { ...input.data, description: input.data.description || null }); return { success: true } as const; }),
    setStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: couponStatusSchema })).mutation(async ({ input }) => { await setCouponStatus(input.id, input.status); return { success: true } as const; }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { await removeCoupon(input.id); return { success: true } as const; }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
