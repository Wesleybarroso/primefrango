# Auditoria Final — Prime Frango Assado

## Navegação e fluxos

| Achado | Impacto | Correção planejada |
|---|---|---|
| Itens da sidebar sem destino | Dashboard, Pedidos, Mapa Operacional, Cardápio, Promoções, Cupons e Integrações não alteram a tela. | Definir uma rota ou estado de página para cada item e manter um fallback coerente. |
| Ações de conteúdo sem resposta | Botões como “Ver cardápio”, “Pedir agora”, “Configurar” e “Revisar” não direcionam o usuário. | Conectar CTAs às páginas correspondentes ou apresentar estado de funcionalidade futura. |
| Navegação pública incompleta | Cardápio e Acompanhar pedido não têm rota; o botão de menu mobile não existe. | Criar navegação pública por estado e menu mobile acessível. |
| Controles administrativos sem retorno | Período, perfil e recolhimento do menu não têm interação. | Tornar o recolhimento funcional e apresentar ações seguras nos demais controles. |

## Responsividade e acessibilidade

| Achado | Impacto | Correção planejada |
|---|---|---|
| `body` usa largura mínima de 1040 px | A interface transborda em celulares. | Remover largura mínima, criar breakpoints e transformar sidebar em painel móvel. |
| Tabelas rígidas | Informações administrativas ficam ilegíveis em telas pequenas. | Aplicar rolagem horizontal controlada e prioridades de conteúdo mobile. |
| Cabeçalho público fixo em desktop | Navegação comprime em telas pequenas. | Criar menu de alternância, foco visível e ações de conta/pedido no painel móvel. |
| Sem banner de privacidade | Usuário não controla preferências não essenciais. | Adicionar aviso com aceitar, recusar e persistência local de escolha. |

## SEO técnico

O projeto receberá títulos e descrições descritivos, URL canônica, Open Graph, `robots.txt`, `sitemap.xml` e JSON-LD `Restaurant` com campos inicialmente configuráveis. Títulos devem ser claros, concisos e distintos; dados estruturados devem descrever informações reais e visíveis.[1] [2]

As avaliações reais aprovadas continuarão visíveis no footer como conteúdo de cliente moderado, mas não serão usadas em marcação de avaliação do próprio estabelecimento. Essa decisão evita transformar avaliações do próprio negócio em uma tentativa indevida de resultado avançado.[3]

## Referências

[1]: [Google Search Central — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
[2]: [Google Search Central — Title Links](https://developers.google.com/search/docs/appearance/title-link)
[3]: [Google Search Central — LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
