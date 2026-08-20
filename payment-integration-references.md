# Referências para pagamentos

## Decisões de integração

O checkout deve apresentar ao cliente dois caminhos explícitos: **Stripe** e **Mercado Pago**. Cada opção cria a cobrança apenas no servidor, usando credenciais privadas protegidas; a interface do navegador nunca recebe as chaves secretas.

| Provedor | Fluxo recomendado | Confirmação de pagamento |
|---|---|---|
| Stripe | Criar uma Checkout Session no servidor e redirecionar o cliente à página hospedada ou incorporada do Stripe. | Processar o webhook assinado no servidor e atualizar o estado do pedido. |
| Mercado Pago | Criar uma preferência de Checkout Pro no servidor e redirecionar o cliente ao ambiente de pagamento. | Processar notificações de pagamento no servidor e atualizar o estado do pedido. |

As telas administrativas devem informar somente se a conexão está configurada, quando foi testada e uma forma mascarada do identificador. O valor completo de tokens, chaves privadas e segredos de webhook não deve ser apresentado após o salvamento.

## Referências oficiais

[1]: [Stripe — Build a payments page](https://docs.stripe.com/payments/checkout)
[2]: [Mercado Pago — Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/overview)
