import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Cookie,
  CreditCard,
  FileText,
  HeartHandshake,
  ImagePlus,
  LayoutDashboard,
  MapPinned,
  Menu,
  MessageCircle,
  MessageSquareHeart,
  Package,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Star,
  Tags,
  Trash2,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./_core/hooks/useAuth";
import { startLogin } from "./const";
import { readCookiePreference, saveCookiePreference, type CookiePreference } from "./cookiePreferences";
import { trpc } from "./lib/trpc";
import { adminViewFromPath, publicRoutes, publicViewFromPath, resolvePostLoginPath, type AccessIntent, type AdminView, type PublicView } from "./navigation";
import { addCartLine, changeCartQuantity, hydrateCart, type CartLine } from "./cart";

const logo = "/manus-storage/prime-frango-logo-3d_7921a8ac.png";
const ACCESS_INTENT_KEY = "prime-frango-access-intent";
const POST_LOGIN_PATH_KEY = "prime-frango-post-login-path";
const CART_STORAGE_KEY = "prime-frango-cart";

function readCart() { if (typeof window === "undefined") return [] as CartLine[]; try { return hydrateCart(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]")); } catch { return [] as CartLine[]; } }

function startRoleLogin(intent: AccessIntent) {
  if (typeof window !== "undefined") sessionStorage.setItem(ACCESS_INTENT_KEY, intent);
  startLogin();
}

function startCheckoutLogin() {
  if (typeof window !== "undefined") window.sessionStorage.setItem(POST_LOGIN_PATH_KEY, "/checkout");
  startLogin();
}

const adminItems: { label: string; view: AdminView; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", view: "dashboard", icon: LayoutDashboard },
  { label: "Pedidos", view: "pedidos", icon: ClipboardList },
  { label: "Mapa Operacional", view: "mapa", icon: MapPinned },
  { label: "Cardápio", view: "cardapio", icon: Package },
  { label: "Promoções", view: "promocoes", icon: Tags },
  { label: "Cupons", view: "cupons", icon: ReceiptText },
  { label: "Avaliações", view: "avaliacoes", icon: Star },
  { label: "Clientes", view: "clientes", icon: UsersRound },
  { label: "Financeiro", view: "financeiro", icon: CircleDollarSign },
  { label: "Integrações", view: "integracoes", icon: Settings2 },
  { label: "Marketing", view: "marketing", icon: MessageSquareHeart },
  { label: "Operações", view: "operacoes", icon: ClipboardList },
];

export default function App() {
  const [location, navigate] = useLocation();
  const currentPath = location.split("?")[0].replace(/\/+$/, "") || "/";
  const isAdmin = currentPath === "/admin" || currentPath.startsWith("/admin/");

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [currentPath]);

  return (
    <>
      <AuthReturn navigate={navigate} />
      {isAdmin ? <AdminGate view={adminViewFromPath(currentPath)} navigate={navigate} /> : <PublicShell view={publicViewFromPath(currentPath)} navigate={navigate} />}
      <CookieBanner />
    </>
  );
}

function AuthReturn({ navigate }: { navigate: (path: string) => void }) {
  const { user, isAuthenticated, loading } = useAuth();
  useEffect(() => {
    if (loading || !isAuthenticated || typeof window === "undefined") return;
    const returnPath = sessionStorage.getItem(POST_LOGIN_PATH_KEY);
    const intent = sessionStorage.getItem(ACCESS_INTENT_KEY);
    const destination = resolvePostLoginPath(returnPath, intent as AccessIntent | null, user?.role);
    if (!destination) return;
    sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
    sessionStorage.removeItem(ACCESS_INTENT_KEY);
    navigate(destination);
  }, [isAuthenticated, loading, navigate, user?.role]);
  return null;
}

function PublicShell({ view, navigate }: { view: PublicView; navigate: (path: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>(readCart);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }, [cart]);
  const go = (next: PublicView) => {
    setMenuOpen(false);
    navigate(publicRoutes[next]);
  };

  return (
    <div className="public-site">
      <header className="public-header">
        <button className="brand-button" onClick={() => go("inicio")} aria-label="Ir para a página inicial" type="button"><img src={logo} alt="Prime Frango Assado" /></button>
        <button className="mobile-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Abrir menu principal">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={menuOpen ? "public-nav is-open" : "public-nav"} aria-label="Navegação principal">
          <button className={view === "inicio" ? "current" : ""} onClick={() => go("inicio")} type="button">Início</button>
          <button className={view === "cardapio" ? "current" : ""} onClick={() => go("cardapio")} type="button">Cardápio</button>
          <button className={view === "quem-somos" ? "current" : ""} onClick={() => go("quem-somos")} type="button">Quem Somos</button>
          <button className={view === "acompanhar" ? "current" : ""} onClick={() => go("acompanhar")} type="button">Acompanhar pedido</button>
          <div className="mobile-public-actions"><button className="public-login" onClick={() => go("acesso")} type="button">Entrar</button><button className="public-order" onClick={() => go("cardapio")} type="button">Pedir agora</button></div>
        </nav>
        <div className="desktop-public-actions"><button className="public-login" onClick={() => go("acesso")} type="button">Entrar</button><button className="public-order" onClick={() => go("cardapio")} type="button">Pedir agora</button></div>
      </header>
      {view === "inicio" && <LandingPage go={go} />}
      {view === "cardapio" && <MenuPage go={go} cart={cart} setCart={setCart} />}
      {view === "quem-somos" && <AboutPage go={go} />}
      {view === "acompanhar" && <TrackingPage go={go} />}
      {view === "acesso" && <AccessPage go={go} />}
      {view === "conta" && <AccountPage go={go} />}
      {view === "checkout" && <CheckoutPage go={go} cart={cart} setCart={setCart} />}
      <footer className="landing-footer"><img src={logo} alt="Prime Frango Assado" /><button onClick={() => go("cardapio")} type="button">Cardápio</button><button onClick={() => go("quem-somos")} type="button">Quem Somos</button><button onClick={() => go("acompanhar")} type="button">Acompanhar pedido</button><button onClick={() => go("acesso")} type="button">Minha conta</button></footer>
    </div>
  );
}

function LandingPage({ go }: { go: (view: PublicView) => void }) {
  return <main>
    <section className="landing-hero">
      <div><p className="eyebrow">PRIME FRANGO ASSADO · BELÉM</p><h1>Frango assado, pedido simples e entrega acompanhada.</h1><p>Escolha no cardápio, valide a área de entrega e acompanhe cada etapa do pedido com uma experiência feita para a Prime Frango Assado.</p><div className="hero-actions"><button className="hero-primary" onClick={() => go("cardapio")} type="button">Pedir agora <ArrowRight size={15} /></button><button className="hero-secondary" onClick={() => go("quem-somos")} type="button">Conheça a marca</button></div><div className="hero-badges"><span>Cardápio atualizado</span><span>Entrega por área</span><span>Pedido acompanhado</span></div></div>
      <div className="hero-product" aria-label="Identidade visual tridimensional da Prime Frango Assado"><img src={logo} alt="Logo 3D da Prime Frango Assado" /><i /><span>3D</span></div>
    </section>
    <section className="landing-sections"><article><MapPinned size={19} /><div><h2>Área de entrega</h2><p>O checkout valida o endereço contra o raio configurado pela operação antes do pagamento.</p></div></article><article><ClipboardList size={19} /><div><h2>Pedido acompanhado</h2><p>Cliente autenticado pode consultar o código, os estágios e a entrega quando houver integração ativa.</p></div></article><article><MessageCircle size={19} /><div><h2>Suporte antes do WhatsApp</h2><p>O chat orienta sobre cardápio, cobertura e status antes de encaminhar o atendimento humano.</p></div></article></section>
    <section className="landing-menu-preview"><div><p className="eyebrow">CARDÁPIO E PROMOÇÕES</p><h2>Monte o pedido do seu jeito.</h2><p>Frango assado, bebidas, acompanhamentos, promoções do dia e cupons aparecem no cardápio conforme a configuração da operação.</p><button className="hero-primary" onClick={() => go("cardapio")} type="button">Abrir cardápio <ArrowRight size={15} /></button></div><PublicPromotions /></section>
    <section className="landing-route"><div className="route-copy"><p className="eyebrow">DO PEDIDO À ENTREGA</p><h2>Você sabe onde o pedido está.</h2><p>Depois do pagamento, o pedido é analisado, preparado, despachado e acompanhado na sua conta. O mapa é exibido quando a integração de entrega disponibilizar a localização.</p><button className="outline-button" onClick={() => go("acompanhar")} type="button">Acompanhar pedido</button></div><div className="landing-map-art" aria-label="Representação visual da área de entrega"><span className="route-origin" /><span className="route-destination" /><i /><b>Área de entrega configurada</b></div></section>
    <section className="landing-review-note"><Star size={20} /><div><p className="eyebrow">AVALIAÇÕES REAIS</p><h2>O footer publica somente avaliações reais aprovadas pelo proprietário.</h2><p>Nenhum depoimento aparece até que exista uma avaliação de pedido concluído e moderada na área administrativa.</p></div></section>
  </main>;
}

function PublicPromotions() {
  const promotionsQuery = trpc.promotions.publicList.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const promotion = promotionsQuery.data?.[0];
  const images = promotion ? [promotion.image1Url, promotion.image2Url, promotion.image3Url].filter((url): url is string => Boolean(url)) : [];
  if (promotion) return <div className="public-promotion-card">{images.length > 0 && <div className="promotion-public-gallery hero">{images.map((url, index) => <img key={url} src={url} alt={`${promotion.title} — imagem ${index + 1}`} />)}</div>}<div><p className="eyebrow">{promotion.badge || "PROMOÇÃO ATIVA"}</p><h3>{promotion.title}</h3><p>{promotion.description}</p><div className="public-promotion-price">{promotion.salePriceCents ? <><s>{formatPrice(promotion.originalPriceCents)}</s><b>{formatPrice(promotion.salePriceCents)}</b></> : promotion.originalPriceCents > 0 ? <b>{formatPrice(promotion.originalPriceCents)}</b> : null}</div><span>Vigência configurada pela loja</span></div></div>;
  return <div className="menu-preview-cards"><article><Package size={20} /><b>Frango assado</b><small>Opções e tamanhos configurados pela loja.</small></article><article><CreditCard size={20} /><b>Pagamento seguro</b><small>Escolha o provedor disponível no checkout.</small></article><article><Tags size={20} /><b>Promoção do dia</b><small>Os destaques ativos publicados pelo administrador aparecem aqui.</small></article></div>;
}

function MenuPage({ go, cart, setCart }: { go: (view: PublicView) => void; cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }) {
  const promotionsQuery = trpc.promotions.publicList.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const catalogQuery = trpc.menu.publicCatalog.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const items = (catalogQuery.data ?? []).flatMap((category) => category.items.map((item) => ({ ...item, categoryName: category.name }))).filter((item) => activeCategory === "all" || item.categoryId === activeCategory);
  const total = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const addItem = (item: typeof items[number]) => setCart((current) => addCartLine(current, { id: `item-${item.id}`, title: item.title, priceCents: item.priceCents, imageUrl: item.imageUrl }));
  const addCombo = (promotion: NonNullable<typeof promotionsQuery.data>[number]) => { const priceCents = promotion.salePriceCents || promotion.originalPriceCents; if (priceCents) setCart((current) => addCartLine(current, { id: `promotion-${promotion.id}`, title: promotion.title, priceCents, imageUrl: promotion.image1Url })); };
  const changeQuantity = (id: string, nextQuantity: number) => setCart((current) => changeCartQuantity(current, id, nextQuantity));
  return <main className="content-page menu-page"><div className="page-intro"><p className="eyebrow">CARDÁPIO</p><h1>Escolha seus itens e ajuste o carrinho.</h1><p>Selecione os itens disponíveis e confira o resumo do pedido antes de seguir para o checkout.</p></div>{promotionsQuery.data?.map((promotion) => { const images = [promotion.image1Url, promotion.image2Url, promotion.image3Url].filter((url): url is string => Boolean(url)); return <section className="menu-promotion-banner menu-promotion-banner-v2" key={promotion.id}>{images.length ? <div className="promotion-public-gallery menu">{images.map((url, index) => <img key={url} src={url} alt={`${promotion.title} — imagem ${index + 1}`} />)}</div> : <Tags size={19} />}<div><p className="eyebrow">{promotion.badge || "PROMOÇÃO ATIVA"}</p><h2>{promotion.title}</h2><p>{promotion.description}</p><div className="menu-promotion-price">{promotion.salePriceCents ? <><s>{formatPrice(promotion.originalPriceCents)}</s><b>{formatPrice(promotion.salePriceCents)}</b></> : promotion.originalPriceCents > 0 ? <b>{formatPrice(promotion.originalPriceCents)}</b> : null}</div><button className="menu-combo-action" onClick={() => addCombo(promotion)} type="button">Adicionar combo <ArrowRight size={13} /></button></div></section>; })}<div className="menu-layout menu-layout-live"><section className="menu-categories"><button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")} type="button">Todos</button>{catalogQuery.data?.map((category) => <button className={activeCategory === category.id ? "active" : ""} onClick={() => setActiveCategory(category.id)} key={category.id} type="button">{category.name}</button>)}</section><section className="menu-items-grid">{catalogQuery.isLoading && <p className="empty-caption">Carregando cardápio…</p>}{catalogQuery.isError && <div className="menu-empty"><Package size={32} /><h2>Não foi possível carregar o cardápio</h2><p>Verifique sua conexão e tente novamente.</p><button className="outline-button" type="button" onClick={() => catalogQuery.refetch()}>Tentar novamente</button></div>}{!catalogQuery.isLoading && !catalogQuery.isError && !items.length && <div className="menu-empty"><Package size={32} /><h2>Cardápio em atualização</h2><p>Os itens disponíveis aparecerão aqui quando a loja publicar categorias e produtos.</p></div>}{items.map((item) => <article className="menu-item-card" key={item.id}>{item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <div className="menu-item-art"><Package size={26} /></div>}<div><small>{item.categoryName}</small><h2>{item.title}</h2><p>{item.description || "Item disponível no cardápio."}</p><div className="menu-item-footer"><b>{formatPrice(item.priceCents)}</b><button onClick={() => addItem(item)} type="button">Adicionar <ArrowRight size={13} /></button></div></div></article>)}</section><aside className="cart-summary cart-summary-live"><p className="eyebrow">CARRINHO</p><h2>Seu pedido</h2>{!cart.length && <p>Adicione itens do cardápio para montar o pedido.</p>}{cart.map((item) => <div className="cart-line" key={item.id}><div><b>{item.title}</b><small>{formatPrice(item.priceCents)} cada</small></div><div className="cart-quantity"><button type="button" onClick={() => changeQuantity(item.id, item.quantity - 1)} aria-label={`Reduzir ${item.title}`}>−</button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar ${item.title}`}>+</button></div></div>)}<div className="cart-total"><span>Subtotal</span><b>{formatPrice(total)}</b></div><button disabled={!cart.length} onClick={() => go("checkout")} type="button">Ir para checkout <ArrowRight size={14} /></button></aside></div></main>;
}

function AboutPage({ go }: { go: (view: PublicView) => void }) {
  return <main className="about-page"><section className="about-hero"><div><p className="eyebrow">PRIME FRANGO ASSADO</p><h1>Da brasa ao seu pedido, com sabor e cuidado em cada etapa.</h1><p className="about-lead">Uma página institucional para apresentar a história, o preparo e a forma como a marca organiza o atendimento e as entregas.</p><button className="hero-primary" onClick={() => go("cardapio")} type="button">Conhecer o cardápio <ArrowRight size={15} /></button></div><div className="about-mark"><img src={logo} alt="Logo Prime Frango Assado" /><span>ASSADO COM IDENTIDADE</span></div></section><section className="about-pillars"><article><b>01</b><h2>Preparo</h2><p>O conteúdo institucional explica o cuidado da operação sem substituir informações reais do estabelecimento.</p></article><article><b>02</b><h2>Pedido</h2><p>O cliente encontra cardápio, promoções, cupom e uma jornada de compra objetiva.</p></article><article><b>03</b><h2>Entrega</h2><p>O acompanhamento mostra etapas do pedido e disponibilidade da entrega quando configurada.</p></article></section></main>;
}

function TrackingPage({ go }: { go: (view: PublicView) => void }) {
  return <main className="content-page tracking-page"><div className="page-intro"><p className="eyebrow">ACOMPANHAMENTO</p><h1>Consulte seu pedido com segurança.</h1><p>Entre na conta para visualizar o código de pedido, o histórico e os estágios de preparo e entrega.</p></div><section className="tracking-empty"><ClipboardList size={32} /><h2>Nenhum pedido disponível nesta sessão</h2><p>Quando estiver autenticado e houver pedidos, esta área apresentará o código, o status e o mapa de acompanhamento quando a logística fornecer dados.</p><button onClick={() => go("acesso")} type="button">Entrar na minha conta</button></section></main>;
}

function AccessPage({ go }: { go: (view: PublicView) => void }) {
  const [mode, setMode] = useState<AccessIntent>("customer");
  return <main className="access-page"><section className="access-card"><p className="eyebrow">ACESSO SEGURO</p><h1>{mode === "customer" ? "Entre na sua conta" : "Acesso do administrador"}</h1><p>{mode === "customer" ? "Entre para consultar seus pedidos, acompanhar a entrega, manter o carrinho e concluir a compra com segurança." : "Use a conta do proprietário para administrar pedidos, cardápio, promoções, integrações e operações."}</p><div className="access-tabs" role="tablist"><button className={mode === "customer" ? "active" : ""} onClick={() => setMode("customer")} type="button">Cliente</button><button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")} type="button">Administrador</button></div><div className="access-actions"><button className="hero-primary" onClick={() => startRoleLogin(mode)} type="button">{mode === "customer" ? "Entrar ou criar conta" : "Entrar no painel administrativo"}<ArrowRight size={15} /></button><button className="hero-secondary" onClick={() => go(mode === "customer" ? "cardapio" : "inicio")} type="button">{mode === "customer" ? "Voltar ao cardápio" : "Voltar ao site"}</button></div><small>O acesso usa uma sessão segura. Na primeira entrada, o provedor cria o perfil de cliente. Caso precise recuperar o acesso, use a opção disponível na janela segura de autenticação. O painel só é liberado para a conta marcada como administradora.</small></section></main>;
}

function AccountPage({ go }: { go: (view: PublicView) => void }) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  if (loading) return <main className="access-page"><section className="access-card"><p className="eyebrow">MINHA CONTA</p><h1>Verificando seu acesso…</h1></section></main>;
  if (!isAuthenticated) return <main className="access-page"><section className="access-card"><p className="eyebrow">MINHA CONTA</p><h1>Entre para acompanhar seus pedidos.</h1><p>Use a conta segura para salvar seus dados e reencontrar os pedidos realizados.</p><div className="access-actions"><button className="hero-primary" onClick={() => startRoleLogin("customer")} type="button">Entrar ou criar conta <ArrowRight size={15} /></button><button className="hero-secondary" onClick={() => go("cardapio")} type="button">Ver cardápio</button></div></section></main>;
  return <main className="content-page account-page"><div className="page-intro"><p className="eyebrow">MINHA CONTA</p><h1>Olá, {user?.name || "cliente"}.</h1><p>Seus pedidos, endereços e atualizações aparecerão aqui depois que houver uma compra confirmada.</p></div><section className="account-grid"><article><ClipboardList size={24} /><h2>Meus pedidos</h2><p>Não há pedidos associados a esta conta no momento.</p><button className="hero-primary" onClick={() => go("cardapio")} type="button">Fazer um pedido</button></article><article><MapPinned size={24} /><h2>Acompanhar entrega</h2><p>Quando houver um pedido em andamento, o código e as etapas de preparo e entrega serão exibidos aqui.</p><button className="outline-button" onClick={() => go("acompanhar")} type="button">Acompanhar pedido</button></article></section>{user?.role === "admin" && <button className="approve" onClick={() => window.location.assign("/admin/dashboard")} type="button">Abrir painel administrativo</button>}<button className="outline-button account-logout" onClick={() => logout()} type="button">Sair da conta</button></main>;
}

