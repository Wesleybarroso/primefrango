# Prime Frango Assado

Aplicação de pedidos, acompanhamento de entregas e operação administrativa para a Prime Frango Assado. O projeto reúne landing page, cardápio, checkout, área de cliente, painel administrativo, integrações e uma base técnica de SEO e responsividade.

## Estrutura do projeto

| Área | Localização | Responsabilidade |
|---|---|---|
| Interface pública e administrativa | `client/src/App.tsx` | Rotas, landing page, cardápio, checkout, acompanhamento e painel. |
| Navegação e cookies | `client/src/navigation.ts` e `client/src/cookiePreferences.ts` | Rotas públicas, módulos administrativos e consentimento persistente. |
| Integrações | `server/routers.ts`, `server/credentials.ts` e `server/db.ts` | Configuração protegida de credenciais e status mascarado. |
| Banco de dados | `drizzle/schema.ts` e `drizzle/migrations/` | Usuários e configurações de integrações. |
| SEO | `client/src/seo.ts`, `client/public/robots.txt` e `client/public/sitemap.xml` | Metadados, indexação e páginas públicas. |

## Execução local

Instale as dependências com `pnpm install`. Em seguida, use `pnpm dev` para desenvolvimento, `pnpm test` para testes, `pnpm run check` para validação de tipos e `pnpm run build` para validar o bundle de produção.

## Pagamentos e integrações

A área administrativa **Integrações** permite cadastrar credenciais de Stripe, Mercado Pago, Google Maps, WhatsApp, e-mail e IA. Cada chave é cifrada no servidor com a chave de sessão do projeto e, após o salvamento, a interface exibe apenas uma forma mascarada. As credenciais completas não devem ser incluídas em commits, arquivos `.env` compartilhados ou código do cliente.

Consulte [INTEGRACOES_PAGAMENTO.md](./INTEGRACOES_PAGAMENTO.md) antes de ativar Stripe ou Mercado Pago. O fluxo de cobrança real deve ser conectado a produtos, preços, pedidos e webhooks validados no servidor antes da publicação.

## Banco de dados

O projeto usa o banco gerenciado do template, compatível com MySQL/TiDB, por meio de Drizzle ORM. Caso a infraestrutura de produção exija PostgreSQL, será necessário migrar a camada de schema, driver e conexão antes de ativar transações de pedidos e pagamentos.

## Publicação no GitHub

Crie um repositório privado e envie os arquivos do projeto, excluindo `node_modules`, `dist` e quaisquer arquivos `.env`. O pacote entregue inclui o código-fonte, migrações, documentação, testes e configuração de build.
