# Configuração de pagamentos e integrações

## Segurança das chaves

As credenciais são inseridas no painel administrativo em **Integrações**. Elas trafegam para o servidor, são cifradas antes de persistir e passam a ser exibidas apenas de forma mascarada. A operação exige uma conta administrativa autenticada; clientes não possuem acesso a essa área.

| Provedor | Dado principal | Dado adicional | Uso previsto |
|---|---|---|---|
| Stripe | Chave privada | URL e segredo de webhook | Criar Checkout Sessions e confirmar pagamentos por evento assinado. |
| Mercado Pago | Access Token | URL e segredo de webhook | Criar preferências de Checkout Pro e receber notificações de pagamento. |
| Google Maps | Chave da API | — | Endereço, cobertura, raio e rota de entrega. |
| WhatsApp | Token do webhook | URL e segredo de verificação | Avisos de pedido e atendimento humano. |
| E-mail | Chave do provedor | — | Confirmação de conta e atualizações do pedido. |

## Ativação de pagamentos

O cliente escolhe **Stripe** ou **Mercado Pago** no checkout. O backend deve criar a cobrança usando valores e itens validados pelo catálogo do servidor, nunca pelo preço recebido diretamente do navegador. Depois de criar a cobrança, o cliente é encaminhado ao ambiente seguro do provedor. A confirmação definitiva do pagamento ocorre somente após o webhook assinado atualizar o pedido.

> Até que produtos, preços, pedidos e credenciais reais estejam cadastrados, o checkout mantém estado de preparação e não deve tentar cobrar um cliente.

## Webhooks

Registre uma URL HTTPS pública para cada provedor. O endpoint deve validar a assinatura recebida, consultar o evento no provedor quando necessário e atualizar o status do pedido de forma idempotente. Nunca use a URL de retorno do navegador como única prova de pagamento.

## Referências

[1]: [Stripe Checkout](https://docs.stripe.com/payments/checkout)
[2]: [Mercado Pago Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/overview)