function CheckoutPage({ go, cart, setCart }: { go: (view: PublicView) => void; cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>> }) {
  const [provider, setProvider] = useState<"stripe" | "mercado_pago" | "pagbank" | null>(null);
  const { isAuthenticated, loading } = useAuth();
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const providersQuery = trpc.payments.availableProviders.useQuery(undefined, { retry: false });
  const available = new Set((providersQuery.data ?? []).map((item) => item.provider));
  const total = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  if (providersQuery.isError) return <main className="content-page checkout-page"><div className="page-intro"><p className="eyebrow">CHECKOUT</p><h1>Não foi possível carregar os pagamentos.</h1><p>Seu carrinho continua salvo. Tente carregar os meios de pagamento novamente antes de concluir a compra.</p></div><div className="checkout-notice"><button className="hero-primary" type="button" onClick={() => providersQuery.refetch()}>Tentar novamente <ArrowRight size={14} /></button></div></main>;
  const continueCheckout = () => { if (!cart.length || loading) return; if (!isAuthenticated) { startCheckoutLogin(); return; } if (!provider) { setCheckoutNotice("Selecione um meio de pagamento configurado para continuar."); return; } setCheckoutNotice(`Pedido conferido. A cobrança será iniciada pelo ${provider === "pagbank" ? "PagBank" : provider === "stripe" ? "Stripe" : "Mercado Pago"} quando esta integração estiver habilitada para criar cobranças.`); };
  return <main className="content-page checkout-page"><div className="page-intro"><p className="eyebrow">CHECKOUT</p><h1>Revise o pedido antes de pagar.</h1><p>O carrinho, o endereço, o cupom, a cobertura e o pagamento serão validados em sequência.</p></div>{checkoutNotice && <div className="checkout-notice" role="status">{checkoutNotice}</div>}<section className="checkout-grid"><article><h2>1. Seu pedido</h2>{cart.length ? <>{cart.map((item) => <p key={item.id}>{item.quantity}× {item.title} <b>{formatPrice(item.priceCents * item.quantity)}</b></p>)}<strong>Subtotal: {formatPrice(total)}</strong><button className="outline-button" type="button" onClick={() => go("cardapio")}>Editar carrinho</button></> : <p>Seu carrinho está vazio. Volte ao cardápio para escolher os itens.</p>}</article><article><h2>2. Endereço e cobertura</h2><p>A distância é calculada a partir da origem configurada e o checkout é bloqueado fora do raio de entrega.</p></article><article><h2>3. Pagamento</h2><p>Escolha um provedor configurado antes de continuar.</p><div className="payment-options"><button className={provider === "stripe" ? "selected" : ""} disabled={!available.has("stripe")} onClick={() => setProvider("stripe")} type="button">Stripe {available.has("stripe") ? "pronto" : "aguardando conexão"}</button><button className={provider === "mercado_pago" ? "selected" : ""} disabled={!available.has("mercado_pago")} onClick={() => setProvider("mercado_pago")} type="button">Mercado Pago {available.has("mercado_pago") ? "pronto" : "aguardando conexão"}</button><button className={provider === "pagbank" ? "selected" : ""} disabled={!available.has("pagbank")} onClick={() => setProvider("pagbank")} type="button">PagBank {available.has("pagbank") ? "pronto" : "aguardando conexão"}</button></div></article></section><button className="hero-primary" disabled={!cart.length || loading} onClick={continueCheckout} type="button">{!isAuthenticated ? "Entrar para concluir compra" : provider ? `Continuar com ${provider === "pagbank" ? "PagBank" : provider === "stripe" ? "Stripe" : "Mercado Pago"}` : "Escolher pagamento"}</button></main>;
}

