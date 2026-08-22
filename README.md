# Prime Frango Assado

> Plataforma de pedidos online para a **Prime Frango Assado**, com vitrine pública responsiva, cardápio administrável, carrinho, checkout, autenticação e operação administrativa.

O projeto apresenta uma experiência editorial em vinho, dourado e marfim para a venda de frango assado, combos e acompanhamentos. A aplicação é composta por uma landing page pública, área de cliente, cardápio persistente, checkout com Stripe hospedado e um painel administrativo com gestão de produtos, promoções, cupons, integrações e comunicação.

## Visão geral

| Área | Recursos entregues |
|---|---|
| **Site público** | Landing page, Quem Somos, cardápio, promoções ativas, carrinho, acompanhamento e preferências de cookies. |
| **Cliente** | Login seguro via OAuth, carrinho preservado após autenticação e acesso à área de pedidos. |
| **Checkout** | Seleção de provedor e redirecionamento para o link de pagamento Stripe hospedado, quando configurado. |
| **Administração** | Dashboard, pedidos, mapa operacional, cardápio, promoções, cupons, avaliações, clientes, financeiro, integrações, marketing e operações. |
| **Integrações** | Stripe, Mercado Pago, PagBank, Google Maps, Resend, SMTP, GA4, GTM e Search Console, com armazenamento protegido de credenciais quando aplicável. |

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, Wouter e TanStack Query. |
| Backend | Node.js, Express 4, tRPC 11 e Zod. |
| Dados | Drizzle ORM com MySQL/TiDB gerenciado. |
| Autenticação | OAuth integrado ao ambiente de publicação. |
| Testes | Vitest. |
| Estilo | Design responsivo, acessível e com suporte a redução de movimento. |

## Estrutura do repositório

```text
primefrango/
├── client/
│   ├── public/              # SEO técnico: robots, sitemap e configurações públicas
│   └── src/                 # Interface pública, checkout e painel administrativo
├── drizzle/
│   ├── migrations/          # Histórico de migrações do banco
│   └── schema.ts            # Modelo de dados Drizzle
├── server/
│   ├── _core/               # Infraestrutura de autenticação, servidor e runtime
│   ├── db.ts                # Acesso a dados
│   ├── routers.ts           # Contratos tRPC
│   ├── credentials.ts       # Cifragem e mascaramento de credenciais
│   └── emailDelivery.ts     # Entregas transacionais por Resend ou SMTP
├── docs/                    # Documentação de validação de integrações
├── scripts/                 # Utilitários de verificação local
└── package.json             # Scripts e dependências
```

## Requisitos

Use **Node.js 22+** e **pnpm 10+**. Para executar recursos que dependem de autenticação, banco de dados, armazenamento ou publicação, também é necessário configurar as variáveis de ambiente fornecidas pela plataforma de hospedagem.

```bash
node --version
pnpm --version
```

## Instalação e execução

Clone o repositório privado e instale as dependências.

```bash
git clone https://github.com/SEU-USUARIO/primefrango.git
cd primefrango
pnpm install
```

Em seguida, utilize os comandos abaixo.

| Comando | Finalidade |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento com recarregamento. |
| `pnpm test` | Executa a suíte de testes automatizados. |
| `pnpm check` | Executa a verificação de tipos TypeScript. |
| `pnpm build` | Gera o bundle de cliente, SSR e servidor para produção. |
| `pnpm start` | Inicia o bundle de produção gerado em `dist/`. |
| `pnpm db:push` | Gera e aplica migrações Drizzle no banco configurado. |

Recomenda-se sempre validar uma alteração importante com:

```bash
pnpm test && pnpm check && pnpm build
```

## Configuração de ambiente

O projeto **não inclui chaves, tokens, senhas ou arquivos `.env`**. Configure os valores somente no gerenciador de segredos da plataforma de hospedagem.

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão MySQL/TiDB usada pelo Drizzle ORM. |
| `JWT_SECRET` | Assinatura de sessão e cifragem de dados protegidos. |
| `OAUTH_SERVER_URL` | Serviço OAuth da aplicação. |
| `VITE_APP_ID` | Identificador público do aplicativo OAuth. |
| `VITE_OAUTH_PORTAL_URL` | Portal de autenticação usado pelo cliente. |
| `BUILT_IN_FORGE_API_URL` e `BUILT_IN_FORGE_API_KEY` | Serviços internos seguros, incluindo armazenamento. |

> **Segurança:** nunca envie ao GitHub valores de Stripe, Mercado Pago, PagBank, SMTP, Resend, Google Maps, WhatsApp ou provedores de IA. As configurações administrativas cifram segredos no servidor e exibem apenas um valor mascarado depois do salvamento.

## Pagamentos

O checkout reconhece Stripe, Mercado Pago e PagBank. O Stripe pode operar com um **link hospedado de pagamento**, configurado em **Administração → Integrações → Stripe**. Quando o cliente autenticado seleciona Stripe e confirma o checkout, o site redireciona somente para um endereço HTTPS válido previamente configurado.

Para produção completa, conecte o retorno do pagamento a uma tabela de pedidos e a webhooks autenticados do provedor. Nunca considere um pedido como pago exclusivamente com base no retorno do navegador.

## Integrações administrativas

| Integração | Configuração no painel | Observação |
|---|---|---|
| Stripe | Chave privada e link de pagamento hospedado | O link é validado como HTTPS antes do redirecionamento. |
| Mercado Pago e PagBank | Credenciais do provedor | A ativação de cobrança depende do fluxo de API e webhook correspondente. |
| Resend / SMTP | Credencial, remetente e preferências | Permite avisos de login e comunicações transacionais configuradas. |
| Google Analytics 4 / GTM | Identificadores públicos | Carregados somente após consentimento de cookies de medição. |
| Search Console | Propriedade e token de verificação | Inclui meta tag de verificação no site. |
| WhatsApp / Evolution Go | Chave e URL pública, quando necessário | Mantenha a chave fora do repositório e use apenas URLs HTTPS públicas. |

## Banco de dados e migrações

O modelo está em [`drizzle/schema.ts`](./drizzle/schema.ts). Antes de aplicar mudanças estruturais, revise o SQL gerado e faça backup dos dados operacionais. As tabelas principais contemplam usuários, integrações, métricas Google, categorias, itens de cardápio, promoções, cupons e configurações de e-mail.

```bash
pnpm db:push
```

## Qualidade e segurança

A base contém testes para carrinho, checkout Stripe hospedado, navegação administrativa, validação de formulário, promoções, cupons, navegação e proteção de credenciais. O projeto também inclui estados de carregamento, erro e nova tentativa para operações administrativas importantes.

Antes de publicar uma alteração, valide desktop e celular, especialmente os fluxos de login, cardápio, carrinho, checkout e o botão **Sair da conta** do painel administrativo.

## Publicação

O projeto pode ser publicado no ambiente gerenciado já configurado ou adaptado para outro provedor Node.js. Em qualquer hospedagem, configure as variáveis de ambiente, a conexão com o banco, URLs de callback OAuth e domínios permitidos antes de disponibilizar a aplicação ao público.

## Licença

Este projeto está identificado como **MIT** no `package.json`. Antes de distribuir comercialmente código, imagens ou identidade visual, valide os direitos de uso de cada ativo com o proprietário da marca.
