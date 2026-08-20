/**
 * Modelo 7: painel administrativo vinho e marfim, fiel ao design aprovado.
 * Esta tela prototipa Financeiro, Clientes e Avaliações sem dados simulados.
 */
import {
  BarChart3,
  Bell,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  HeartHandshake,
  LayoutDashboard,
  MapPinned,
  Megaphone,
  Menu,
  MessageSquareHeart,
  Package,
  ReceiptText,
  Settings2,
  Star,
  Tags,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";

type View = "financeiro" | "clientes" | "avaliacoes" | "marketing" | "operacoes" | "quem-somos" | "landing-vazia" | "landing-avaliacoes";

const navItems = [
  ["Dashboard", LayoutDashboard],
  ["Pedidos", ClipboardList],
  ["Mapa Operacional", MapPinned],
  ["Cardápio", Package],
  ["Promoções", Tags],
  ["Cupons", ReceiptText],
  ["Avaliações", Star, "avaliacoes"],
  ["Clientes", UsersRound, "clientes"],
  ["Financeiro", CircleDollarSign, "financeiro"],
  ["Integrações", Settings2],
  ["Marketing", Megaphone, "marketing"],
  ["Operações", ClipboardList, "operacoes"],
] as const;

function formatView(value: string | null): View {
  return value === "clientes" || value === "avaliacoes" || value === "marketing" || value === "operacoes" || value === "quem-somos" || value === "landing-vazia" || value === "landing-avaliacoes" ? value : "financeiro";
}

function App() {
  const [view, setView] = useState<View>(() => formatView(new URLSearchParams(location.search).get("view")));

  useEffect(() => {
    const listener = () => setView(formatView(new URLSearchParams(location.search).get("view")));
    addEventListener("popstate", listener);
    return () => removeEventListener("popstate", listener);
  }, []);

  const changeView = (next: View) => {
    history.pushState({}, "", `?view=${next}`);
    setView(next);
  };

  if (view === "quem-somos" || view === "landing-vazia" || view === "landing-avaliacoes") {
    return <PublicPrototype view={view} changeView={changeView} />;
  }

  const titles: Record<"financeiro" | "clientes" | "avaliacoes" | "marketing" | "operacoes", string> = {
    financeiro: "Financeiro",
    clientes: "Clientes",
    avaliacoes: "Avaliações",
    marketing: "Marketing",
    operacoes: "Operações",
  };

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <img className="brand-logo" src="/manus-storage/prime-frango-logo-3d_7921a8ac.png" alt="Prime Frango Assado" />
        <p className="admin-label">ADMIN</p>
        <nav aria-label="Navegação administrativa">
          {navItems.map(([label, Icon, route]) => {
            const isCurrent = route === view;
            return (
              <button
                className={`nav-item ${isCurrent ? "active" : ""}`}
                key={label}
                onClick={() => route && changeView(route)}
                type="button"
              >
                <Icon size={15} strokeWidth={1.9} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <button className="collapse" aria-label="Recolher menu"><ChevronDown size={17} /></button>
      </aside>
      <main className="admin-main">
        <Topbar title={titles[view]} />
        {view === "financeiro" && <Financeiro />}
        {view === "clientes" && <Clientes />}
        {view === "avaliacoes" && <Avaliacoes />}
        {view === "marketing" && <Marketing />}
        {view === "operacoes" && <Operacoes />}
      </main>
    </div>
  );
}

function Topbar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{title === "Financeiro" ? "Acompanhe a saúde financeira do seu negócio" : title === "Clientes" ? "Consulte clientes e histórico de relacionamento" : "Modere avaliações reais recebidas após pedidos"}</p>
      </div>
      <div className="topbar-actions">
        <button className="period-button" type="button"><Menu size={14} /> Últimos 30 dias <ChevronDown size={15} /></button>
        <button className="profile-button" type="button"><Bell size={16} /><span>Proprietário</span><ChevronDown size={14} /></button>
      </div>
    </header>
  );
}

function MoneyCard({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <article className="metric-card"><div className="metric-icon">{icon}</div><div><p>{title}</p><strong>—</strong><small>{detail}</small></div></article>;
}

function Financeiro() {
  return (
    <section className="page-grid finance-page">
      <div className="summary-row">
        <MoneyCard icon={<WalletCards size={20} />} title="Receita de pedidos" detail="pagamentos confirmados" />
        <MoneyCard icon={<Tags size={20} />} title="Descontos aplicados" detail="cupons e promoções" />
        <MoneyCard icon={<MapPinned size={20} />} title="Custos de entrega" detail="operações concluídas" />
        <MoneyCard icon={<CreditCard size={20} />} title="Saldo do período" detail="após ajustes disponíveis" />
      </div>
      <div className="two-column">
        <ChartCard title="Fluxo financeiro" subtitle="Entradas e saídas do período" icon={<BarChart3 size={17} />} large />
        <ChartCard title="Vendas por período" subtitle="Dados aparecerão após pedidos confirmados" icon={<ReceiptText size={17} />} />
      </div>
      <section className="table-card">
        <div className="card-heading"><div><h2>Movimentações</h2><p>Transações confirmadas, descontos e taxas de entrega.</p></div><button className="outline-button" type="button">Exportar</button></div>
        <div className="table-head finance-table"><span>Data</span><span>Tipo</span><span>Referência</span><span>Origem</span><span>Valor</span></div>
        {[1, 2, 3].map((item) => <div className="table-placeholder finance-table" key={item}><i /><i /><i /><i /><i /></div>)}
        <p className="empty-caption"><HeartHandshake size={16} /> Os dados financeiros serão exibidos quando houver movimentações reais disponíveis.</p>
      </section>
    </section>
  );
}

function ChartCard({ title, subtitle, icon, large }: { title: string; subtitle: string; icon: React.ReactNode; large?: boolean }) {
  return <article className={`chart-card ${large ? "large" : ""}`}><div className="chart-title"><div className="inline-icon">{icon}</div><div><h2>{title}</h2><p>{subtitle}</p></div><button type="button"><ChevronDown size={14} /></button></div><div className="chart-grid"><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="chart-empty">—</div></article>;
}

function Clientes() {
  return (
    <section className="page-grid clients-page">
      <div className="toolbar"><div className="search-box">Buscar cliente por nome, e-mail ou telefone</div><button className="outline-button" type="button">Filtrar <ChevronDown size={14} /></button></div>
      <div className="clients-layout">
        <section className="table-card clients-table-card">
          <div className="card-heading"><div><h2>Base de clientes</h2><p>Dados aparecem somente após cadastro ou pedido realizado.</p></div><span className="count-pill">— clientes</span></div>
          <div className="table-head clients-table"><span>Cliente</span><span>Contato</span><span>Pedidos</span><span>Último pedido</span><span>Status</span></div>
          {[1, 2, 3, 4, 5].map((item) => <div className="table-placeholder clients-table" key={item}><i /><i /><i /><i /><i /></div>)}
          <p className="empty-caption"><UsersRound size={16} /> Nenhum cliente será listado até haver dados reais de cadastro ou compra.</p>
        </section>
        <aside className="profile-panel">
          <div className="empty-avatar"><UsersRound size={24} /></div>
          <h2>Perfil do cliente</h2>
          <p>Selecione um cliente para consultar contato, endereços salvos e histórico de pedidos.</p>
          <div className="profile-fields"><span>Contato</span><span>Endereços salvos</span><span>Histórico de pedidos</span></div>
        </aside>
      </div>
    </section>
  );
}

function Avaliacoes() {
  return (
    <section className="page-grid reviews-page">
      <div className="review-tabs"><button className="active" type="button">Pendentes <b>—</b></button><button type="button">Aprovadas <b>—</b></button><button type="button">Ocultas <b>—</b></button></div>
      <div className="reviews-layout">
        <section className="table-card review-queue">
          <div className="card-heading"><div><h2>Avaliações recebidas</h2><p>Somente avaliações reais de pedidos concluídos aparecem nesta lista.</p></div><MessageSquareHeart size={20} /></div>
          {[1, 2, 3].map((item) => <div className="review-placeholder" key={item}><div className="review-anon" /><div><i /><i className="short" /></div><span>Nova avaliação</span></div>)}
          <p className="empty-caption"><Star size={16} /> Nenhuma avaliação real disponível para moderação neste momento.</p>
        </section>
        <aside className="moderation-panel">
          <div className="panel-heading"><div className="inline-icon"><Star size={17} /></div><div><h2>Moderação de avaliação</h2><p>Selecione uma avaliação real para analisar.</p></div></div>
          <div className="review-detail-empty"><div /><div /><div /></div>
          <label className="publish-toggle"><span><b>Aprovar para exibir no rodapé da landing page</b><small>Somente após aprovação manual.</small></span><input type="checkbox" aria-label="Exibir no footer" /><em /></label>
          <div className="footer-preview"><div><FileText size={16} /><b>Prévia do footer</b></div><p>Avaliações reais aprovadas aparecem aqui.</p><span /><span className="short" /></div>
          <div className="moderation-actions"><button className="approve" type="button">Aprovar</button><button className="outline-button" type="button">Ocultar</button><button className="remove" type="button">Remover do footer</button></div>
        </aside>
      </div>
    </section>
  );
}

function Marketing() {
  return (
    <section className="page-grid marketing-page">
      <div className="summary-row">
        <MoneyCard icon={<Megaphone size={20} />} title="Campanhas ativas" detail="configurações publicadas" />
        <MoneyCard icon={<Tags size={20} />} title="Promoção do dia" detail="agenda e destaque" />
        <MoneyCard icon={<Star size={20} />} title="Avaliações no footer" detail="somente aprovadas" />
        <MoneyCard icon={<MessageSquareHeart size={20} />} title="Conversas de suporte" detail="dados reais quando disponíveis" />
      </div>
      <div className="marketing-layout">
        <section className="table-card campaign-card">
          <div className="card-heading"><div><h2>Campanhas e destaques</h2><p>Organize promoções, conteúdo da landing page e chamadas de ação.</p></div><button className="approve" type="button">Criar campanha</button></div>
          <div className="campaign-block"><Megaphone size={20} /><div><b>Promoção do dia</b><small>Defina itens, vigência e posição na landing page.</small></div><button className="outline-button" type="button">Configurar</button></div>
          <div className="campaign-block"><MapPinned size={20} /><div><b>Área de entrega</b><small>Atualize mapa, raio e mensagem para fora da cobertura.</small></div><button className="outline-button" type="button">Editar</button></div>
          <div className="campaign-block"><Star size={20} /><div><b>Avaliações no footer</b><small>Use apenas avaliações reais aprovadas na área de Avaliações.</small></div><button className="outline-button" type="button">Revisar</button></div>
        </section>
        <aside className="landing-preview">
          <p>PRÉVIA DA LANDING PAGE</p><h2>Frango assado, pedido simples e entrega acompanhada.</h2><div className="preview-route"><span /><i /><span /></div><button type="button">Ver cardápio</button>
        </aside>
      </div>
    </section>
  );
}

function Operacoes() {
  return (
    <section className="page-grid operations-page">
      <div className="operations-summary"><div><h2>Central de operações</h2><p>Concentre aprovação, preparo, despacho e acompanhamento de entregas.</p></div><button className="approve" type="button">Atualizar operação</button></div>
      <div className="operations-layout">
        <section className="table-card workflow-card"><div className="card-heading"><div><h2>Fila de pedidos</h2><p>Os pedidos reais aparecerão aqui por etapa operacional.</p></div><ClipboardList size={20} /></div>
          {["Em análise", "Em preparo", "Prontos para despacho", "Em rota"].map((label) => <div className="operation-lane" key={label}><b>{label}</b><span>— pedidos</span><i /></div>)}
          <p className="empty-caption"><Package size={16} /> Sem pedidos ativos para exibir neste momento.</p>
        </section>
        <aside className="operations-map"><div className="map-header"><MapPinned size={17} /><div><h2>Mapa operacional</h2><p>Entregas ativas aparecem quando houver dados da integração.</p></div></div><div className="map-grid"><span className="origin-pin" /><span className="delivery-pin" /><i /></div><div className="map-legend"><span><b /> Origem</span><span><b /> Entrega ativa</span></div></aside>
      </div>
    </section>
  );
}

function PublicPrototype({ view, changeView }: { view: Extract<View, "quem-somos" | "landing-vazia" | "landing-avaliacoes">; changeView: (view: View) => void }) {
  const hasReviews = view === "landing-avaliacoes";
  return <div className="public-prototype">
    <header className="public-header"><img src="/manus-storage/prime-frango-logo-3d_7921a8ac.png" alt="Prime Frango Assado" /><nav><button onClick={() => changeView("landing-vazia")} type="button">Início</button><button type="button">Cardápio</button><button onClick={() => changeView("quem-somos")} type="button" className={view === "quem-somos" ? "current" : ""}>Quem Somos</button><button type="button">Acompanhar pedido</button></nav><div><button className="public-login" type="button">Entrar</button><button className="public-order" type="button">Pedir agora</button></div></header>
    {view === "quem-somos" ? <QuemSomos /> : <LandingReviews hasReviews={hasReviews} changeView={changeView} />}
  </div>;
}

function QuemSomos() {
  return <main className="about-page"><section className="about-hero"><div><p className="eyebrow">PRIME FRANGO ASSADO</p><h1>Da brasa ao seu pedido, com sabor e cuidado em cada etapa.</h1><p className="about-lead">Uma página institucional para apresentar a história, o preparo e a forma como a marca organiza o atendimento e as entregas.</p><button type="button">Conhecer o cardápio</button></div><div className="about-mark"><img src="/manus-storage/prime-frango-logo-3d_7921a8ac.png" alt="Logo Prime Frango Assado" /><span>ASSADO COM IDENTIDADE</span></div></section><section className="about-pillars"><article><b>01</b><h2>Preparo</h2><p>O conteúdo institucional explica o cuidado da operação sem substituir informações reais do estabelecimento.</p></article><article><b>02</b><h2>Pedido</h2><p>O cliente encontra cardápio, promoções, cupom e uma jornada de compra objetiva.</p></article><article><b>03</b><h2>Entrega</h2><p>O acompanhamento mostra etapas do pedido e disponibilidade da entrega quando configurada.</p></article></section></main>;
}

function LandingReviews({ hasReviews, changeView }: { hasReviews: boolean; changeView: (view: View) => void }) {
  return <main className="landing-prototype"><section className="landing-hero"><div><p className="eyebrow">PEDIDO, PREPARO E ENTREGA</p><h1>Frango assado com uma jornada de pedido clara.</h1><p>Cardápio, área de entrega, acompanhamento e suporte em uma experiência conectada.</p><button type="button">Ver cardápio</button></div><div className="hero-product"><img src="/manus-storage/prime-frango-logo-3d_7921a8ac.png" alt="Prime Frango Assado" /><i /><span>3D</span></div></section><section className="reviews-section"><div className="reviews-heading"><div><p className="eyebrow">AVALIAÇÕES</p><h2>O que aparece no rodapé da landing page</h2></div><div className="review-view-switch"><button onClick={() => changeView("landing-vazia")} className={!hasReviews ? "active" : ""} type="button">Sem avaliações</button><button onClick={() => changeView("landing-avaliacoes")} className={hasReviews ? "active" : ""} type="button">Com avaliações aprovadas</button></div></div>{hasReviews ? <div className="approved-reviews"><article><span>AVALIAÇÃO REAL APROVADA</span><div className="review-lines"><i /><i /><i /></div><small>Conteúdo de cliente real selecionado no painel administrativo.</small></article><article><span>AVALIAÇÃO REAL APROVADA</span><div className="review-lines"><i /><i className="short" /><i /></div><small>Exibida somente após pedido concluído e moderação.</small></article><article><span>AVALIAÇÃO REAL APROVADA</span><div className="review-lines"><i /><i /><i className="short" /></div><small>Gerenciada pelo proprietário na área de Avaliações.</small></article></div> : <div className="reviews-empty"><Star size={28} /><h3>Nenhuma avaliação aprovada ainda</h3><p>Quando houver avaliações reais moderadas no painel administrativo, elas aparecerão neste espaço do rodapé.</p></div>}</section><footer className="landing-footer"><img src="/manus-storage/prime-frango-logo-3d_7921a8ac.png" alt="Prime Frango Assado" /><span>Cardápio</span><span>Área de entrega</span><span>Falar no WhatsApp</span></footer></main>;
}

export default App;