function AdminGate({ view, navigate }: { view: AdminView; navigate: (path: string) => void }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <main className="admin-access"><section><p className="eyebrow">PAINEL ADMINISTRATIVO</p><h1>Verificando acesso…</h1></section></main>;
  if (!isAuthenticated) return <main className="admin-access"><section><p className="eyebrow">PAINEL ADMINISTRATIVO</p><h1>Entre para acessar a operação.</h1><p>Pedidos, dados financeiros e integrações ficam disponíveis somente para a conta administradora.</p><button className="hero-primary" onClick={() => startRoleLogin("admin")} type="button">Entrar como administrador <ArrowRight size={15} /></button></section></main>;
  if (user?.role !== "admin") return <main className="admin-access"><section><p className="eyebrow">ACESSO RESTRITO</p><h1>Esta conta não possui permissão administrativa.</h1><p>Você pode continuar na área de cliente ou entrar novamente com a conta do proprietário.</p><div className="access-actions"><button className="hero-primary" onClick={() => navigate("/minha-conta")} type="button">Ir para minha conta</button><button className="hero-secondary dark-outline" onClick={() => startRoleLogin("admin")} type="button">Trocar de conta</button></div></section></main>;
  return <AdminShell view={view} navigate={navigate} />;
}

function AdminShell({ view, navigate }: { view: AdminView; navigate: (path: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState("");
  const nav = (next: AdminView) => { setMenuOpen(false); navigate(`/admin/${next}`); };
  const titles: Record<AdminView, [string, string]> = {
    dashboard: ["Dashboard", "Visão geral do negócio e indicadores reais."], pedidos: ["Pedidos", "Avalie, prepare e atualize pedidos recebidos."], mapa: ["Mapa Operacional", "Acompanhe entregas quando a logística fornecer localização."], cardapio: ["Cardápio", "Gerencie produtos, disponibilidade e categorias."], promocoes: ["Promoções", "Organize ofertas e destaque do dia."], cupons: ["Cupons", "Crie códigos e regras de desconto."], avaliacoes: ["Avaliações", "Modere avaliações reais recebidas após pedidos."], clientes: ["Clientes", "Consulte clientes e histórico de relacionamento."], financeiro: ["Financeiro", "Acompanhe a saúde financeira do negócio."], integracoes: ["Integrações", "Conecte mapas, pagamentos, logística, mensagens e e-mail."], marketing: ["Marketing", "Controle conteúdo da landing page e campanhas."], operacoes: ["Operações", "Concentre aprovação, preparo, despacho e entrega."],
  };
  return <div className={collapsed ? "admin-shell is-collapsed" : "admin-shell"}>
    <aside className={menuOpen ? "sidebar mobile-open" : "sidebar"}>
      <button className="brand-button" type="button" onClick={() => navigate("/")} aria-label="Abrir site público"><img className="brand-logo" src={logo} alt="Prime Frango Assado" /></button><p className="admin-label">ADMIN</p>
      <nav aria-label="Navegação administrativa">{adminItems.map(({ label, view: itemView, icon: Icon }) => <button className={itemView === view ? "nav-item active" : "nav-item"} key={itemView} onClick={() => nav(itemView)} type="button"><Icon size={15} strokeWidth={1.9} /><span>{label}</span></button>)}</nav>
      <button className="collapse" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"} type="button"><ChevronDown size={17} /></button>
    </aside>
    {menuOpen && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} type="button" />}
    <main className="admin-main"><header className="topbar"><div className="topbar-title"><button className="admin-menu-toggle" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu administrativo"><Menu size={19} /></button><div><h1>{titles[view][0]}</h1><p>{titles[view][1]}</p></div></div><div className="topbar-actions"><button className="period-button" type="button" onClick={() => setNotice("Filtro de período pronto para conectar aos dados reais.")}><Menu size={14} /> Últimos 30 dias <ChevronDown size={15} /></button><button className="profile-button" type="button" onClick={() => setNotice("Perfil administrativo protegido por autenticação.")}><Bell size={16} /><span>Proprietário</span><ChevronDown size={14} /></button></div></header>
      {notice && <div className="inline-notice" role="status"><CheckCircle2 size={15} />{notice}<button type="button" onClick={() => setNotice("")} aria-label="Fechar aviso"><X size={14} /></button></div>}
      <AdminContent view={view} onNotice={setNotice} onNavigate={nav} />
    </main>
  </div>;
}

function AdminContent({ view, onNotice, onNavigate }: { view: AdminView; onNotice: (message: string) => void; onNavigate: (view: AdminView) => void }) {
  if (view === "cardapio") return <CardapioAdmin onNotice={onNotice} />;
  if (view === "promocoes") return <Promocoes onNotice={onNotice} />;
  if (view === "cupons") return <Cupons onNotice={onNotice} />;
  if (view === "financeiro") return <Financeiro onNotice={onNotice} />;
  if (view === "clientes") return <Clientes />;
  if (view === "avaliacoes") return <Avaliacoes onNotice={onNotice} />;
  if (view === "marketing") return <Marketing onNavigate={onNavigate} />;
  if (view === "operacoes") return <Operacoes onNotice={onNotice} />;
  if (view === "integracoes") return <Integracoes onNotice={onNotice} />;
  const map: Record<Exclude<AdminView, "financeiro" | "clientes" | "avaliacoes" | "marketing" | "operacoes" | "integracoes" | "promocoes" | "cupons" | "cardapio">, { title: string; text: string; action: string; icon: typeof Package }> = {
    dashboard: { title: "Indicadores do negócio", text: "Pedidos do dia, receita, ticket médio, entregas e tendências aparecem quando existirem dados confirmados.", action: "Ver operações", icon: BarChart3 }, pedidos: { title: "Central de pedidos", text: "Pedidos pagos entram em análise e só seguem para preparo após aprovação administrativa.", action: "Abrir operações", icon: ClipboardList }, mapa: { title: "Mapa de entregas", text: "O mapa apresenta origem, rota e posições de entrega apenas quando a logística disponibilizar localização.", action: "Ver operações", icon: MapPinned },
  };
  const item = map[view as keyof typeof map]; const Icon = item.icon;
  return <section className="admin-module"><article className="module-hero"><div className="module-icon"><Icon size={24} /></div><div><p className="eyebrow">MÓDULO ADMINISTRATIVO</p><h2>{item.title}</h2><p>{item.text}</p></div><button className="approve" type="button" onClick={() => onNavigate(view === "dashboard" || view === "pedidos" || view === "mapa" ? "operacoes" : "marketing")}>{item.action}<ArrowRight size={14} /></button></article><div className="module-cards"><InfoCard title="Dados reais" text="A interface permanece vazia até a operação registrar informações válidas." /><InfoCard title="Acesso controlado" text="O módulo pertence à área administrativa e será protegido por autenticação." /><InfoCard title="Próxima ação" text="Use o botão principal para chegar ao módulo operacional correspondente." /></div></section>;
}

type PromotionForm = { title: string; description: string; badge: string; originalPrice: string; salePrice: string; startsAt: string; endsAt: string; status: "draft" | "active" | "archived" };
const emptyPromotionForm: PromotionForm = { title: "", description: "", badge: "", originalPrice: "", salePrice: "", startsAt: "", endsAt: "", status: "draft" };
const toDateInput = (value: Date | null) => value ? new Date(value).toISOString().slice(0, 10) : "";
const toCurrencyCents = (value: string) => Math.round(Number(value.replace(",", ".")) * 100);
const formatPrice = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const acceptedImageExtensions = /\.(jpe?g|png|webp|heic|heif)$/i;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a foto selecionada."));
    reader.readAsDataURL(file);
  });
}

function fileToImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const source = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(source); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(source); reject(new Error("Não foi possível abrir esta foto. Tente selecionar outra imagem.")); };
    image.src = source;
  });
}

async function normalizePromotionImage(file: File): Promise<string> {
  if (!acceptedImageTypes.has(file.type) && !acceptedImageExtensions.test(file.name)) throw new Error("Use fotos JPEG, PNG, WebP ou HEIC/HEIF.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Cada foto deve ter no máximo 20 MB antes da otimização.");
  const isHeic = ["image/heic", "image/heif"].includes(file.type) || /\.(heic|heif)$/i.test(file.name);
  let sourceFile = file;
  if (isHeic) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.84 });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      sourceFile = new File([jpegBlob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
    } catch {
      throw new Error("Não foi possível converter esta foto HEIC. No iPhone, abra a foto no app Fotos e compartilhe como JPEG antes de selecioná-la.");
    }
  }
  const needsConversion = isHeic || sourceFile.size > 4.8 * 1024 * 1024;
  if (!needsConversion) return readImageAsDataUrl(sourceFile);
  const image = await fileToImage(sourceFile).catch(() => { throw new Error("Não foi possível otimizar esta foto para o envio. Escolha outra imagem ou exporte-a como JPEG."); });
  const maxSide = 1920;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.84));
  if (!blob || blob.size > 4.8 * 1024 * 1024) throw new Error("Não foi possível otimizar esta foto para o envio. Escolha uma imagem menor.");
  return readImageAsDataUrl(new File([blob], `${sourceFile.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" }));
}

type MenuCategoryForm = { name: string; sortOrder: string; isActive: boolean };
type MenuItemForm = { categoryId: string; title: string; description: string; price: string; imageUrl: string; sortOrder: string; isAvailable: boolean };
const emptyMenuCategory: MenuCategoryForm = { name: "", sortOrder: "0", isActive: true };
const emptyMenuItem: MenuItemForm = { categoryId: "", title: "", description: "", price: "", imageUrl: "", sortOrder: "0", isAvailable: true };

function CardapioAdmin({ onNotice }: { onNotice: (message: string) => void }) {
  const utils = trpc.useUtils();
  const catalogQuery = trpc.menu.adminCatalog.useQuery(undefined, { retry: false });
  const [categoryForm, setCategoryForm] = useState<MenuCategoryForm>(emptyMenuCategory);
  const [itemForm, setItemForm] = useState<MenuItemForm>(emptyMenuItem);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const refresh = async () => { await utils.menu.adminCatalog.invalidate(); await utils.menu.publicCatalog.invalidate(); };
  const notifyError = (error: unknown) => onNotice(error instanceof Error && error.message ? error.message : "Não foi possível salvar esta alteração.");
  const createCategory = trpc.menu.createCategory.useMutation({ onSuccess: async () => { await refresh(); setCategoryForm(emptyMenuCategory); onNotice("Categoria criada com sucesso."); }, onError: notifyError });
  const updateCategory = trpc.menu.updateCategory.useMutation({ onSuccess: async () => { await refresh(); setEditingCategory(null); setCategoryForm(emptyMenuCategory); onNotice("Categoria atualizada."); }, onError: notifyError });
  const removeCategory = trpc.menu.removeCategory.useMutation({ onSuccess: refresh, onError: notifyError });
  const createItem = trpc.menu.createItem.useMutation({ onSuccess: async () => { await refresh(); setItemForm(emptyMenuItem); onNotice("Item publicado no cardápio."); }, onError: notifyError });
  const updateItem = trpc.menu.updateItem.useMutation({ onSuccess: async () => { await refresh(); setEditingItem(null); setItemForm(emptyMenuItem); onNotice("Item atualizado no cardápio."); }, onError: notifyError });
  const removeItem = trpc.menu.removeItem.useMutation({ onSuccess: refresh, onError: notifyError });
  const uploadImage = trpc.menu.uploadImage.useMutation({ onSuccess: ({ url }) => { setItemForm((current) => ({ ...current, imageUrl: url })); onNotice("Imagem do item enviada com sucesso."); }, onError: notifyError });
  const saveCategory = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = { name: categoryForm.name, isActive: categoryForm.isActive, sortOrder: Number(categoryForm.sortOrder) || 0 }; if (editingCategory) updateCategory.mutate({ id: editingCategory, data }); else createCategory.mutate(data); };
  const saveItem = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const priceCents = toCurrencyCents(itemForm.price); if (!itemForm.categoryId) return onNotice("Selecione uma categoria para o item."); if (!Number.isFinite(priceCents) || priceCents < 1) return onNotice("Informe um preço válido."); const data = { categoryId: Number(itemForm.categoryId), title: itemForm.title, description: itemForm.description, priceCents, imageUrl: itemForm.imageUrl, isAvailable: itemForm.isAvailable, sortOrder: Number(itemForm.sortOrder) || 0 }; if (editingItem) updateItem.mutate({ id: editingItem, data }); else createItem.mutate(data); };
  const selectImage = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; try { const dataUrl = await normalizePromotionImage(file); uploadImage.mutate({ dataUrl }); } catch (error) { notifyError(error); } };
  const categories = catalogQuery.data?.categories ?? [];
  const items = catalogQuery.data?.items ?? [];
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  if (catalogQuery.isError) return <section className="page-grid menu-admin-page"><div className="menu-admin-header"><div><p className="eyebrow">GESTÃO DE CARDÁPIO</p><h2>Não foi possível carregar o cardápio.</h2><p>Verifique a conexão com o servidor e tente carregar novamente antes de alterar categorias ou itens.</p></div></div><section className="menu-admin-list"><button className="approve" type="button" onClick={() => catalogQuery.refetch()}>Tentar novamente <ArrowRight size={14} /></button></section></section>;
  return <section className="page-grid menu-admin-page"><div className="menu-admin-header"><div><p className="eyebrow">GESTÃO DE CARDÁPIO</p><h2>Produtos prontos para vender.</h2><p>Crie categorias, publique os itens disponíveis e mantenha preço, imagem e disponibilidade atualizados em tempo real.</p></div><span className="count-pill">{items.length} itens</span></div><div className="menu-admin-forms"><form className="menu-admin-form category-form" onSubmit={saveCategory}><div><p className="eyebrow">{editingCategory ? "EDITANDO CATEGORIA" : "CATEGORIA"}</p><h2>{editingCategory ? "Atualize a categoria" : "Organize o cardápio"}</h2></div><label>Nome da categoria<input required value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} placeholder="Ex.: Frangos assados" /></label><label>Ordem de exibição<input type="number" min="0" value={categoryForm.sortOrder} onChange={(event) => setCategoryForm({ ...categoryForm, sortOrder: event.target.value })} /></label><label className="availability-toggle"><input type="checkbox" checked={categoryForm.isActive} onChange={(event) => setCategoryForm({ ...categoryForm, isActive: event.target.checked })} /><span>Exibir categoria no site</span></label><div className="menu-form-actions"><button className="approve" type="submit" disabled={createCategory.isPending || updateCategory.isPending}>{editingCategory ? "Salvar categoria" : "Criar categoria"}</button>{editingCategory && <button type="button" className="outline-button" onClick={() => { setEditingCategory(null); setCategoryForm(emptyMenuCategory); }}>Cancelar</button>}</div></form><form className="menu-admin-form item-form" onSubmit={saveItem}><div><p className="eyebrow">{editingItem ? "EDITANDO ITEM" : "NOVO ITEM"}</p><h2>{editingItem ? "Ajuste produto" : "Publique um produto"}</h2></div><div className="menu-form-grid"><label>Categoria<select required value={itemForm.categoryId} onChange={(event) => setItemForm({ ...itemForm, categoryId: event.target.value })}><option value="">Selecione</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>Nome do item<input required value={itemForm.title} onChange={(event) => setItemForm({ ...itemForm, title: event.target.value })} placeholder="Ex.: Frango assado inteiro" /></label><label>Preço (R$)<input required type="number" min="0.01" step="0.01" inputMode="decimal" value={itemForm.price} onChange={(event) => setItemForm({ ...itemForm, price: event.target.value })} placeholder="0,00" /></label><label>Ordem<input type="number" min="0" value={itemForm.sortOrder} onChange={(event) => setItemForm({ ...itemForm, sortOrder: event.target.value })} /></label></div><label>Descrição (opcional)<textarea value={itemForm.description} onChange={(event) => setItemForm({ ...itemForm, description: event.target.value })} placeholder="Descreva o que acompanha o produto." /></label><div className="menu-item-image-upload">{itemForm.imageUrl ? <figure><img src={itemForm.imageUrl} alt="Prévia do item" /><button type="button" onClick={() => setItemForm({ ...itemForm, imageUrl: "" })}>Remover imagem</button></figure> : <label><ImagePlus size={18} /><span>{uploadImage.isPending ? "Enviando imagem…" : "Adicionar imagem (opcional)"}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" disabled={uploadImage.isPending} onChange={selectImage} /></label>}</div><label className="availability-toggle"><input type="checkbox" checked={itemForm.isAvailable} onChange={(event) => setItemForm({ ...itemForm, isAvailable: event.target.checked })} /><span>Disponível para pedido agora</span></label><div className="menu-form-actions"><button className="approve" type="submit" disabled={createItem.isPending || updateItem.isPending || uploadImage.isPending}>{editingItem ? "Salvar item" : "Publicar item"}<ArrowRight size={14} /></button>{editingItem && <button type="button" className="outline-button" onClick={() => { setEditingItem(null); setItemForm(emptyMenuItem); }}>Cancelar</button>}</div></form></div><section className="menu-admin-list"><div className="card-heading"><div><h2>Cardápio configurado</h2><p>Itens indisponíveis permanecem salvos, mas não aparecem para o cliente.</p></div></div>{catalogQuery.isLoading && <p className="empty-caption">Carregando cardápio…</p>}{!catalogQuery.isLoading && !categories.length && <p className="empty-caption"><Package size={16} /> Crie uma categoria para começar a organizar seu cardápio.</p>}{categories.map((category) => <article className="menu-category-admin" key={category.id}><header><div><span className={category.isActive ? "promotion-status active" : "promotion-status archived"}>{category.isActive ? "Visível" : "Oculta"}</span><h3>{category.name}</h3></div><div className="promotion-actions"><button className="outline-button" type="button" onClick={() => { setEditingCategory(category.id); setCategoryForm({ name: category.name, sortOrder: String(category.sortOrder), isActive: category.isActive }); }}>Editar</button><button className="danger-button" type="button" onClick={() => { if (window.confirm(`Remover a categoria ${category.name}?`)) removeCategory.mutate({ id: category.id }); }}>Remover</button></div></header><div className="menu-admin-items">{items.filter((item) => item.categoryId === category.id).map((item) => <article key={item.id}><div className="menu-admin-thumb">{item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <Package size={18} />}</div><div><b>{item.title}</b><p>{item.description || "Sem descrição."}</p><small>{formatPrice(item.priceCents)} · {item.isAvailable ? "Disponível" : "Indisponível"}</small></div><div className="promotion-actions"><button className="outline-button" type="button" onClick={() => { setEditingItem(item.id); setItemForm({ categoryId: String(item.categoryId), title: item.title, description: item.description || "", price: String(item.priceCents / 100), imageUrl: item.imageUrl || "", sortOrder: String(item.sortOrder), isAvailable: item.isAvailable }); }}>Editar</button><button className="danger-button" type="button" onClick={() => { if (window.confirm(`Remover ${item.title}?`)) removeItem.mutate({ id: item.id }); }}>Remover</button></div></article>)}{!items.some((item) => item.categoryId === category.id) && <p className="empty-caption">Nenhum item nesta categoria.</p>}</div></article>)}</section></section>;
}

function Promocoes({ onNotice }: { onNotice: (message: string) => void }) {
  const utils = trpc.useUtils();
  const promotionsQuery = trpc.promotions.list.useQuery(undefined, { retry: false });
  const [form, setForm] = useState<PromotionForm>(emptyPromotionForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const refresh = async () => { await utils.promotions.list.invalidate(); await utils.promotions.publicList.invalidate(); };
  const notifyError = (error: unknown) => onNotice(error instanceof Error && error.message ? error.message : "Não foi possível salvar a promoção. Tente novamente.");
  const saveMutation = trpc.promotions.create.useMutation({ onSuccess: async () => { await refresh(); setForm(emptyPromotionForm); setImageUrls([]); onNotice("Promoção criada. Ative-a quando estiver pronta para publicar."); }, onError: notifyError });
  const updateMutation = trpc.promotions.update.useMutation({ onSuccess: async () => { await refresh(); setEditingId(null); setForm(emptyPromotionForm); setImageUrls([]); onNotice("Promoção atualizada com sucesso."); }, onError: notifyError });
  const statusMutation = trpc.promotions.setStatus.useMutation({ onSuccess: async () => { await refresh(); onNotice("Status da promoção atualizado."); }, onError: notifyError });
  const removeMutation = trpc.promotions.remove.useMutation({ onSuccess: async () => { await refresh(); onNotice("Promoção removida."); }, onError: notifyError });
  const uploadMutation = trpc.promotions.uploadImages.useMutation({ onSuccess: ({ images }) => { setImageUrls((current) => [...current, ...images.map((image) => image.url)].slice(0, 3)); onNotice("Imagem do combo enviada com sucesso."); }, onError: notifyError });
  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files ?? []); event.target.value = ""; if (!files.length) return; if (files.length + imageUrls.length > 3) { onNotice("Cada combo aceita no máximo três imagens."); return; } try { const images = await Promise.all(files.map(normalizePromotionImage)); uploadMutation.mutate({ images: images.map((dataUrl) => ({ dataUrl })) }); } catch (error) { notifyError(error); } };
  const save = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const originalPriceCents = toCurrencyCents(form.originalPrice); const salePriceCents = form.salePrice ? toCurrencyCents(form.salePrice) : null; if (!Number.isFinite(originalPriceCents) || originalPriceCents < 1) { onNotice("Informe o preço original do combo."); return; } if (salePriceCents && salePriceCents >= originalPriceCents) { onNotice("O preço promocional deve ser menor que o preço original."); return; } const data = { title: form.title, description: form.description, badge: form.badge, originalPriceCents, salePriceCents, imageUrls, status: form.status, startsAt: form.startsAt ? new Date(`${form.startsAt}T00:00:00`) : null, endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`) : null }; if (editingId) updateMutation.mutate({ id: editingId, data }); else saveMutation.mutate(data); };
  const edit = (promotion: NonNullable<typeof promotionsQuery.data>[number]) => { setEditingId(promotion.id); setImageUrls([promotion.image1Url, promotion.image2Url, promotion.image3Url].filter((url): url is string => Boolean(url))); setForm({ title: promotion.title, description: promotion.description, badge: promotion.badge || "", originalPrice: promotion.originalPriceCents ? String(promotion.originalPriceCents / 100) : "", salePrice: promotion.salePriceCents ? String(promotion.salePriceCents / 100) : "", startsAt: toDateInput(promotion.startsAt), endsAt: toDateInput(promotion.endsAt), status: promotion.status }); };
  const cancelEdit = () => { setEditingId(null); setForm(emptyPromotionForm); setImageUrls([]); };
  const pending = saveMutation.isPending || updateMutation.isPending || uploadMutation.isPending;
  return <section className="page-grid promotions-page">
    <div className="promotion-header"><div><p className="eyebrow">PROMOÇÕES DO DIA</p><h2>Crie combos que dão fome.</h2><p>Adicione fotos reais, preço original e desconto. Quando ativada, a oferta aparece automaticamente na landing page e no cardápio.</p></div><span className="count-pill">{promotionsQuery.data?.length ?? 0} configuradas</span></div>
    <form className="promotion-form promotion-form-v2" onSubmit={save}>
      <div className="promotion-form-heading"><div><p className="eyebrow">{editingId ? "EDITANDO COMBO" : "NOVO COMBO"}</p><h2>{editingId ? "Ajuste os detalhes da oferta" : "Monte sua oferta especial"}</h2><p>As imagens e os preços são exibidos ao cliente apenas quando a promoção estiver ativa.</p></div>{editingId && <button className="outline-button" type="button" onClick={cancelEdit}>Cancelar edição</button>}</div>
      <label>Título da promoção<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: Combo domingo em família" /></label>
      <label>O que vem no combo?<textarea required maxLength={600} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ex.: 1 frango assado, farofa, arroz e refrigerante de 2 litros." /></label>
      <div className="promotion-media-block"><div><b>Fotos do combo</b><small>Envie até 3 fotos reais. JPEG, PNG, WebP e HEIC/HEIF são aceitos; fotos grandes são otimizadas antes do envio.</small></div><div className="promotion-gallery">{imageUrls.map((url, index) => <figure key={url}><img src={url} alt={`Prévia ${index + 1} do combo`} /><button type="button" aria-label={`Remover imagem ${index + 1}`} onClick={() => setImageUrls((current) => current.filter((_, currentIndex) => currentIndex !== index))}><Trash2 size={14} /></button></figure>)}{imageUrls.length < 3 && <label className="image-picker"><ImagePlus size={20} /><span>{uploadMutation.isPending ? "Otimizando e enviando…" : "Adicionar fotos"}</span><small>{imageUrls.length}/3</small><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple disabled={uploadMutation.isPending} onChange={handleImageSelection} /></label>}</div></div>
      <div className="promotion-price-row"><label>Preço original<input required min="0.01" step="0.01" inputMode="decimal" type="number" value={form.originalPrice} onChange={(event) => setForm({ ...form, originalPrice: event.target.value })} placeholder="0,00" /><small>Valor antes do desconto.</small></label><label className="sale-price-field"><span><BadgePercent size={14} /> Preço promocional</span><input min="0.01" step="0.01" inputMode="decimal" type="number" value={form.salePrice} onChange={(event) => setForm({ ...form, salePrice: event.target.value })} placeholder="Opcional" /><small>Deve ser menor que o preço original.</small></label></div>
      <div className="promotion-form-row"><label>Selo curto (opcional)<input maxLength={48} value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} placeholder="Ex.: SÓ HOJE" /></label><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PromotionForm["status"] })}><option value="draft">Rascunho</option><option value="active">Ativa agora</option><option value="archived">Arquivada</option></select></label><label>Início (opcional)<input type="date" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></label><label>Fim (opcional)<input type="date" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></label></div>
      <div className="promotion-submit-row"><span>{form.salePrice && form.originalPrice ? <>Cliente economiza {formatPrice(Math.max(0, toCurrencyCents(form.originalPrice) - toCurrencyCents(form.salePrice)))}</> : "Defina um preço promocional para destacar a economia."}</span><button className="approve promotion-primary-action" disabled={pending} type="submit">{pending ? "Salvando…" : editingId ? "Salvar mudanças" : "Criar promoção"}<ArrowRight size={15} /></button></div>
    </form>
    <section className="promotion-list"><div className="card-heading"><div><h2>Promoções configuradas</h2><p>Controle a publicação sem precisar alterar código.</p></div></div>{promotionsQuery.isLoading && <p className="empty-caption">Carregando promoções…</p>}{!promotionsQuery.isLoading && !promotionsQuery.data?.length && <p className="empty-caption"><Tags size={16} /> Nenhuma promoção configurada ainda.</p>}{promotionsQuery.data?.map((promotion) => <article className="promotion-item promotion-item-v2" key={promotion.id}><div className="promotion-item-preview">{promotion.image1Url ? <img src={promotion.image1Url} alt="Miniatura do combo" /> : <Tags size={20} />}</div><div className="promotion-item-copy"><span className={`promotion-status ${promotion.status}`}>{promotion.status === "active" ? "Ativa" : promotion.status === "draft" ? "Rascunho" : "Arquivada"}</span><h3>{promotion.title}</h3><p>{promotion.description}</p><div className="promotion-item-prices">{promotion.salePriceCents ? <><s>{formatPrice(promotion.originalPriceCents)}</s><b>{formatPrice(promotion.salePriceCents)}</b></> : <b>{formatPrice(promotion.originalPriceCents)}</b>}</div><small>{promotion.badge || "Sem selo"} · {promotion.startsAt ? `a partir de ${new Date(promotion.startsAt).toLocaleDateString("pt-BR")}` : "sem início definido"}{promotion.endsAt ? ` · até ${new Date(promotion.endsAt).toLocaleDateString("pt-BR")}` : ""}</small></div><div className="promotion-actions"><button className="outline-button" type="button" onClick={() => edit(promotion)}>Editar</button><button className="approve" type="button" onClick={() => statusMutation.mutate({ id: promotion.id, status: promotion.status === "active" ? "archived" : "active" })}>{promotion.status === "active" ? "Encerrar" : "Ativar"}</button><button className="danger-button" type="button" onClick={() => { if (window.confirm("Remover esta promoção?")) removeMutation.mutate({ id: promotion.id }); }}>Remover</button></div></article>)}</section>
  </section>;
}

