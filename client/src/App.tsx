import {
  ArrowRight,
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
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./_core/hooks/useAuth";
import { readCookiePreference, saveCookiePreference, type CookiePreference } from "./cookiePreferences";
import { trpc } from "./lib/trpc";
import { adminViewFromPath, publicRoutes, publicViewFromPath, type AdminView, type PublicView } from "./navigation";

const logo = "/manus-storage/prime-frango-logo-3d_7921a8ac.png";

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
      {isAdmin ? <AdminShell view={adminViewFromPath(currentPath)} navigate={navigate} /> : <PublicShell view={publicViewFromPath(currentPath)} navigate={navigate} />}
      <CookieBanner />
    </>
  );
}

function PublicShell({ view, navigate }: { view: PublicView; navigate: (path: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
      {view === "cardapio" && <MenuPage go={go} />}
      {view === "quem-somos" && <AboutPage go={go} />}
      {view === "acompanhar" && <TrackingPage go={go} />}
      {view === "acesso" && <AccessPage go={go} />}
      {view === "checkout" && <CheckoutPage go={go} />}
      <footer className="landing-footer"><img src={logo} alt="Prime Frango Assado" /><button onClick={() => go("cardapio")} type="button">Cardápio</button><button onClick={() => go("quem-somos")} type="button">Quem Somos</button><button onClick={() => go("acompanhar")} type="button">Acompanhar pedido</button><button onClick={() => go("acesso")} type="button">Minha conta</button></footer>
    </div>
  );
}

function LandingPage({ go }: { go: (view: PublicView) => void }) {
  return <main>
    <section className="landing-hero">
      <div><p className="eyebrow">PEDIDO, PREPARO E ENTREGA</p><h1>Frango assado com uma jornada de pedido clara.</h1><p>Cardápio, área de entrega, acompanhamento e suporte em uma experiência conectada para a Prime Frango Assado.</p><div className="hero-actions"><button className="hero-primary" onClick={() => go("cardapio")} type="button">Ver cardápio <ArrowRight size={15} /></button><button className="hero-secondary" onClick={() => go("quem-somos")} type="button">Conheça a marca</button></div></div>
      <div className="hero-product" aria-label="Identidade visual tridimensional da Prime Frango Assado"><img src={logo} alt="Logo 3D da Prime Frango Assado" /><i /><span>3D</span></div>
    </section>
    <section className="landing-sections"><article><MapPinned size={19} /><div><h2>Área de entrega</h2><p>O checkout valida o endereço contra o raio configurado pela operação antes do pagamento.</p></div></article><article><ClipboardList size={19} /><div><h2>Pedido acompanhado</h2><p>Cliente autenticado pode consultar o código, os estágios e a entrega quando houver integração ativa.</p></div></article><article><MessageCircle size={19} /><div><h2>Suporte antes do WhatsApp</h2><p>O chat orienta sobre cardápio, cobertura e status antes de encaminhar o atendimento humano.</p></div></article></section>
    <section className="landing-review-note"><Star size={20} /><div><p className="eyebrow">AVALIAÇÕES REAIS</p><h2>O footer publica somente avaliações reais aprovadas pelo proprietário.</h2><p>Nenhum depoimento aparece até que exista uma avaliação de pedido concluído e moderada na área administrativa.</p></div></section>
  </main>;
}

function MenuPage({ go }: { go: (view: PublicView) => void }) {
  return <main className="content-page menu-page"><div className="page-intro"><p className="eyebrow">CARDÁPIO</p><h1>Escolha seus itens e ajuste o carrinho.</h1><p>Produtos, promoções e disponibilidade serão configurados pelo painel administrativo. Esta visão preserva uma compra clara, sem inventar preço ou estoque.</p></div><div className="menu-layout"><section className="menu-categories"><button className="active" type="button">Frangos assados</button><button type="button">Bebidas</button><button type="button">Acompanhamentos</button><button type="button">Promoção do dia</button></section><section className="menu-empty"><Package size={32} /><h2>Cardápio pronto para configuração</h2><p>Os itens reais serão exibidos aqui após o proprietário preencher categorias, produtos, preços e disponibilidade no painel.</p></section><aside className="cart-summary"><p className="eyebrow">CARRINHO</p><h2>Seu pedido</h2><p>Adicione itens do cardápio para ver o resumo, o cupom e a entrega.</p><button onClick={() => go("checkout")} type="button">Ir para checkout <ArrowRight size={14} /></button></aside></div></main>;
}

function AboutPage({ go }: { go: (view: PublicView) => void }) {
  return <main className="about-page"><section className="about-hero"><div><p className="eyebrow">PRIME FRANGO ASSADO</p><h1>Da brasa ao seu pedido, com sabor e cuidado em cada etapa.</h1><p className="about-lead">Uma página institucional para apresentar a história, o preparo e a forma como a marca organiza o atendimento e as entregas.</p><button className="hero-primary" onClick={() => go("cardapio")} type="button">Conhecer o cardápio <ArrowRight size={15} /></button></div><div className="about-mark"><img src={logo} alt="Logo Prime Frango Assado" /><span>ASSADO COM IDENTIDADE</span></div></section><section className="about-pillars"><article><b>01</b><h2>Preparo</h2><p>O conteúdo institucional explica o cuidado da operação sem substituir informações reais do estabelecimento.</p></article><article><b>02</b><h2>Pedido</h2><p>O cliente encontra cardápio, promoções, cupom e uma jornada de compra objetiva.</p></article><article><b>03</b><h2>Entrega</h2><p>O acompanhamento mostra etapas do pedido e disponibilidade da entrega quando configurada.</p></article></section></main>;
}

function TrackingPage({ go }: { go: (view: PublicView) => void }) {
  return <main className="content-page tracking-page"><div className="page-intro"><p className="eyebrow">ACOMPANHAMENTO</p><h1>Consulte seu pedido com segurança.</h1><p>Entre na conta para visualizar o código de pedido, o histórico e os estágios de preparo e entrega.</p></div><section className="tracking-empty"><ClipboardList size={32} /><h2>Nenhum pedido disponível nesta sessão</h2><p>Quando estiver autenticado e houver pedidos, esta área apresentará o código, o status e o mapa de acompanhamento quando a logística fornecer dados.</p><button onClick={() => go("acesso")} type="button">Entrar na minha conta</button></section></main>;
}

function AccessPage({ go }: { go: (view: PublicView) => void }) {
  return <main className="access-page"><section className="access-card"><p className="eyebrow">CONTA DO CLIENTE</p><h1>Entrar ou criar uma conta</h1><p>O fluxo de conta final terá confirmação de e-mail antes da ativação e coleta de nome completo, telefone, endereço, e-mail e CPF.</p><div className="access-actions"><button className="hero-primary" onClick={() => go("checkout")} type="button">Continuar para checkout</button><button className="hero-secondary" onClick={() => go("cardapio")} type="button">Voltar ao cardápio</button></div><small>A autenticação e o envio de e-mail serão ativados após a conexão segura dos serviços no painel administrativo.</small></section></main>;
}

function CheckoutPage({ go }: { go: (view: PublicView) => void }) {
  const [provider, setProvider] = useState<"stripe" | "mercado_pago" | null>(null);
  const providersQuery = trpc.payments.availableProviders.useQuery(undefined, { retry: false });
  const available = new Set((providersQuery.data ?? []).map((item) => item.provider));
  return <main className="content-page checkout-page"><div className="page-intro"><p className="eyebrow">CHECKOUT</p><h1>Revise o pedido antes de pagar.</h1><p>O carrinho, o endereço, o cupom, a cobertura e o pagamento serão validados em sequência.</p></div><section className="checkout-grid"><article><h2>1. Seu pedido</h2><p>O resumo será preenchido pelos itens escolhidos no cardápio.</p></article><article><h2>2. Endereço e cobertura</h2><p>A distância é calculada a partir da origem configurada e o checkout é bloqueado fora do raio de entrega.</p></article><article><h2>3. Pagamento</h2><p>Escolha um provedor configurado antes de continuar.</p><div className="payment-options"><button className={provider === "stripe" ? "selected" : ""} disabled={!available.has("stripe")} onClick={() => setProvider("stripe")} type="button">Stripe {available.has("stripe") ? "pronto" : "aguardando conexão"}</button><button className={provider === "mercado_pago" ? "selected" : ""} disabled={!available.has("mercado_pago")} onClick={() => setProvider("mercado_pago")} type="button">Mercado Pago {available.has("mercado_pago") ? "pronto" : "aguardando conexão"}</button></div></article></section><button className="hero-primary" onClick={() => go("acesso")} type="button">{provider ? `Entrar para continuar com ${provider === "stripe" ? "Stripe" : "Mercado Pago"}` : "Entrar para continuar"}</button></main>;
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
  if (view === "financeiro") return <Financeiro onNotice={onNotice} />;
  if (view === "clientes") return <Clientes />;
  if (view === "avaliacoes") return <Avaliacoes onNotice={onNotice} />;
  if (view === "marketing") return <Marketing onNavigate={onNavigate} />;
  if (view === "operacoes") return <Operacoes onNotice={onNotice} />;
  if (view === "integracoes") return <Integracoes onNotice={onNotice} />;
  const map: Record<Exclude<AdminView, "financeiro" | "clientes" | "avaliacoes" | "marketing" | "operacoes" | "integracoes">, { title: string; text: string; action: string; icon: typeof Package }> = {
    dashboard: { title: "Indicadores do negócio", text: "Pedidos do dia, receita, ticket médio, entregas e tendências aparecem quando existirem dados confirmados.", action: "Ver operações", icon: BarChart3 }, pedidos: { title: "Central de pedidos", text: "Pedidos pagos entram em análise e só seguem para preparo após aprovação administrativa.", action: "Abrir operações", icon: ClipboardList }, mapa: { title: "Mapa de entregas", text: "O mapa apresenta origem, rota e posições de entrega apenas quando a logística disponibilizar localização.", action: "Ver operações", icon: MapPinned }, cardapio: { title: "Gestão de cardápio", text: "Cadastre frangos, bebidas, acompanhamentos, preços e disponibilidade do dia.", action: "Ver marketing", icon: Package }, promocoes: { title: "Promoções do dia", text: "Programe campanhas, vigência e produtos em destaque na landing page e no cardápio.", action: "Ver marketing", icon: Tags }, cupons: { title: "Códigos de desconto", text: "Crie regras de validade, percentual ou valor e limite de uso para cada cupom.", action: "Ver marketing", icon: ReceiptText },
  };
  const item = map[view as keyof typeof map]; const Icon = item.icon;
  return <section className="admin-module"><article className="module-hero"><div className="module-icon"><Icon size={24} /></div><div><p className="eyebrow">MÓDULO ADMINISTRATIVO</p><h2>{item.title}</h2><p>{item.text}</p></div><button className="approve" type="button" onClick={() => onNavigate(view === "dashboard" || view === "pedidos" || view === "mapa" ? "operacoes" : "marketing")}>{item.action}<ArrowRight size={14} /></button></article><div className="module-cards"><InfoCard title="Dados reais" text="A interface permanece vazia até a operação registrar informações válidas." /><InfoCard title="Acesso controlado" text="O módulo pertence à área administrativa e será protegido por autenticação." /><InfoCard title="Próxima ação" text="Use o botão principal para chegar ao módulo operacional correspondente." /></div></section>;
}

function InfoCard({ title, text }: { title: string; text: string }) { return <article className="info-card"><ShieldCheck size={18} /><h3>{title}</h3><p>{text}</p></article>; }

function MoneyCard({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) { return <article className="metric-card"><div className="metric-icon">{icon}</div><div><p>{title}</p><strong>—</strong><small>{detail}</small></div></article>; }

function Financeiro({ onNotice }: { onNotice: (message: string) => void }) { return <section className="page-grid finance-page"><div className="summary-row"><MoneyCard icon={<WalletCards size={20} />} title="Receita de pedidos" detail="pagamentos confirmados" /><MoneyCard icon={<Tags size={20} />} title="Descontos aplicados" detail="cupons e promoções" /><MoneyCard icon={<MapPinned size={20} />} title="Custos de entrega" detail="operações concluídas" /><MoneyCard icon={<CreditCard size={20} />} title="Saldo do período" detail="após ajustes disponíveis" /></div><div className="two-column"><ChartCard title="Fluxo financeiro" subtitle="Entradas e saídas do período" icon={<BarChart3 size={17} />} /><ChartCard title="Vendas por período" subtitle="Dados aparecem após pedidos confirmados" icon={<ReceiptText size={17} />} /></div><section className="table-card"><div className="card-heading"><div><h2>Movimentações</h2><p>Transações confirmadas, descontos e taxas de entrega.</p></div><button className="outline-button" type="button" onClick={() => onNotice("A exportação será liberada quando houver movimentações reais.")}>Exportar</button></div><div className="table-scroll"><div className="table-head finance-table"><span>Data</span><span>Tipo</span><span>Referência</span><span>Origem</span><span>Valor</span></div>{[1, 2, 3].map((item) => <div className="table-placeholder finance-table" key={item}><i /><i /><i /><i /><i /></div>)}</div><p className="empty-caption"><HeartHandshake size={16} /> Os dados financeiros serão exibidos quando houver movimentações reais disponíveis.</p></section></section>; }

function ChartCard({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) { return <article className="chart-card"><div className="chart-title"><div className="inline-icon">{icon}</div><div><h2>{title}</h2><p>{subtitle}</p></div><ChevronDown size={14} /></div><div className="chart-grid" /><div className="chart-empty">—</div></article>; }

function Clientes() { return <section className="page-grid clients-page"><div className="toolbar"><label className="search-box"><span className="sr-only">Buscar cliente</span><input placeholder="Buscar cliente por nome, e-mail ou telefone" /></label><button className="outline-button" type="button">Filtrar <ChevronDown size={14} /></button></div><div className="clients-layout"><section className="table-card clients-table-card"><div className="card-heading"><div><h2>Base de clientes</h2><p>Dados aparecem somente após cadastro ou pedido realizado.</p></div><span className="count-pill">— clientes</span></div><div className="table-scroll"><div className="table-head clients-table"><span>Cliente</span><span>Contato</span><span>Pedidos</span><span>Último pedido</span><span>Status</span></div>{[1, 2, 3, 4].map((item) => <div className="table-placeholder clients-table" key={item}><i /><i /><i /><i /><i /></div>)}</div><p className="empty-caption"><UsersRound size={16} /> Nenhum cliente será listado até haver dados reais de cadastro ou compra.</p></section><aside className="profile-panel"><div className="empty-avatar"><UsersRound size={24} /></div><h2>Perfil do cliente</h2><p>Selecione um cliente para consultar contato, endereços salvos e histórico de pedidos.</p></aside></div></section>; }

function Avaliacoes({ onNotice }: { onNotice: (message: string) => void }) { const [selected, setSelected] = useState(false); return <section className="page-grid reviews-page"><div className="review-tabs"><button className="active" type="button">Pendentes <b>—</b></button><button type="button">Aprovadas <b>—</b></button><button type="button">Ocultas <b>—</b></button></div><div className="reviews-layout"><section className="table-card review-queue"><div className="card-heading"><div><h2>Avaliações recebidas</h2><p>Somente avaliações reais de pedidos concluídos aparecem nesta lista.</p></div><MessageSquareHeart size={20} /></div><p className="empty-caption"><Star size={16} /> Nenhuma avaliação real disponível para moderação neste momento.</p></section><aside className="moderation-panel"><div className="panel-heading"><div className="inline-icon"><Star size={17} /></div><div><h2>Moderação de avaliação</h2><p>Selecione uma avaliação real para analisar.</p></div></div><div className="review-detail-empty"><div /><div /><div /></div><label className="publish-toggle"><span><b>Aprovar para exibir no rodapé da landing page</b><small>Somente após aprovação manual.</small></span><input checked={selected} onChange={(event) => setSelected(event.target.checked)} type="checkbox" aria-label="Exibir no footer" /><em /></label><div className="footer-preview"><div><FileText size={16} /><b>Prévia do footer</b></div><p>Avaliações reais aprovadas aparecem aqui.</p></div><div className="moderation-actions"><button className="approve" type="button" onClick={() => onNotice("A aprovação estará disponível quando houver uma avaliação real para moderar.")}>Aprovar</button><button className="outline-button" type="button">Ocultar</button></div></aside></div></section>; }

function Marketing({ onNavigate }: { onNavigate: (view: AdminView) => void }) { return <section className="page-grid marketing-page"><div className="summary-row"><MoneyCard icon={<MessageSquareHeart size={20} />} title="Campanhas ativas" detail="configurações publicadas" /><MoneyCard icon={<Tags size={20} />} title="Promoção do dia" detail="agenda e destaque" /><MoneyCard icon={<Star size={20} />} title="Avaliações no footer" detail="somente aprovadas" /><MoneyCard icon={<MessageCircle size={20} />} title="Conversas de suporte" detail="dados reais quando disponíveis" /></div><div className="marketing-layout"><section className="table-card campaign-card"><div className="card-heading"><div><h2>Campanhas e destaques</h2><p>Organize promoções, conteúdo da landing page e chamadas de ação.</p></div></div><Campaign icon={<Tags size={20} />} title="Promoção do dia" text="Defina itens, vigência e posição na landing page." action="Configurar" onClick={() => onNavigate("promocoes")} /><Campaign icon={<MapPinned size={20} />} title="Área de entrega" text="Atualize mapa, raio e mensagem para fora da cobertura." action="Abrir integrações" onClick={() => onNavigate("integracoes")} /><Campaign icon={<Star size={20} />} title="Avaliações no footer" text="Use apenas avaliações reais aprovadas na área de Avaliações." action="Revisar" onClick={() => onNavigate("avaliacoes")} /></section><aside className="landing-preview"><p>PRÉVIA DA LANDING PAGE</p><h2>Frango assado, pedido simples e entrega acompanhada.</h2><div className="preview-route"><span /><i /><span /></div><button type="button" onClick={() => onNavigate("cardapio")}>Ver cardápio</button></aside></div></section>; }

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
  const saveMutation = trpc.integrations.saveCredential.useMutation({
    onSuccess: (result) => { setSecret(""); setWebhookSecret(""); setSelected(null); statusQuery.refetch(); onNotice(`${result.provider}: credencial salva com segurança e exibida de forma mascarada.`); },
    onError: () => onNotice("Não foi possível salvar a credencial. Entre como administrador e confira os dados informados."),
  });
  const selectedItem = integrationCatalog.find((item) => item.provider === selected);
  const configured = new Map((statusQuery.data ?? []).map((item) => [item.provider, item]));
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!selectedItem) return; saveMutation.mutate({ provider: selectedItem.provider, label: selectedItem.title, secret, webhookUrl, webhookSecret: webhookSecret || undefined }); };
  return <section className="page-grid integrations-page"><div className="integration-intro"><Settings2 size={24} /><div><h2>Conexões seguras</h2><p>Cadastre cada chave por aqui. Depois do salvamento, o painel mostra apenas uma versão mascarada e o status da conexão.</p></div></div>{!canManage && <div className="integration-access-note"><ShieldCheck size={16} /> Entre com a conta administradora para consultar ou salvar credenciais de integração.</div>}<div className="integration-grid">{integrationCatalog.map((item) => { const itemStatus = configured.get(item.provider); return <article key={item.provider}><ShieldCheck size={18} /><h3>{item.title}</h3><p>{item.text}</p><small className={itemStatus?.isEnabled ? "integration-status configured" : "integration-status"}>{itemStatus?.isEnabled ? `Configurada: ${itemStatus.maskedSecret}` : "Ainda não configurada"}</small><button className="outline-button" type="button" onClick={() => { if (!canManage) { onNotice("Faça login como administrador para configurar integrações."); return; } setSelected(item.provider); }}>Configurar</button></article>; })}</div>{selectedItem && <form className="integration-form" onSubmit={submit}><div><p className="eyebrow">CONFIGURAÇÃO PROTEGIDA</p><h2>{selectedItem.title}</h2><p>O valor é cifrado no servidor. Não será mostrado novamente em texto completo.</p></div><label>{selectedItem.label}<input value={secret} onChange={(event) => setSecret(event.target.value)} type="password" autoComplete="off" required minLength={8} placeholder="Cole a chave privada" /></label>{selectedItem.webhook && <><label>URL do webhook (opcional)<input value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} type="url" placeholder="https://seu-dominio.com/webhooks/..." /></label><label>Segredo de assinatura do webhook (opcional)<input value={webhookSecret} onChange={(event) => setWebhookSecret(event.target.value)} type="password" autoComplete="off" placeholder="Cole o segredo de assinatura" /></label></>}<div className="integration-form-actions"><button className="approve" disabled={saveMutation.isPending} type="submit">{saveMutation.isPending ? "Salvando…" : "Salvar com segurança"}</button><button className="outline-button" type="button" onClick={() => { setSelected(null); setSecret(""); setWebhookSecret(""); }}>Cancelar</button></div></form>}</section>; }

function CookieBanner() { const [preference, setPreference] = useState<"loading" | CookiePreference | "pending">("loading"); useEffect(() => { const saved = readCookiePreference(window.localStorage); setPreference(saved ?? "pending"); }, []); const save = (choice: CookiePreference) => { setPreference(saveCookiePreference(window.localStorage, choice)); }; if (preference !== "pending") return null; return <section className="cookie-banner" role="dialog" aria-label="Preferências de cookies"><Cookie size={22} /><div><h2>Preferências de cookies</h2><p>Usamos cookies necessários para o funcionamento do site. Você pode permitir cookies de medição para ajudar a melhorar a experiência.</p></div><div className="cookie-actions"><button className="outline-button" onClick={() => save("necessary")} type="button">Usar somente necessários</button><button className="approve" onClick={() => save("accepted")} type="button">Aceitar medição</button></div></section>; }
