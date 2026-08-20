# Escopo Completo — Prime Frango Assado

## 1. Visão do projeto

O projeto será uma plataforma de pedidos para a **Prime Frango Assado**, formada por três experiências conectadas: uma **landing page para anúncios e divulgação**, um **site de pedidos para clientes** e um **painel administrativo para a operação do estabelecimento**. A identidade visual aprovada será preservada em todas as telas: vinho profundo, dourado, marfim, detalhes de brasa e mapas claros com relevo discreto.

> A landing page é voltada à descoberta e conversão. O site de pedidos prioriza cardápio, checkout e acompanhamento. O painel administrativo privilegia leitura, controle e operação diária.

## 2. Landing page de divulgação

| Seção | Conteúdo e função |
|---|---|
| Hero principal | Logo 3D, apresentação do frango assado, CTA para pedir e efeito visual de profundidade no produto. |
| Cardápio em destaque | Produtos, bebidas, acompanhamentos e acesso ao cardápio completo. |
| Promoção do dia | Oferta configurada no painel administrativo, com período e itens selecionados pelo proprietário. |
| Área de entrega | Mapa visual da localização da loja, raio de entrega e CTA para verificar o endereço. |
| Como pedir | Resumo visual da jornada: escolher, pagar, preparo, entrega e acompanhamento. |
| Acompanhamento | Acesso para o cliente logado rastrear o próprio pedido. |
| Avaliações reais aprovadas | Área no footer da landing page que exibe somente avaliações reais, enviadas após pedidos concluídos e aprovadas manualmente no painel. |
| Atendimento | Chat de IA para dúvidas, com encaminhamento opcional ao WhatsApp. |

## 3. Experiência de pedidos do cliente

### Cardápio e carrinho

O cliente poderá visualizar itens por categoria, adicionar e remover produtos, ajustar quantidades e aplicar um cupom de desconto em formato de código. O carrinho será preservado quando ele precisar fazer login ou criar uma conta. Cardápio, produtos, disponibilidade, categorias, preços, promoções e cupons serão gerenciados no painel administrativo.

### Login, cadastro e segurança de conta

| Etapa | Regra |
|---|---|
| Acesso | Botões claros de **Entrar** e **Criar conta** no site e no checkout. |
| Login | E-mail ou telefone e senha, com recuperação de senha. |
| Confirmação de e-mail | A criação da conta começa pelo e-mail; o usuário confirma por link ou código antes de completar o cadastro. |
| Cadastro completo | Nome completo, telefone, e-mail, CPF, endereço, complemento, senha e confirmação de senha. |
| Minha conta | Perfil, endereços salvos, histórico, códigos de pedido e acesso ao acompanhamento. |
| Estado sem pedidos | Cliente sem pedidos visualiza uma tela vazia com CTA para ir ao cardápio. |

### Cobertura, mapa e checkout

O cliente informa seu endereço no checkout. O sistema calcula a distância da origem da loja, verifica o raio configurado pelo proprietário e apresenta a estimativa de entrega quando a integração logística disponibilizar esses dados. Se estiver fora da área de cobertura, o checkout não prossegue e o cliente recebe uma opção de contato por WhatsApp.

O checkout apresenta itens, cupom, identificação do cliente, endereço, cobertura, taxa quando aplicável e escolha de pagamento. O pagamento será conectado a um provedor aprovado, com retorno de confirmação para atualizar o pedido.

## 4. Fluxo de pedido e entrega

| Estado | Visão do cliente | Ação do estabelecimento |
|---|---|---|
| Aguardando pagamento | Pedido criado, aguardando confirmação. | Aguardar retorno do provedor de pagamento. |
| Pago em análise | Confirmação de pagamento e aviso de análise. | Avaliar pedido, itens e endereço. |
| Confirmado | Pedido confirmado. | Aceitar e iniciar o preparo. |
| Em preparo | Pedido sendo preparado. | Produzir os itens do pedido. |
| Entregador solicitado | Entrega sendo organizada. | Acionar a entrega no momento adequado. |
| Despachado / a caminho | Cliente recebe aviso e acompanha o percurso quando houver dados disponíveis. | Atualizar status e acompanhar a entrega. |
| Entregue | Pedido chegou ao destino. | Registrar retorno da operação logística quando disponível. |
| Concluído | Cliente confirma recebimento e pode avaliar o atendimento. | Encerrar operação e moderar avaliação real. |

Cada pedido terá um **código único** para identificação. O cliente logado poderá voltar posteriormente à área de acompanhamento e reencontrar seus pedidos pelo histórico.

### Cancelamento

O cliente poderá solicitar cancelamento apenas antes do estado **Despachado**. Quando permitido, o cliente e o estabelecimento receberão uma notificação. A solicitação de entrega vinculada àquele pedido deverá ser cancelada somente se a integração logística disponibilizar essa operação e o pedido ainda estiver em uma etapa compatível.

## 5. Notificações e atendimento

| Evento | Cliente | Estabelecimento |
|---|---|---|
| Confirmação de pagamento | Tela de acompanhamento e e-mail, quando configurado. | Painel e notificação configurada, incluindo WhatsApp quando habilitado. |
| Pedido confirmado ou em preparo | Tela de acompanhamento e e-mail, quando configurado. | Painel de pedidos. |
| Pedido despachado | Tela de acompanhamento e notificação configurada. | Painel e mapa operacional. |
| Entrega concluída | Confirmação e liberação de avaliação. | Atualização no painel. |
| Cancelamento permitido | Notificação de cancelamento. | Notificação e atualização operacional. |

O chat de IA responderá dúvidas sobre cardápio, área de entrega, pedido, prazo, cancelamento e suporte. Quando necessário, o cliente poderá ser encaminhado para conversar no WhatsApp.

