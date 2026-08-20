# Modelo 7 — Acesso de Cliente e Integrações

O Modelo 7 mantém a identidade visual aprovada do Modelo 6 e amplia o produto com três telas adicionais: acesso e cadastro de cliente, confirmação de e-mail e configuração detalhada de integrações no painel do proprietário.

## Elementos visuais preservados

As telas novas mantêm a composição aprovada: cabeçalho vinho escuro, logo circular grande, divisores dourados, cartões em marfim, ícones circulares vinho, ações em dourado e laranja, além do mapa em camadas suaves. A área de cliente continua com navegação clara de checkout; a área administrativa mantém a barra lateral vinho e o conteúdo claro, com tabelas e configurações de leitura rápida.

## Tela 1 — Acesso e cadastro

O cabeçalho da área de compra passa a ter dois acessos explícitos: **Entrar** e **Criar conta**. O login permite entrar com e-mail ou telefone e senha, além de oferecer recuperação de senha. A entrada no site principal e no checkout preserva o carrinho enquanto o cliente se autentica.

O fluxo de criação de conta começa solicitando somente o e-mail. O sistema envia uma confirmação e mantém a conta inativa enquanto essa etapa não for concluída. Após a confirmação do e-mail, o cliente acessa o formulário de cadastro completo.

| Dado solicitado após o e-mail confirmado | Finalidade no pedido |
|---|---|
| Nome completo | Identificar a conta e o pedido. |
| Telefone | Contato sobre pedido e entrega. |
| CPF | Cadastro e regras de pagamento, conforme a necessidade operacional e legal aplicável. |
| E-mail | Login, confirmação de conta e notificações. |
| Endereço completo e complemento | Cálculo de cobertura, entrega e histórico de endereços. |
| Senha e confirmação de senha | Acesso seguro à conta. |

## Tela 2 — Configuração de integrações

O painel administrativo passa a ter uma tela exclusiva chamada **Integrações e conexões**. Ela não exibe chaves, tokens ou senhas em texto aberto. Cada serviço possui um cartão separado, formulário mascarado, estado de conexão e ação de teste.

| Conexão | Dados administrativos previstos | Resultado esperado no sistema |
|---|---|---|
| Mapas e distância | Chave protegida, endereço de origem, serviços permitidos e teste. | Buscar endereço, calcular distância, validar raio e exibir mapas. |
| Pagamentos | Provedor, chaves protegidas, URL de retorno e webhook. | Criar pagamentos, receber confirmação e atualizar o pedido. |
| Logística | Credenciais protegidas, callbacks e regra de acionamento da entrega. | Solicitar entrega, receber status e exibir rastreamento quando suportado. |
| WhatsApp | URL de webhook, token de verificação e modelos de mensagem. | Notificar eventos e encaminhar suporte quando configurado. |
| E-mail | Remetente, domínio e estados de envio. | Confirmar conta e comunicar as etapas do pedido. |
| Assistente de IA | Chave protegida e base de conhecimento aprovada. | Responder dúvidas e encaminhar para WhatsApp quando necessário. |

> **Segurança:** os valores sensíveis serão mantidos apenas no ambiente protegido do servidor. O cliente nunca verá chaves de API, tokens, segredos de webhook ou credenciais administrativas.

## Tela 3 — Confirmação de e-mail

Depois de informar o e-mail, o cliente recebe uma mensagem de confirmação. A tela permite confirmar por código ou por link e reenviar o e-mail quando necessário. Somente depois dessa validação o formulário de cadastro completo é liberado.

```text
Informar e-mail → Receber confirmação → Confirmar código ou link
→ Completar dados cadastrais → Criar conta → Retornar ao checkout com o carrinho preservado
```

## Próxima etapa

As imagens do Modelo 7 servem para aprovar o visual e o fluxo. A implementação de cada integração dependerá de credenciais, contas autorizadas, chaves de serviço, permissões e funcionalidades disponibilizadas oficialmente por cada provedor.
