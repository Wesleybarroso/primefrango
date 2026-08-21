export type AdminView =
  | "dashboard"
  | "pedidos"
  | "mapa"
  | "cardapio"
  | "promocoes"
  | "cupons"
  | "avaliacoes"
  | "clientes"
  | "financeiro"
  | "integracoes"
  | "marketing"
  | "operacoes";

export type PublicView = "inicio" | "cardapio" | "quem-somos" | "acompanhar" | "acesso" | "conta" | "checkout";
export type AccessIntent = "customer" | "admin";

export const publicRoutes: Record<PublicView, string> = {
  inicio: "/",
  cardapio: "/cardapio",
  "quem-somos": "/quem-somos",
  acompanhar: "/acompanhar-pedido",
  acesso: "/acesso",
  conta: "/minha-conta",
  checkout: "/checkout",
};

export const adminViews: AdminView[] = [
  "dashboard",
  "pedidos",
  "mapa",
  "cardapio",
  "promocoes",
  "cupons",
  "avaliacoes",
  "clientes",
  "financeiro",
  "integracoes",
  "marketing",
  "operacoes",
];

export function publicViewFromPath(path: string): PublicView {
  const clean = path.replace(/\/+$/, "") || "/";
  if (clean === "/cardapio") return "cardapio";
  if (clean === "/quem-somos") return "quem-somos";
  if (clean === "/acompanhar-pedido") return "acompanhar";
  if (clean === "/acesso") return "acesso";
  if (clean === "/minha-conta") return "conta";
  if (clean === "/checkout") return "checkout";
  return "inicio";
}

export function adminViewFromPath(path: string): AdminView {
  const view = path.replace(/^\/admin\/?/, "").replace(/\/+$/, "") as AdminView;
  return adminViews.includes(view) ? view : "dashboard";
}

export function postLoginDestination(intent: AccessIntent, role: "user" | "admin" | undefined): string {
  return intent === "admin" && role === "admin" ? "/admin/dashboard" : "/minha-conta";
}

export function resolvePostLoginPath(returnPath: string | null, intent: AccessIntent | null, role: "user" | "admin" | undefined): string | null {
  if (returnPath && returnPath.startsWith("/")) return returnPath;
  return intent ? postLoginDestination(intent, role) : null;
}
