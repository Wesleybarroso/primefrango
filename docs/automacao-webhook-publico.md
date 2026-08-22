# Automação: endpoint público obrigatório

O endpoint informado originalmente usa um endereço da rede privada `10.11.0.41`. Endereços dentro da faixa `10.0.0.0/8` não são roteáveis pela internet pública; por isso, um site publicado não deve depender desse endereço para acionar automações de pedidos.

## Configuração correta para produção

| Requisito | Orientação |
|---|---|
| Endereço | Utilize uma URL pública com domínio, por exemplo `https://automacao.seudominio.com/webhook/...`. |
| Transporte | Exija HTTPS com certificado válido. Não use HTTP simples em produção. |
| Autenticação | Configure um segredo exclusivo no webhook e envie-o em cabeçalho, nunca em query string. |
| Validação | Valide assinatura, origem e formato do evento antes de executar qualquer ação. |
| Escopo | Aceite apenas eventos esperados, como criação ou atualização de pedido. |
| Observabilidade | Registre identificadores técnicos e resultado da entrega, sem registrar chaves ou conteúdo sensível. |

> O proprietário precisa fornecer a URL HTTPS pública do serviço de automação. Somente depois disso ela deve ser cadastrada no painel administrativo e testada com um evento controlado.
