import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getPrivateIntegrationSetting } from "../db";
import { decryptCredential } from "../credentials";
import { evolutionEventType, isValidEvolutionWebhookToken } from "../evolutionWebhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.post("/api/webhooks/evolution", async (req, res) => {
    try {
      const setting = await getPrivateIntegrationSetting("whatsapp");
      if (!setting?.isEnabled) return res.status(503).json({ error: "Integração WhatsApp indisponível" });
      const token = req.header("apikey") || req.header("x-api-key") || req.header("authorization")?.replace(/^Bearer\s+/i, "");
      if (!isValidEvolutionWebhookToken(token, decryptCredential(setting.secretCiphertext))) return res.status(401).json({ error: "Assinatura inválida" });
      console.info("[Evolution] Evento recebido", { event: evolutionEventType(req.body) });
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("[Evolution] Webhook processing failed", error);
      return res.status(500).json({ error: "Não foi possível processar o evento" });
    }
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