## 6. Painel administrativo

| Módulo | O que o proprietário controla |
|---|---|
| Dashboard | Pedidos do dia, receita, ticket médio, entregas ativas, gráficos e visão resumida. Os dados serão reais quando existirem. |
| Pedidos | Consulta, filtros, itens, endereço, pagamento, aprovação, preparo, acionamento de entrega, despacho e cancelamento. |
| Mapa operacional | Pontos de entregas em andamento e status, condicionado aos dados oficialmente disponibilizados pela integração logística. |
| Cardápio | Produtos, fotos, categorias, preços, complementos, disponibilidade e ordem de exibição. |
| Promoções | Oferta do dia, vigência e itens destacados. |
| Cupons | Código, desconto, validade, limites e regras de uso. |
| Avaliações | Fila de avaliações reais, moderação, aprovação, ocultação e controle **Exibir no footer** da landing page. |
| Clientes | Dados de cadastro, contatos, endereços e histórico de pedidos, com visualização restrita ao proprietário autorizado. |
| Financeiro | Receita, descontos, custos de entrega, saldo, movimentações e análise mensal com dados reais. |
| Integrações | Configuração protegida de mapas, pagamentos, logística, WhatsApp, e-mail e IA. |
| Configurações de entrega | Origem, raio de entrega, horários, mensagem para fora da cobertura e regras de operação. |

## 7. Avaliações reais no footer

As avaliações são liberadas somente após um pedido concluído e confirmado. No painel, o proprietário poderá analisar cada avaliação real e selecionar a ação **Aprovar para exibir no rodapé da landing page**. A prévia do footer mostrará apenas um espaço de layout enquanto não houver avaliações aprovadas. O projeto não utilizará avaliações, estrelas, depoimentos ou nomes fictícios.

## 8. Integrações previstas

| Serviço | Uso pretendido | Configuração protegida |
|---|---|---|
| Mapas e distância | Endereço, distância, área de cobertura, mapa da loja e rota. | Chave de serviço, origem e teste de conexão. |
| Pagamentos | Criar pagamento, receber confirmação e atualizar status. | Chaves, token protegido, URL de retorno e webhook. |
| Logística | Solicitar entrega, estimar prazo, acompanhar status e cancelar quando suportado. | Credenciais, callback e regras de acionamento. |
| WhatsApp | Notificar eventos e permitir contato humano. | Webhook, token de verificação e modelos autorizados. |
| E-mail | Confirmação de conta e atualizações do pedido. | Remetente e configuração de envio. |
| Assistente de IA | Atendimento prévio e encaminhamento ao WhatsApp. | Chave protegida e base de conhecimento aprovada. |

As credenciais permanecerão em ambiente seguro de servidor e não serão exibidas ao cliente. A implementação efetiva de cada integração depende de contas autorizadas, chaves, permissões e funcionalidades oficialmente disponibilizadas por cada provedor.

## 9. Movimento, parallax e 3D

| Área | Efeito planejado | Limite de uso |
|---|---|---|
| Hero da landing page | Parallax de brasa, arcos em profundidade e prato de frango em 3D. | Movimento discreto, sem comprometer CTA ou leitura. |
| Cardápio | Entrada de categorias durante a rolagem e elevação leve de cards. | Nenhuma informação de compra depende do efeito. |
| Mapa | Pinos em relevo baixo e desenho progressivo de rota ou cobertura. | Status textual permanece prioritário. |
| Acompanhamento | Destaque da etapa atual e marcador de entrega quando houver dados. | Sem movimentos intensos. |
| Administrativo | Microtransições curtas em painéis, tabelas e filtros. | Sem parallax decorativo. |

O site respeitará a preferência de redução de movimento do dispositivo. Preços, status, mapa, cobertura, prazo e ações de compra continuarão acessíveis sem animações.

## 10. Catálogo de telas visuais

| Grupo | Tela |
|---|---|
| Landing e pedido | Landing page, cardápio/carrinho, checkout/cobertura/pagamento, acesso/cadastro, confirmação de e-mail, minha conta, acompanhamento e chat de suporte. |
| Administrativo | Dashboard, pedidos e mapa operacional, cardápio/promoções/cupons, integrações, financeiro, clientes e avaliações/footer. |

As imagens anexadas representam a direção visual e a organização funcional. O desenvolvimento posterior transformará os protótipos em telas funcionais e conectará os dados reais, autenticação, pagamentos, mapas, notificações e integrações autorizadas.

## 11. Páginas complementares adicionadas

| Página | Acesso | O que o usuário vê e faz |
|---|---|---|
| Quem Somos | Cliente e visitante | História e proposta da marca, apresentação do preparo, jornada de pedido e entrega, com CTA para o cardápio. |
| Marketing | Proprietário autorizado | Configura campanhas, promoção do dia, conteúdo de área de entrega e revisa as avaliações aprovadas para o footer. |
| Operações | Proprietário autorizado | Centraliza pedidos por etapa — análise, preparo, prontos para despacho e em rota — e exibe o mapa operacional quando houver dados reais. |
| Landing sem avaliações | Visitante | Mostra um estado claro quando nenhuma avaliação real foi aprovada para publicação. |
| Landing com avaliações aprovadas | Visitante | Mostra cartões de layout para avaliações reais já aprovadas, sem criar depoimentos ou notas fictícias. |

O bloco de avaliações da landing page é controlado no painel em **Avaliações** e também pode ser acessado pelo módulo de **Marketing**. O proprietário seleciona uma avaliação real, aprova a publicação e ativa o controle **Exibir no footer**. Ocultar ou remover do footer interrompe a publicação, preservando o registro administrativo quando aplicável.
