# Validação de integrações

## Stripe hospedado

Em 21 de agosto de 2026, o contrato público `payments.hostedStripeLink` retornou com HTTP 200 a URL HTTPS hospedada configurada para Stripe. A validação consultou somente o contrato do checkout e não abriu a página Stripe nem iniciou cobrança, pagamento ou criação de pedido.

O checkout usa essa URL apenas quando o cliente autenticado seleciona Stripe e possui itens no carrinho. Links sem HTTPS, ausentes ou inválidos são recusados pelo helper `hostedCheckoutDestination`.

No navegador, o cardápio público exibiu o combo ativo de R$ 40,00 e a ação de adicioná-lo ao carrinho. A continuidade do teste usa esse item sem criar um pedido ou concluir pagamento.

O combo foi adicionado com sucesso ao carrinho e o checkout exibiu o subtotal de R$ 40,00. A opção **Stripe pronto** apareceu habilitada, enquanto Mercado Pago e PagBank foram corretamente exibidos como aguardando conexão. Como a sessão de navegador não está autenticada no checkout, a ação final solicita entrada antes de qualquer redirecionamento para Stripe; não foi iniciado pagamento.

## Evolution Go

A rota de leitura confirmada para a instância pública é `/manager/instance/fetchInstances`. A chave global foi validada por consulta de leitura e persistida apenas em formato cifrado. O receptor de eventos da plataforma é `/api/webhooks/evolution`; ele requer a chave no cabeçalho `apikey` e registra somente o tipo do evento.
