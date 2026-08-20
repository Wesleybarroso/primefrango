# Modelo 6 — Rota em Movimento

## Conceito

O **Modelo 6 — Rota em Movimento** combina a clareza geográfica de **Rota do Sabor** com a energia comercial de **Fogo em Movimento**. A experiência não reúne todas as funções em uma só página. Em vez disso, cada tela possui uma tarefa clara: descobrir a marca, escolher o cardápio, finalizar a compra, acompanhar a entrega ou administrar a operação.

> **Direção visual:** vinho profundo, laranja-brasa, dourado, creme e preto tostado. Mapas são claros e topográficos; as áreas de campanha têm contraste alto e energia de fogo controlada.

## Mapa de páginas públicas

| Página ou área | Objetivo | Sessões e funções principais |
|---|---|---|
| **Landing page** | Converter visitantes de anúncios em pedidos. | Hero com frango em 3D, CTA para cardápio, promoção do dia, diferenciais, mapa visual da loja e área de entrega, processo de pedido, avaliações reais aprovadas quando existirem, FAQ e chat de IA com acesso opcional ao WhatsApp. |
| **Cardápio** | Apresentar produtos e permitir montar o pedido. | Categorias de frango, bebidas, acompanhamentos e promoções; fotos, descrição, preço e botão para adicionar ao carrinho. Conteúdo editável pelo painel. |
| **Carrinho e checkout** | Confirmar itens e viabilidade da entrega. | Carrinho persistente, edição de quantidades, código de cupom, login/cadastro quando necessário, endereço, cálculo de distância, validação do raio configurado, estimativa de entrega e pagamento. |
| **Login, cadastro e recuperação de senha** | Vincular o pedido a uma conta de cliente. | Entrar, criar conta, solicitar redefinição de senha e retornar ao carrinho preservado. |
| **Minha conta e pedidos** | Central do cliente autenticado. | Dados do perfil, lista de pedidos, código identificador de cada pedido e estado vazio para clientes sem pedidos. |
| **Acompanhar pedido** | Mostrar a evolução de um pedido específico. | Linha de status, confirmação de pagamento, análise, aprovação, preparo, despacho, mapa de entrega quando disponível, confirmação de recebimento, botão de cancelamento antes do despacho e avaliação após a entrega. |
| **Chat de suporte** | Responder dúvidas antes do contato humano. | Assistente de IA com respostas sobre cardápio, cobertura, pedido e status, com passagem opcional para WhatsApp. |

## Fluxo de pedido

| Etapa | Cliente | Operação do estabelecimento |
|---|---|---|
| **1. Escolha** | Adiciona frango, bebidas e acompanhamentos ao carrinho. | Mantém cardápio e promoções atualizados. |
| **2. Endereço** | Informa endereço e visualiza a distância. | Define endereço de origem e raio de entrega no painel. |
| **3. Cobertura** | Se estiver fora do raio, não conclui o checkout e recebe CTA para WhatsApp. | Pode ajustar o raio a qualquer momento. |
| **4. Identificação** | Entra ou cria conta; o carrinho é preservado. | Consulta o cliente e o pedido no painel. |
| **5. Pagamento** | Aplica cupom, revisa valores e conclui pelo meio disponível. | Recebe confirmação de pagamento e dados do pedido. |
| **6. Análise** | Visualiza que o pedido está em análise. | Aprova ou recusa conforme a operação. |
| **7. Preparo** | Recebe atualização de que o pedido está em preparo. | Atualiza o status e prepara os itens. |
| **8. Entrega** | Recebe aviso de despacho e acompanha o percurso em mapa quando disponibilizado. | Solicita a entrega no momento adequado e acompanha o status operacional. |
| **9. Conclusão** | Confirma o recebimento e pode avaliar o atendimento. | Confirma a conclusão recebida da operação logística e modera avaliações reais. |

## Regras de status e cancelamento

```text
Carrinho → Aguardando pagamento → Pago / Em análise → Confirmado → Em preparo
→ Entregador solicitado → Despachado / A caminho → Entregue → Confirmado pelo cliente → Avaliado
```

O cancelamento pelo cliente será exibido somente antes do status **Despachado**. Se o cancelamento for permitido, o estabelecimento e o cliente serão informados, e a solicitação logística daquele pedido deverá ser cancelada conforme a capacidade oficial da integração utilizada.

