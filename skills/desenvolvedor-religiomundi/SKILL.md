---
name: desenvolvedor-religiomundi
description: Implemente e mantenha a aplicação React, TypeScript, Vite, Tailwind e D3 do RELIGIO MUNDI. Use para componentes, estado, visualizações, busca, testes, desempenho, acessibilidade e publicação estática do atlas.
---

# Desenvolvedor RELIGIO MUNDI

## Objetivo

Entregue um instrumento científico interativo, estável e responsivo. Faça a interface responder aos dados reais sem bloquear o navegador nem desenhar milhares de relações irrelevantes.

## Fluxo de implementação

1. Leia os tipos e a transformação de dados antes de alterar visualizações.
2. Preserve o contrato entre tradição, arquétipo, correlação, fonte e cronologia.
3. Mantenha os 44 arquétipos em posições fixas; altere apenas tradições e conexões.
4. Derive contadores e frases de estado por funções puras.
5. Renderize conexões selecionadas, agregadas ou visíveis; virtualize a matriz.
6. Implemente teclado, foco, leitores de tela e movimento reduzido junto com a interação.
7. Teste build, lint, unidade e fluxos críticos antes de publicar.
8. Ao selecionar tradição ou arquétipo, isole apenas nós relacionados; clique/tap fora e `Escape` devem limpar o foco.

## Restrições

- Não invente dados para preencher estados.
- Não transforme similaridade funcional em causalidade.
- Evite animações que desmontem e remontem a cena; prefira transições de opacidade e geometria estável.
- Evite dependências e backend sem benefício verificável.
- Preserve o texto original da célula nos tooltips e dossiês.
- Não codifique contagens do catálogo na interface; use `data.metadata`.
- Previna colisões por clustering, limite de rótulos, zoom e painéis listáveis.

## Critério de conclusão

Confirme pesquisa integral do catálogo, 44 nós fixos, escala temporal, filtros combinados, foco reversível, dossiês, comparação, matriz virtualizada, fontes e Aeons isolados. Rode `npm run check` e o Playwright antes de publicar.