type CouponForm = { code: string; description: string; discountType: "percentage" | "fixed"; discountValue: string; minimumOrder: string; maxUses: string; startsAt: string; endsAt: string; status: "draft" | "active" | "archived" };
const emptyCouponForm: CouponForm = { code: "", description: "", discountType: "percentage", discountValue: "", minimumOrder: "", maxUses: "", startsAt: "", endsAt: "", status: "draft" };

function Cupons({ onNotice }: { onNotice: (message: string) => void }) {
  const utils = trpc.useUtils();
  const couponsQuery = trpc.coupons.list.useQuery(undefined, { retry: false });
  const [form, setForm] = useState<CouponForm>(emptyCouponForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const refresh = async () => { await utils.coupons.list.invalidate(); };
  const notifyError = (error: unknown) => onNotice(error instanceof Error && error.message ? error.message : "Não foi possível salvar o cupom. Tente novamente.");
  const createMutation = trpc.coupons.create.useMutation({ onSuccess: async () => { await refresh(); setForm(emptyCouponForm); onNotice("Cupom criado. Ative-o quando estiver pronto para usar."); }, onError: notifyError });
  const updateMutation = trpc.coupons.update.useMutation({ onSuccess: async () => { await refresh(); setForm(emptyCouponForm); setEditingId(null); onNotice("Cupom atualizado com sucesso."); }, onError: notifyError });
  const statusMutation = trpc.coupons.setStatus.useMutation({ onSuccess: refresh, onError: notifyError });
  const removeMutation = trpc.coupons.remove.useMutation({ onSuccess: refresh, onError: notifyError });
  const save = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const discountValue = form.discountType === "percentage" ? Number(form.discountValue) : toCurrencyCents(form.discountValue); const minimumOrderCents = form.minimumOrder ? toCurrencyCents(form.minimumOrder) : 0; const maxUses = form.maxUses ? Number(form.maxUses) : null; if (!/^[A-Z0-9_-]{3,32}$/.test(form.code.trim().toUpperCase())) { onNotice("Use um código com 3 a 32 letras, números, hífen ou sublinhado."); return; } if (!Number.isInteger(discountValue) || discountValue < 1 || (form.discountType === "percentage" && discountValue > 100)) { onNotice(form.discountType === "percentage" ? "Informe um desconto entre 1% e 100%." : "Informe o valor de desconto do cupom."); return; } if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) { onNotice("O limite de usos deve ser um número inteiro maior que zero."); return; } const data = { code: form.code.trim().toUpperCase(), description: form.description.trim(), discountType: form.discountType, discountValue, minimumOrderCents, maxUses, startsAt: form.startsAt ? new Date(`${form.startsAt}T00:00:00`) : null, endsAt: form.endsAt ? new Date(`${form.endsAt}T23:59:59`) : null, status: form.status }; if (editingId) updateMutation.mutate({ id: editingId, data }); else createMutation.mutate(data); };
  const edit = (coupon: NonNullable<typeof couponsQuery.data>[number]) => { setEditingId(coupon.id); setForm({ code: coupon.code, description: coupon.description || "", discountType: coupon.discountType, discountValue: coupon.discountType === "percentage" ? String(coupon.discountValue) : String(coupon.discountValue / 100), minimumOrder: coupon.minimumOrderCents ? String(coupon.minimumOrderCents / 100) : "", maxUses: coupon.maxUses ? String(coupon.maxUses) : "", startsAt: toDateInput(coupon.startsAt), endsAt: toDateInput(coupon.endsAt), status: coupon.status }); };
  const pending = createMutation.isPending || updateMutation.isPending;
  const activeCount = couponsQuery.data?.filter((coupon) => coupon.status === "active").length ?? 0;
  return <section className="page-grid coupons-page"><div className="coupon-header"><div><p className="eyebrow">CÓDIGOS DE DESCONTO</p><h2>Crie ofertas que voltam para o carrinho.</h2><p>Defina desconto, condição mínima, limite de uso e vigência. O cupom só pode ser usado quando estiver ativo.</p></div><div className="coupon-header-stats"><b>{activeCount}</b><span>ativos</span></div></div><form className="coupon-form" onSubmit={save}><div className="promotion-form-heading"><div><p className="eyebrow">{editingId ? "EDITANDO CUPOM" : "NOVO CUPOM"}</p><h2>{editingId ? "Ajuste as regras do cupom" : "Crie um código de desconto"}</h2></div>{editingId && <button type="button" className="outline-button" onClick={() => { setEditingId(null); setForm(emptyCouponForm); }}>Cancelar edição</button>}</div><div className="coupon-code-row"><label>Código do cupom<input required maxLength={32} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s/g, "") })} placeholder="EX.: DOMINGO10" /></label><label>Descrição (opcional)<input maxLength={180} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ex.: 10% no combo de domingo" /></label></div><div className="coupon-rule-grid"><label>Tipo de desconto<select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as CouponForm["discountType"], discountValue: "" })}><option value="percentage">Percentual (%)</option><option value="fixed">Valor fixo (R$)</option></select></label><label>{form.discountType === "percentage" ? "Desconto (%)" : "Desconto (R$)"}<input required type="number" min={form.discountType === "percentage" ? "1" : "0.01"} max={form.discountType === "percentage" ? "100" : undefined} step={form.discountType === "percentage" ? "1" : "0.01"} inputMode="decimal" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: event.target.value })} placeholder={form.discountType === "percentage" ? "10" : "0,00"} /></label><label>Pedido mínimo (R$)<input type="number" min="0" step="0.01" inputMode="decimal" value={form.minimumOrder} onChange={(event) => setForm({ ...form, minimumOrder: event.target.value })} placeholder="Sem mínimo" /></label><label>Limite de usos<input type="number" min="1" step="1" inputMode="numeric" value={form.maxUses} onChange={(event) => setForm({ ...form, maxUses: event.target.value })} placeholder="Ilimitado" /></label></div><div className="coupon-rule-grid"><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as CouponForm["status"] })}><option value="draft">Rascunho</option><option value="active">Ativo agora</option><option value="archived">Arquivado</option></select></label><label>Início (opcional)<input type="date" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></label><label>Fim (opcional)<input type="date" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></label></div><div className="coupon-submit-row"><small>{form.discountType === "percentage" && form.discountValue ? `${form.discountValue}% de desconto` : form.discountType === "fixed" && form.discountValue ? `${formatPrice(toCurrencyCents(form.discountValue))} de desconto` : "Defina a vantagem oferecida ao cliente."}</small><button className="approve" type="submit" disabled={pending}>{pending ? "Salvando…" : editingId ? "Salvar mudanças" : "Criar cupom"}<ArrowRight size={15} /></button></div></form><section className="coupon-list"><div className="card-heading"><div><h2>Cupons configurados</h2><p>Ative ou encerre uma campanha de desconto sem alterar código.</p></div></div>{couponsQuery.isLoading && <p className="empty-caption">Carregando cupons…</p>}{!couponsQuery.isLoading && !couponsQuery.data?.length && <p className="empty-caption"><ReceiptText size={17} /> Nenhum cupom configurado ainda.</p>}{couponsQuery.data?.map((coupon) => <article className="coupon-item" key={coupon.id}><div className="coupon-stamp"><b>{coupon.code}</b><small>{coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `${formatPrice(coupon.discountValue)} OFF`}</small></div><div className="coupon-copy"><span className={`promotion-status ${coupon.status}`}>{coupon.status === "active" ? "Ativo" : coupon.status === "draft" ? "Rascunho" : "Arquivado"}</span><p>{coupon.description || "Sem descrição adicional."}</p><small>{coupon.minimumOrderCents ? `Pedido mínimo: ${formatPrice(coupon.minimumOrderCents)}` : "Sem pedido mínimo"} · {coupon.maxUses ? `${coupon.usedCount}/${coupon.maxUses} usos` : `${coupon.usedCount} uso(s)`}</small></div><div className="promotion-actions"><button className="outline-button" type="button" onClick={() => edit(coupon)}>Editar</button><button className="approve" type="button" onClick={() => statusMutation.mutate({ id: coupon.id, status: coupon.status === "active" ? "archived" : "active" })}>{coupon.status === "active" ? "Encerrar" : "Ativar"}</button><button className="danger-button" type="button" onClick={() => { if (window.confirm(`Remover o cupom ${coupon.code}?`)) removeMutation.mutate({ id: coupon.id }); }}>Remover</button></div></article>)}</section></section>;
}

