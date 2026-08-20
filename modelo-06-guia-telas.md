# Modelo 6 — Guia de Telas e Funções

## Organização por jornada

O Modelo 6 separa claramente três experiências: a **landing page de anúncio**, o **site de pedidos do cliente** e o **painel administrativo do proprietário**. A intenção é evitar uma tela sobrecarregada: cada interface resolve uma etapa específica do negócio.

## Índice visual dos protótipos

| Arquivo | Tela apresentada |
|---|---|
| `modelo-06-01-landing-page.png` | Landing page para anúncios e descoberta da marca. |
| `modelo-06-02-cardapio-carrinho.png` | Cardápio, promoções e carrinho editável. |
| `modelo-06-03-checkout-cobertura-pagamento.png` | Checkout com cobertura, conta e pagamento. |
| `modelo-06-04-conta-pedidos.png` | Conta do cliente, histórico e estado vazio. |
| `modelo-06-05-acompanhamento-pedido.png` | Acompanhamento, entrega e confirmação. |
| `modelo-06-06-admin-dashboard.png` | Dashboard do proprietário. |
| `modelo-06-07-admin-pedidos-mapa.png` | Gestão de pedidos e mapa operacional. |
| `modelo-06-08-admin-cardapio-promocoes.png` | Gestão de cardápio, promoções e cupons. |
| `modelo-06-09-admin-financeiro-integracoes.png` | Financeiro, raio de entrega e integrações. |
| `modelo-06-10-chat-suporte.png` | Chat de IA e encaminhamento para suporte humano. |

| Protótipo | Página | Papel na jornada | Funções exibidas ou vinculadas |
|---|---|---|---|
| **01** | Landing page | Converter uma visita em interesse e pedido. | Hero 3D do frango, CTA de cardápio, promoção do dia, mapa visual da loja, raio de cobertura, acompanhamento, chat de IA e atalho para WhatsApp. |
| **02** | Cardápio e carrinho | Permitir a escolha e a edição de itens. | Categorias, produtos, bebidas, acompanhamentos, promoções, inclusão/remoção de itens, quantidade e cupom. |
| **03** | Checkout | Validar a compra antes do pagamento. | Carrinho preservado, login/cadastro, recuperação de senha vinculada à área de autenticação, endereço, distância, raio de entrega, cobertura, cupom e pagamento. |
| **04** | Minha conta e pedidos | Dar continuidade ao relacionamento após o pedido. | Perfil, endereços, código de pedido, histórico, acesso ao acompanhamento e estado vazio sem pedidos. |
| **05** | Acompanhar pedido | Comunicar o status até a entrega. | Confirmação de pagamento, análise, aprovação, preparo, despacho, entrega em mapa quando suportada, cancelamento antes do despacho, confirmação de recebimento e avaliação posterior. |
| **06** | Dashboard administrativo | Mostrar a visão estratégica do negócio. | Pedidos do dia, receita, ticket médio, entregas ativas, gráficos, mapa resumido e filtros de período. |
| **07** | Pedidos e mapa operacional | Controlar a operação diária. | Lista de pedidos, detalhes de itens e endereço, aprovação, preparo, acionamento de entrega, despacho, cancelamento permitido e mapa de entregas ativas quando suportado. |
| **08** | Cardápio, promoções e cupons | Gerenciar a oferta comercial. | Produtos, categorias, disponibilidade, promoção do dia, cupom em código, regras de validade e acesso à moderação de avaliações reais. |
| **09** | Financeiro e integrações | Configurar a operação e ler resultados. | Visão financeira mensal, raio de entrega, horário, mensagem fora da cobertura e conexões protegidas para pagamento, mapas, logística, WhatsApp, e-mail e IA. |
| **10** | Chat e suporte | Resolver dúvidas antes do atendimento humano. | Perguntas sobre cardápio, cobertura, pedido, cancelamento e acesso opcional ao WhatsApp. |

## Fluxo de status do pedido

| Código de estado | Exibição ao cliente | Ação administrativa |
|---|---|---|
| `aguardando_pagamento` | Aguardando pagamento | Aguardar retorno do provedor. |
| `pago_em_analise` | Pagamento confirmado; pedido em análise | Aprovar ou recusar. |
| `confirmado` | Pedido confirmado | Iniciar preparo. |
| `em_preparo` | Pedido em preparo | Atualizar a produção. |
| `entregador_solicitado` | Entrega sendo organizada | Solicitar entrega quando o pedido estiver pronto. |
| `despachado` | Pedido a caminho | Acompanhar a entrega e desabilitar cancelamento do cliente. |
| `entregue` | Entrega realizada | Aguardar confirmação do cliente, se necessária. |
| `concluido` | Pedido concluído | Liberar avaliação do atendimento. |
| `cancelado` | Pedido cancelado | Notificar cliente e operação; cancelar a solicitação logística associada quando permitido. |

## Regras que serão preservadas no desenvolvimento

O carrinho permanece salvo ao entrar ou criar uma conta. O checkout só avança quando o endereço estiver dentro do raio definido pelo proprietário. Fora da área de cobertura, o cliente recebe uma orientação de contato por WhatsApp em vez de um pagamento indisponível. O cliente pode cancelar o pedido somente antes do despacho. Avaliações são solicitadas apenas após a conclusão e, se publicadas, serão avaliações reais moderadas no painel; não haverá avaliações fictícias.

As notificações poderão ser organizadas por evento para cliente e estabelecimento: pagamento confirmado, pedido em análise, confirmação, preparo, despacho, entrega, cancelamento e avaliação. A implementação efetiva de pagamento, mapas, localização e logística dependerá do acesso às contas, credenciais, permissões e funcionalidades oficialmente liberadas por cada provedor.

## Aplicação de efeitos sem prejudicar a operação

| Contexto | Movimento permitido | Regra de segurança |
|---|---|---|
| Landing e cardápio | Parallax leve, entrada por rolagem e profundidade 3D no produto. | Desligar ou reduzir com a preferência de redução de movimento. |
| Checkout e login | Somente transições curtas de etapa. | Preço, cobertura e botões sempre visíveis sem animação. |
| Acompanhamento | Realce da etapa atual e mapa com marcador de entrega. | O status textual continua sendo a fonte principal de informação. |
| Painel administrativo | Microtransições em tabelas, gráficos e painéis. | Sem parallax decorativo e sem 3D que prejudique a leitura de dados. |
