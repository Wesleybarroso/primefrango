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

export type PublicView = "inicio" | "cardapio" | "quem-somos" | "acompanhar" | "acesso" | "checkout";

export const publicRoutes: Record<PublicView, string> = {
  inicio: "/",
  cardapio: "/cardapio",
  "quem-somos": "/quem-somos",
  acompanhar: "/acompanhar-pedido",
  acesso: "/acesso",
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
  if (clean === "/checkout") return "checkout";
  return "inicio";
}

export function adminViewFromPath(path: string): AdminView {
  const view = path.replace(/^\/admin\/?/, "").replace(/\/+$/, "") as AdminView;
  return adminViews.includes(view) ? view : "dashboard";
}