function InfoCard({ title, text }: { title: string; text: string }) { return <article className="info-card"><ShieldCheck size={18} /><h3>{title}</h3><p>{text}</p></article>; }

function MoneyCard({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) { return <article className="metric-card"><div className="metric-icon">{icon}</div><div><p>{title}</p><strong>—</strong><small>{detail}</small></div></article>; }

function Financeiro({ onNotice }: { onNotice: (message: string) => void }) { return <section className="page-grid finance-page"><div className="summary-row"><MoneyCard icon={<WalletCards size={20} />} title="Receita de pedidos" detail="pagamentos confirmados" /><MoneyCard icon={<Tags size={20} />} title="Descontos aplicados" detail="cupons e promoções" /><MoneyCard icon={<MapPinned size={20} />} title="Custos de entrega" detail="operações concluídas" /><MoneyCard icon={<CreditCard size={20} />} title="Saldo do período" detail="após ajustes disponíveis" /></div><div className="two-column"><ChartCard title="Fluxo financeiro" subtitle="Entradas e saídas do período" icon={<BarChart3 size={17} />} /><ChartCard title="Vendas por período" subtitle="Dados aparecem após pedidos confirmados" icon={<ReceiptText size={17} />} /></div><section className="table-card"><div className="card-heading"><div><h2>Movimentações</h2><p>Transações confirmadas, descontos e taxas de entrega.</p></div><button className="outline-button" type="button" onClick={() => onNotice("A exportação será liberada quando houver movimentações reais.")}>Exportar</button></div><div className="table-scroll"><div className="table-head finance-table"><span>Data</span><span>Tipo</span><span>Referência</span><span>Origem</span><span>Valor</span></div>{[1, 2, 3].map((item) => <div className="table-placeholder finance-table" key={item}><i /><i /><i /><i /><i /></div>)}</div><p className="empty-caption"><HeartHandshake size={16} /> Os dados financeiros serão exibidos quando houver movimentações reais disponíveis.</p></section></section>; }

function ChartCard({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) { return <article className="chart-card"><div className="chart-title"><div className="inline-icon">{icon}</div><div><h2>{title}</h2><p>{subtitle}</p></div><ChevronDown size={14} /></div><div className="chart-grid" /><div className="chart-empty">—</div></article>; }

function Clientes() { return <section className="page-grid clients-page"><div className="toolbar"><label className="search-box"><span className="sr-only">Buscar cliente</span><input placeholder="Buscar cliente por nome, e-mail ou telefone" /></label><button className="outline-button" type="button">Filtrar <ChevronDown size={14} /></button></div><div className="clients-layout"><section className="table-card clients-table-card"><div className="card-heading"><div><h2>Base de clientes</h2><p>Dados aparecem somente após cadastro ou pedido realizado.</p></div><span className="count-pill">— clientes</span></div><div className="table-scroll"><div className="table-head clients-table"><span>Cliente</span><span>Contato</span><span>Pedidos</span><span>Último pedido</span><span>Status</span></div>{[1, 2, 3, 4].map((item) => <div className="table-placeholder clients-table" key={item}><i /><i /><i /><i /><i /></div>)}</div><p className="empty-caption"><UsersRound size={16} /> Nenhum cliente será listado até haver dados reais de cadastro ou compra.</p></section><aside className="profile-panel"><div className="empty-avatar"><UsersRound size={24} /></div><h2>Perfil do cliente</h2><p>Selecione um cliente para consultar contato, endereços salvos e histórico de pedidos.</p></aside></div></section>; }

function Avaliacoes({ onNotice }: { onNotice: (message: string) => void }) { const [selected, setSelected] = useState(false); return <section className="page-grid reviews-page"><div className="review-tabs"><button className="active" type="button">Pendentes <b>—</b></button><button type="button">Aprovadas <b>—</b></button><button type="button">Ocultas <b>—</b></button></div><div className="reviews-layout"><section className="table-card review-queue"><div className="card-heading"><div><h2>Avaliações recebidas</h2><p>Somente avaliações reais de pedidos concluídos aparecem nesta lista.</p></div><MessageSquareHeart size={20} /></div><p className="empty-caption"><Star size={16} /> Nenhuma avaliação real disponível para moderação neste momento.</p></section><aside className="moderation-panel"><div className="panel-heading"><div className="inline-icon"><Star size={17} /></div><div><h2>Moderação de avaliação</h2><p>Selecione uma avaliação real para analisar.</p></div></div><div className="review-detail-empty"><div /><div /><div /></div><label className="publish-toggle"><span><b>Aprovar para exibir no rodapé da landing page</b><small>Somente após aprovação manual.</small></span><input checked={selected} onChange={(event) => setSelected(event.target.checked)} type="checkbox" aria-label="Exibir no footer" /><em /></label><div className="footer-preview"><div><FileText size={16} /><b>Prévia do footer</b></div><p>Avaliações reais aprovadas aparecem aqui.</p></div><div className="moderation-actions"><button className="approve" type="button" onClick={() => onNotice("A aprovação estará disponível quando houver uma avaliação real para moderar.")}>Aprovar</button><button className="outline-button" type="button">Ocultar</button></div></aside></div></section>; }

function Marketing({ onNavigate }: { onNavigate: (view: AdminView) => void }) { const promotionsQuery = trpc.promotions.publicList.useQuery(undefined, { retry: false }); const couponsQuery = trpc.coupons.list.useQuery(undefined, { retry: false }); const activePromotion = promotionsQuery.data?.[0]; const activeCoupons = couponsQuery.data?.filter((coupon) => coupon.status === "active") ?? []; return <section className="page-grid marketing-page"><div className="marketing-stat-row"><article><Tags size={19} /><b>{promotionsQuery.data?.length ?? 0}</b><span>campanha(s) ativa(s)</span></article><article><ReceiptText size={19} /><b>{activeCoupons.length}</b><span>cupom(ns) ativo(s)</span></article><article><Star size={19} /><b>—</b><span>avaliações aprovadas</span></article></div><div className="marketing-layout"><section className="table-card campaign-card"><div className="card-heading"><div><p className="eyebrow">CAMPANHA EM DESTAQUE</p><h2>{activePromotion ? activePromotion.title : "Nenhuma campanha ativa"}</h2><p>{activePromotion ? activePromotion.description : "Crie e ative uma promoção para que ela apareça aqui, na landing page e no cardápio."}</p></div>{activePromotion && <span className="promotion-status active">No ar</span>}</div>{activePromotion ? <div className="marketing-live-campaign">{activePromotion.image1Url && <img src={activePromotion.image1Url} alt={activePromotion.title} />}<div><small>{activePromotion.badge || "PROMOÇÃO ATIVA"}</small><b>{activePromotion.salePriceCents ? formatPrice(activePromotion.salePriceCents) : formatPrice(activePromotion.originalPriceCents)}</b>{activePromotion.salePriceCents && <s>{formatPrice(activePromotion.originalPriceCents)}</s>}<p>Publicada automaticamente na landing page e no cardápio.</p></div></div> : <p className="empty-caption"><Tags size={16} /> A campanha aparecerá aqui quando estiver ativa e dentro da vigência.</p>}<div className="marketing-action-grid"><button className="outline-button" type="button" onClick={() => onNavigate("promocoes")}>Gerenciar promoções</button><button className="outline-button" type="button" onClick={() => onNavigate("cupons")}>Gerenciar cupons</button></div><Campaign icon={<MapPinned size={20} />} title="Área de entrega" text="Atualize mapa, raio e mensagem para fora da cobertura." action="Abrir integrações" onClick={() => onNavigate("integracoes")} /><Campaign icon={<Star size={20} />} title="Avaliações no footer" text="Use apenas avaliações reais aprovadas na área de Avaliações." action="Revisar" onClick={() => onNavigate("avaliacoes")} /></section><aside className="landing-preview"><p>PRÉVIA DA LANDING PAGE</p><h2>{activePromotion?.title || "Frango assado, pedido simples e entrega acompanhada."}</h2>{activePromotion ? <><p>{activePromotion.description}</p><strong>{activePromotion.salePriceCents ? formatPrice(activePromotion.salePriceCents) : formatPrice(activePromotion.originalPriceCents)}</strong></> : <div className="preview-route"><span /><i /><span /></div>}<button type="button" onClick={() => onNavigate("cardapio")}>Ver cardápio</button></aside></div></section>; }

function Campaign({ icon, title, text, action, onClick }: { icon: React.ReactNode; title: string; text: string; action: string; onClick: () => void }) { return <div className="campaign-block">{icon}<div><b>{title}</b><small>{text}</small></div><button className="outline-button" type="button" onClick={onClick}>{action}</button></div>; }

function Operacoes({ onNotice }: { onNotice: (message: string) => void }) { return <section className="page-grid operations-page"><div className="operations-summary"><div><h2>Central de operações</h2><p>Concentre aprovação, preparo, despacho e acompanhamento de entregas.</p></div><button className="approve" type="button" onClick={() => onNotice("A operação será atualizada quando existirem pedidos ativos.")}>Atualizar operação</button></div><div className="operations-layout"><section className="table-card workflow-card"><div className="card-heading"><div><h2>Fila de pedidos</h2><p>Os pedidos reais aparecerão aqui por etapa operacional.</p></div><ClipboardList size={20} /></div>{["Em análise", "Em preparo", "Prontos para despacho", "Em rota"].map((label) => <div className="operation-lane" key={label}><b>{label}</b><span>— pedidos</span><i /></div>)}<p className="empty-caption"><Package size={16} /> Sem pedidos ativos para exibir neste momento.</p></section><aside className="operations-map"><div className="map-header"><MapPinned size={17} /><div><h2>Mapa operacional</h2><p>Entregas ativas aparecem quando houver dados da integração.</p></div></div><div className="map-grid"><span className="origin-pin" /><span className="delivery-pin" /><i /></div><div className="map-legend"><span><b /> Origem</span><span><b /> Entrega ativa</span></div></aside></div></section>; }

type IntegrationProvider = "stripe" | "mercado_pago" | "google_maps" | "whatsapp" | "email" | "assistant_ia";

const integrationCatalog: { provider: IntegrationProvider; title: string; text: string; label: string; webhook: boolean }[] = [
  { provider: "stripe", title: "Stripe", text: "Cartões, checkout hospedado e confirmação assinada.", label: "Chave secreta Stripe", webhook: true },
  { provider: "mercado_pago", title: "Mercado Pago", text: "Checkout Pro, Pix e notificações de pagamento.", label: "Access Token Mercado Pago", webhook: true },
  { provider: "google_maps", title: "Mapas e distância", text: "Endereço, raio de entrega e rota.", label: "Chave da API Google Maps", webhook: false },
  { provider: "whatsapp", title: "WhatsApp", text: "Eventos de pedido e encaminhamento humano.", label: "Token do webhook WhatsApp", webhook: true },
  { provider: "email", title: "E-mail", text: "Confirmação de conta e atualizações do pedido.", label: "Chave do provedor de e-mail", webhook: false },
  { provider: "assistant_ia", title: "Assistente de IA", text: "Dúvidas e encaminhamento de atendimento.", label: "Chave do assistente de IA", webhook: false },
];

function Integracoes({ onNotice }: { onNotice: (message: string) => void }) {
  const { user, isAuthenticated } = useAuth();
  const canManage = isAuthenticated && user?.role === "admin";
  const [selected, setSelected] = useState<IntegrationProvider | null>(null);
  const [secret, setSecret] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const statusQuery = trpc.integrations.list.useQuery(undefined, { enabled: canManage, retry: false });
  const saveMutation = trpc.integrations.saveCredential.useMutation({ onSuccess: (result) => { setSecret(""); setWebhookSecret(""); setSelected(null); statusQuery.refetch(); onNotice(`${result.provider}: credencial salva com segurança e exibida de forma mascarada.`); }, onError: () => onNotice("Não foi possível salvar a credencial. Entre como administrador e confira os dados informados.") });
  const selectedItem = integrationCatalog.find((item) => item.provider === selected);
  const configured = new Map((statusQuery.data ?? []).map((item) => [item.provider, item]));
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!selectedItem) return; saveMutation.mutate({ provider: selectedItem.provider, label: selectedItem.title, secret, webhookUrl, webhookSecret: webhookSecret || undefined }); };
  return <section className="page-grid integrations-page"><div className="integration-intro"><Settings2 size={24} /><div><h2>Conexões seguras</h2><p>Cadastre cada chave por aqui. Depois do salvamento, o painel mostra apenas uma versão mascarada e o status da conexão.</p></div></div>{!canManage && <div className="integration-access-note"><ShieldCheck size={16} /> Entre com a conta administradora para consultar ou salvar credenciais de integração.</div>}<div className="integration-grid">{integrationCatalog.map((item) => { const itemStatus = configured.get(item.provider); return <article key={item.provider}><ShieldCheck size={18} /><h3>{item.title}</h3><p>{item.text}</p><small className={itemStatus?.isEnabled ? "integration-status configured" : "integration-status"}>{itemStatus?.isEnabled ? `Configurada: ${itemStatus.maskedSecret}` : "Ainda não configurada"}</small><button className="outline-button" type="button" onClick={() => { if (!canManage) { onNotice("Faça login como administrador para configurar integrações."); return; } setSelected(item.provider); }}>Configurar</button></article>; })}</div>{selectedItem && <form className="integration-form" onSubmit={submit}><div><p className="eyebrow">CONFIGURAÇÃO PROTEGIDA</p><h2>{selectedItem.title}</h2><p>O valor é cifrado no servidor. Não será mostrado novamente em texto completo.</p></div><label>{selectedItem.label}<input value={secret} onChange={(event) => setSecret(event.target.value)} type="password" autoComplete="off" required minLength={8} placeholder="Cole a chave privada" /></label>{selectedItem.webhook && <><label>URL do webhook (opcional)<input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} type="url" placeholder="https://seu-dominio.com/webhooks/..." /></label><label>Segredo de assinatura do webhook (opcional)<input value={webhookSecret} onChange={(event) => setWebhookSecret(event.target.value)} type="password" autoComplete="off" placeholder="Cole o segredo de assinatura" /></label></>}<div className="integration-form-actions"><button className="approve" disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? "Salvando…" : "Salvar com segurança"}</button><button className="outline-button" type="button" onClick={() => { setSelected(null); setSecret(""); setWebhookSecret(""); }}>Cancelar</button></div></form>}<EmailDeliverySettings canManage={canManage} onNotice={onNotice} /></section>;
}

