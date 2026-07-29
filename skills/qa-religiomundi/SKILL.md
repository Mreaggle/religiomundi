---
name: qa-religiomundi
description: Audite qualidade, regressões e consistência do RELIGIO MUNDI. Use antes de publicar mudanças em React, SVG/D3, timeline, filtros, dossiês, dados normalizados, responsividade, acessibilidade, SEO ou documentação do atlas.
---

# Q.A. RELIGIO MUNDI

## Objetivo

Validar comportamento real, não apenas compilação. Converter cada bug confirmado em uma asserção
reproduzível e impedir que correções locais quebrem outras visualizações, épocas ou tamanhos de tela.

## Fluxo obrigatório

1. Registrar o estado inicial com `git status` e preservar arquivos do usuário.
2. Reproduzir o problema no Chromium antes de alterar o código quando a falha ainda for observável.
3. Identificar a causa no estado, nos dados ou na geometria; não mascarar sintomas apenas com CSS.
4. Adicionar teste unitário para regras puras e Playwright para interação, layout ou console.
5. Executar `npm run check` e `npm run test:e2e`.
6. Conferir desktop, celular em retrato e celular em paisagem.
7. Publicar somente com build, auditoria de dados e fluxo crítico aprovados.

## Invariantes do atlas

- Cada arquétipo ativo deve possuir representação de conexão na constelação; A01 não pode monopolizar
  a amostra.
- Cor identifica o arquétipo; padrão do traço identifica direto, parcial, impessoal ou incerto.
- Zoom deve ampliar progressivamente textos e alvos sem fazê-los crescer na mesma razão do mapa.
- Seleção deve isolar elementos uma vez; fechar, clicar fora ou pressionar `Escape` não pode reabrir
  dossiês.
- `Revelar padrões` não pode montar um dossiê concorrente.
- Em celular deitado, a timeline inicia recolhida e continua expansível e recolhível.
- Nenhuma visualização pode introduzir rolagem horizontal da página, flicker ou erro de console.
- A ÁRVORE renderiza todas as tradições visíveis. Faixas regionais organizam proximidade sem
  parentesco; aresta sólida exige vínculo histórico documentado e tracejada exige hipótese/debate
  com referência acadêmica externa. Todo endpoint deve existir no catálogo.
- CHARTS contém rankings de religiões, tradições, famílias ou arquétipos — nunca rankings de países.
  Métricas internas respondem ao recorte; demografia externa exibe instituição, ano de publicação,
  ano estimado e ressalva de agregação. “Sem filiação” nunca recebe status de religião.
- A camada política usa o último snapshot não posterior ao ano observado; nunca interpola
  fronteiras nem apresenta o mapa de uma época futura como se fosse contemporâneo ao recorte.
- Apenas o snapshot político solicitado e, em ociosidade, seus dois vizinhos podem ser baixados. A
  timeline não pode importar todos os arquivos cartográficos nem remontar a projeção a cada frame.
- Nomes territoriais preservam a fonte; `BORDERPRECISION` controla o tratamento visual. Fronteira,
  cultura e área de influência não podem ser apresentadas como soberania uniforme ou exclusiva.
- Selecionar um território isola a camada política e deve fechar uma única vez por X, teclado ou
  clique fora. Marcadores religiosos continuam semanticamente independentes dos polígonos.
- O catálogo deve conservar 471 tradições, 44 arquétipos, textos originais e datas-sentinela, salvo
  revisão documental explícita.

## Matriz mínima

Validar em 1440×1000, 393×851 e 844×390. Exercitar Constelação, Mapa, Árvore, Charts, Matriz, busca,
timeline, dossiês, Revelar Padrões e Aeons. Na ÁRVORE, comparar a contagem de nós ao recorte, navegar
verticalmente pelos oito ramos e inspecionar ambos os traços. Em CHARTS, verificar soma de 100%,
ordenação, rótulo não religioso e fonte Pew. Em mudanças de SEO, verificar título, descrição, canonical,
Open Graph, JSON-LD, `robots.txt`, `sitemap.xml` e URL de produção.

Para cartografia temporal, testar no mínimo o presente, Império Mongol em 1200, Babilônia em
1.500 a.C. e um ano anterior ao primeiro snapshot. Executar `npm run data:audit`, conferir a licença
em `public/data/polities/` e validar que os links investigativos de listas de impérios, países,
GeaCron, civilizações e história humana permanecem registrados no índice.

## Relatório

Informar cenários testados, contagens, skips justificados e evidências de produção. Nunca declarar
“sem regressões” quando apenas build ou teste unitário foi executado.
