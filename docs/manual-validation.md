# Registro de validação manual

## Painel administrativo autenticado

Em 22 de agosto de 2026, a sessão autenticada do proprietário abriu o painel em `/admin/dashboard` e exibiu os doze itens de navegação, incluindo o botão **Sair da conta**. A lateral não apresentou barra de rolagem visual após o ajuste de transbordamento.

Também foi validada a navegação de **Dashboard** para **Pedidos**. A rota foi atualizada para `/admin/pedidos` e exibiu a Central de pedidos com a ação operacional correspondente.

## Próxima validação

Com a mesma sessão autenticada, o cardápio público exibiu o **Combo de hoje** ativo por R$ 40,00, com três imagens, botão de adição ao carrinho e ação de ir ao checkout. O carrinho continha uma unidade do combo, com subtotal de R$ 40,00. Ainda é necessário validar o redirecionamento ao link Stripe hospedado sem concluir uma cobrança.

## Checkout Stripe hospedado

O checkout autenticado mostrou o Stripe como provedor pronto. Após selecionar Stripe e acionar a continuidade, a aplicação abriu o link Stripe hospedado configurado para o **Combo Frango por R$ 40,00**. Nenhum campo de pagamento foi alterado e nenhuma cobrança foi enviada durante a validação.