type EmailProvider = "resend" | "smtp";
type EmailNotificationKey = "login" | "passwordReset" | "passwordChanged" | "orderUpdates" | "errors" | "discounts";
const notificationLabels: Record<EmailNotificationKey, string> = { login: "Aviso de novo login", passwordReset: "Link de recuperação de senha", passwordChanged: "Aviso de alteração de senha", orderUpdates: "Atualizações de pedido", errors: "Erros e avisos operacionais", discounts: "Promoções e descontos" };
const defaultEmailNotifications: Record<EmailNotificationKey, boolean> = { login: true, passwordReset: true, passwordChanged: true, orderUpdates: true, errors: true, discounts: true };

function EmailDeliverySettings({ canManage, onNotice }: { canManage: boolean; onNotice: (message: string) => void }) {
  const utils = trpc.useUtils();
  const settingsQuery = trpc.emailDelivery.list.useQuery(undefined, { enabled: canManage, retry: false });
  const [provider, setProvider] = useState<EmailProvider>("resend");
  const [senderName, setSenderName] = useState("Prime Frango Assado");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [testRecipient, setTestRecipient] = useState("");
  const [notifications, setNotifications] = useState(defaultEmailNotifications);
  const saveMutation = trpc.emailDelivery.save.useMutation({ onSuccess: async () => { setSecret(""); await utils.emailDelivery.list.invalidate(); onNotice("Configuração de e-mail salva com credenciais cifradas."); }, onError: (error) => onNotice(error.message || "Não foi possível salvar a configuração de e-mail.") });
  const testMutation = trpc.emailDelivery.sendTest.useMutation({ onSuccess: () => onNotice("E-mail de teste enviado. Confira a caixa de entrada e o spam."), onError: (error) => onNotice(error.message || "Não foi possível enviar o e-mail de teste.") });
  const saved = new Map((settingsQuery.data ?? []).map((item) => [item.provider, item]));
  const selectProvider = (next: EmailProvider) => { setProvider(next); setSecret(""); const current = saved.get(next); if (!current) return; setSenderName(current.senderName); setSenderEmail(current.senderEmail); setReplyToEmail(current.replyToEmail || ""); setSmtpHost(current.smtpHost || ""); setSmtpPort(current.smtpPort ? String(current.smtpPort) : "587"); try { setNotifications({ ...defaultEmailNotifications, ...JSON.parse(current.notificationsJson) }); } catch { setNotifications(defaultEmailNotifications); } };
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!canManage) return onNotice("Entre como administrador para salvar a integração de e-mail."); saveMutation.mutate({ provider, senderName, senderEmail, replyToEmail, secret, smtpHost, smtpPort: provider === "smtp" ? Number(smtpPort) : null, smtpUsername, notifications }); };
  const requestTest = () => { if (!testRecipient) return onNotice("Informe um e-mail para receber o teste."); if (!window.confirm(`Enviar um e-mail de teste real para ${testRecipient}?`)) return; testMutation.mutate({ provider, recipient: testRecipient }); };
  return <section className="email-delivery-settings"><div className="email-settings-heading"><div><p className="eyebrow">E-MAIL TRANSACIONAL</p><h2>Resend ou e-mail profissional por SMTP</h2><p>Defina o remetente e os avisos que devem sair pela sua conta. As senhas e chaves ficam cifradas no servidor; dados públicos de entrega, como remetente e host, são guardados para permitir o envio.</p></div><ShieldCheck size={22} /></div><div className="email-provider-tabs"><button type="button" className={provider === "resend" ? "active" : ""} onClick={() => selectProvider("resend")}><b>Resend</b><small>{saved.get("resend")?.isEnabled ? `Configurado · ${saved.get("resend")?.maskedSecret}` : "API de e-mail com domínio verificado"}</small></button><button type="button" className={provider === "smtp" ? "active" : ""} onClick={() => selectProvider("smtp")}><b>SMTP profissional</b><small>{saved.get("smtp")?.isEnabled ? `Configurado · ${saved.get("smtp")?.maskedSecret}` : "Use seu provedor de e-mail"}</small></button></div><form className="email-settings-form" onSubmit={submit}><div className="email-form-grid"><label>Nome do remetente<input required value={senderName} onChange={(event) => setSenderName(event.target.value)} placeholder="Ex.: Prime Frango Assado" /></label><label>E-mail do remetente<input required type="email" value={senderEmail} onChange={(event) => setSenderEmail(event.target.value)} placeholder="pedidos@seudominio.com" /></label><label>Responder para (opcional)<input type="email" value={replyToEmail} onChange={(event) => setReplyToEmail(event.target.value)} placeholder="contato@seudominio.com" /></label><label>{provider === "resend" ? "Chave de API Resend" : "Senha SMTP ou senha de aplicativo"}<input required value={secret} onChange={(event) => setSecret(event.target.value)} type="password" autoComplete="new-password" minLength={4} placeholder={provider === "resend" ? "re_..." : "Cole a senha SMTP"} /></label></div>{provider === "smtp" && <div className="email-form-grid smtp-fields"><label>Servidor SMTP<input required value={smtpHost} onChange={(event) => setSmtpHost(event.target.value)} placeholder="smtp.seudominio.com" /></label><label>Porta SMTP<input required type="number" min="1" max="65535" value={smtpPort} onChange={(event) => setSmtpPort(event.target.value)} placeholder="587" /></label><label>Usuário SMTP<input required value={smtpUsername} onChange={(event) => setSmtpUsername(event.target.value)} placeholder="seu usuário ou e-mail" /></label></div>}<div className="email-notification-list"><div><b>Quais e-mails devem ser enviados?</b><small>O aviso de novo login já é acionado pelo acesso OAuth. Os demais eventos ficam registrados para a próxima etapa, quando existirem fluxos locais de senha, pedidos e campanhas com destinatários consentidos.</small></div>{(Object.keys(notificationLabels) as EmailNotificationKey[]).map((key) => <label key={key}><input type="checkbox" checked={notifications[key]} onChange={(event) => setNotifications({ ...notifications, [key]: event.target.checked })} /><span>{notificationLabels[key]}</span></label>)}</div><div className="email-form-actions"><button className="approve" type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "Salvando…" : "Salvar configuração"}<ShieldCheck size={15} /></button><div><input type="email" value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} placeholder="Seu e-mail para teste" aria-label="E-mail destinatário do teste" /><button className="outline-button" type="button" disabled={testMutation.isPending} onClick={requestTest}>{testMutation.isPending ? "Enviando…" : "Enviar teste"}</button></div></div></form></section>;
}

function CookieBanner() { const [preference, setPreference] = useState<"loading" | CookiePreference | "pending">("loading"); useEffect(() => { const saved = readCookiePreference(window.localStorage); setPreference(saved ?? "pending"); }, []); const save = (choice: CookiePreference) => { setPreference(saveCookiePreference(window.localStorage, choice)); }; if (preference !== "pending") return null; return <section className="cookie-banner" role="dialog" aria-label="Preferências de cookies"><Cookie size={22} /><div><h2>Preferências de cookies</h2><p>Usamos cookies necessários para o funcionamento do site. Você pode permitir cookies de medição para ajudar a melhorar a experiência.</p></div><div className="cookie-actions"><button className="outline-button" onClick={() => save("necessary")} type="button">Usar somente necessários</button><button className="approve" onClick={() => save("accepted")} type="button">Aceitar medição</button></div></section>; }
