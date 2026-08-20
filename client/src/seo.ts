export type PageMetadata = { title: string; description: string; canonicalPath: string; noindex?: boolean; structuredData?: Record<string, unknown> };

export const SITE_ORIGIN = "https://parallax3d-d74b7sph.manus.space";
export const SITE_NAME = "Prime Frango Assado";
const defaultDescription = "Prime Frango Assado: cardápio, pedido, área de entrega e acompanhamento em uma experiência organizada.";
const businessSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/manus-storage/prime-frango-logo-3d_7921a8ac.png`,
  description: defaultDescription,
};

export function metadataForPath(pathname: string): PageMetadata {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return { title: "Prime Frango Assado | Frango assado, cardápio e entrega", description: defaultDescription, canonicalPath: "/", structuredData: businessSchema };
  if (path === "/cardapio") return { title: "Cardápio | Prime Frango Assado", description: "Consulte o cardápio e organize seu pedido de frango assado, bebidas e acompanhamentos.", canonicalPath: "/cardapio" };
  if (path === "/quem-somos") return { title: "Quem Somos | Prime Frango Assado", description: "Conheça a proposta da Prime Frango Assado, do preparo ao pedido e à entrega.", canonicalPath: "/quem-somos" };
  if (path === "/acompanhar-pedido") return { title: "Acompanhar pedido | Prime Frango Assado", description: "Acesse sua conta para acompanhar o status do pedido e a entrega quando disponível.", canonicalPath: "/acompanhar-pedido", noindex: true };
  if (path === "/acesso") return { title: "Entrar ou criar conta | Prime Frango Assado", description: "Acesse sua conta de cliente para finalizar pedidos e consultar o histórico.", canonicalPath: "/acesso", noindex: true };
  if (path === "/checkout") return { title: "Checkout | Prime Frango Assado", description: "Revise o pedido, o endereço, a cobertura e o pagamento.", canonicalPath: "/checkout", noindex: true };
  if (path === "/admin" || path.startsWith("/admin/")) return { title: "Painel administrativo | Prime Frango Assado", description: "Área administrativa protegida da Prime Frango Assado.", canonicalPath: path, noindex: true };
  return { title: "Página não encontrada | Prime Frango Assado", description: defaultDescription, canonicalPath: path, noindex: true };
}
