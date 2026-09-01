import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { metadataForPath, SITE_NAME, SITE_ORIGIN, type PageMetadata } from "../../client/src/seo";

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function buildHead(meta: PageMetadata) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonical = `${SITE_ORIGIN}${meta.canonicalPath}`;
  const image = `${SITE_ORIGIN}/manus-storage/prime-frango-logo-3d_7921a8ac.png`;
  const structured = meta.structuredData ? `<script type="application/ld+json">${JSON.stringify(meta.structuredData).replace(/</g, "\\u003c")}</script>` : "";
  return [`<title>${title}</title>`, `<meta name="description" content="${description}" />`, `<meta property="og:type" content="website" />`, `<meta property="og:title" content="${title}" />`, `<meta property="og:description" content="${description}" />`, `<meta property="og:url" content="${canonical}" />`, `<meta property="og:site_name" content="${SITE_NAME}" />`, `<meta property="og:image" content="${image}" />`, `<meta property="og:image:alt" content="Logo Prime Frango Assado" />`, `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:title" content="${title}" />`, `<meta name="twitter:description" content="${description}" />`, `<meta name="twitter:image" content="${image}" />`, `<link rel="canonical" href="${canonical}" />`, meta.noindex ? `<meta name="robots" content="noindex, follow" />` : `<meta name="robots" content="index, follow" />`, structured].join("\n");
}

function composeHtml(template: string, appHtml: string, meta: PageMetadata) {
  return template.replace("<!--app-head-->", () => buildHead(meta)).replace("<!--app-html-->", () => appHtml);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/entry-client.tsx"`, `src="/src/entry-client.tsx?v=${nanoid()}"`);
      template = await vite.transformIndexHtml(url, template);
      template = template.replace("</head>", `<link rel="stylesheet" href="/src/index.css?direct" data-ssr-dev-css></head>`);
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
      const { html, head } = render(url);
      res.status(head.noindex && !url.startsWith("/admin") && url !== "/acesso" && url !== "/checkout" && url !== "/acompanhar-pedido" ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, html, head));
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use((req, res, next) => {
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (req.path !== "/" && /\/+$/.test(req.path)) return res.redirect(301, req.path.replace(/\/+$/, "") || "/");
    next();
  });
  app.use(express.static(distPath, { index: false, redirect: false }));
  app.use("*", async (req, res) => {
    const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
    try {
      const serverEntry = path.resolve(import.meta.dirname, "server-ssr", "entry-server.js");
      const { render } = await import(serverEntry);
      const { html, head } = render(req.originalUrl);
      const requestedPath = req.originalUrl.split("?")[0].replace(/\/+$/, "") || "/";
      const status = head.noindex && !requestedPath.startsWith("/admin") && !["/acesso", "/checkout", "/acompanhar-pedido"].includes(requestedPath) ? 404 : 200;
      res.status(status).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, html, head));
    } catch (error) {
      console.error("[SSR] render failed, serving shell:", error);
      res.status(200).set({ "Content-Type": "text/html", "Cache-Control": "no-cache" }).end(composeHtml(template, "", metadataForPath("/")));
    }
  });
}