## Painel administrativo do proprietário

| Módulo | Objetivo e ações |
|---|---|
| **Dashboard** | Pedidos do dia, receita, ticket médio, produtos mais pedidos, conversão, entregas ativas e comparação mensal. Todos os números vêm de pedidos e pagamentos reais, sem dados artificiais. |
| **Pedidos** | Consultar pedidos, filtrar por status, ver itens e endereço, aprovar, recusar, atualizar preparo, acionar entrega, registrar ocorrências e acompanhar pagamento. |
| **Mapa operacional** | Exibir os pedidos com entrega ativa e respectivos pontos de localização quando a integração disponibilizar dados em tempo real. |
| **Cardápio** | Criar, editar, ocultar, ordenar e categorizar produtos, preços, fotos, complementos e disponibilidade. |
| **Promoções** | Criar a promoção do dia, configurar validade e escolher quais itens aparecem em destaque. |
| **Cupons** | Criar códigos, percentual ou valor fixo, validade, limite de uso, regras de pedido mínimo e ativação. |
| **Avaliações reais** | Moderar avaliações enviadas após pedidos concluídos e escolher quais avaliações reais aprovadas podem aparecer na landing page. |
| **Clientes** | Consultar perfil, histórico de pedidos e suporte associado ao cliente. |
| **Financeiro** | Analisar vendas, pagamentos confirmados, descontos, taxa de entrega e visão mensal. |
| **Configurações de entrega** | Definir origem, raio de entrega, horários, regras de indisponibilidade e mensagem exibida para endereços fora da cobertura. |
| **Integrações** | Área restrita para conectar e testar serviços de pagamento, mapas, logística, WhatsApp, e-mail e assistente de IA. Credenciais ficam protegidas e nunca visíveis no site do cliente. |

## Integrações previstas

| Integração | Papel no projeto | Condição de implementação |
|---|---|---|
| **Pagamentos** | Criar pagamento, receber confirmação e registrar o status do pedido. | Depende de conta, credenciais, meios de pagamento habilitados e documentação oficial do provedor. |
| **Mapas e distância** | Autocompletar endereço, calcular distância, verificar raio e mostrar mapa de localização. | Depende de chave de serviço, faturamento e APIs habilitadas. |
| **Logística** | Solicitar entrega, receber estados disponíveis, estimar prazo, cancelar antes do despacho e localizar entrega quando suportado. | Depende do acesso e das funcionalidades liberadas pela plataforma logística para o estabelecimento. |
| **WhatsApp e e-mail** | Notificar estabelecimento e cliente sobre pagamento, aprovação, preparo, despacho, entrega e cancelamento. | Depende de provedor, número/e-mail configurado e templates aprovados quando necessários. |
| **Assistente de IA** | Tirar dúvidas e encaminhar ao WhatsApp quando apropriado. | Depende da base de conhecimento aprovada e de limites definidos pelo proprietário. |

## Efeitos de movimento

| Local | Parallax | Scroll | Animação 3D |
|---|---|---|---|
| **Hero da landing page** | Fogo, arcos e fundo em três profundidades discretas. | Título e CTA revelados em sequência curta. | Prato de frango e logotipo com profundidade e microinclinação no cursor. |
| **Cardápio** | Sombras e ingredientes de fundo em movimento mínimo. | Produtos entram por categoria ao alcançar a viewport. | Cards respondem com elevação curta no hover, sem prejudicar a compra em mobile. |
| **Mapa e cobertura** | Mapa, ruas e pinos em camadas leves. | Rota ou área de cobertura desenhada conforme a seção entra em cena. | Pinos e raio de entrega com relevo isométrico baixo. |
| **Acompanhamento** | Nenhum movimento decorativo excessivo. | Linha de status destaca a etapa atual. | Marcador de entrega com profundidade apenas quando houver dados reais. |
| **Painel administrativo** | Sem parallax para preservar leitura de dados. | Transições sutis de tabelas, mapas e gráficos. | Nenhum 3D funcionalmente desnecessário. |

## Acessibilidade e desempenho

Os efeitos visuais serão opcionais e respeitarão a preferência de redução de movimento do dispositivo. As informações essenciais — preço, status, endereço, cobertura, prazo e ações de compra — jamais dependerão de animação para serem entendidas. O painel administrativo será propositalmente mais sóbrio que a landing page, priorizando velocidade, leitura e operação.
