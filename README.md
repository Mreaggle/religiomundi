# RELIGIO MUNDI

Atlas temporal interativo de 460 religiões, cosmovisões e tradições, correlacionadas a 44 funções comparativas. A experiência combina uma constelação arquetípica fixa, cartografia regional, escala temporal híbrida, matriz virtualizada, dossiês e comparação lado a lado.

> Os nomes mudam. As funções reaparecem. As diferenças continuam importando.

## Fonte de dados

`public/data/UNO_reformulado.xlsx` é a fonte canônica. `npm run data:build` lê todas as oito abas e gera `public/data/atlas.generated.json`, preservando o texto integral de 20.240 células. O CSV estruturado para agentes está em `data/UNO_reformulado.csv`.

Coordenadas são aproximações regionais de interface, nunca localizações arqueológicas precisas. Datas ambíguas permanecem marcadas como aproximadas, por século, macroperíodo ou desconhecidas.

## Desenvolvimento

Requer Node.js 20.19 ou superior.

```bash
npm install
npm run dev
```

Comandos principais:

- `npm run data:build` — normaliza e valida a planilha.
- `npm run build` — gera os dados, verifica TypeScript e compila a aplicação.
- `npm test` — executa 19 testes unitários e de integridade.
- `npm run test:e2e` — valida desktop e celular no Chromium.
- `npm run lint` — verifica código, acessibilidade estática e formatação.
- `npm run check` — executa lint, testes e build.

## Princípio metodológico

“Arquétipo” é uma ferramenta de indexação comparativa. Uma função recorrente não prova que entidades sejam idênticas, que tradições tenham origem comum ou que tenha ocorrido transmissão histórica. A camada `Aeons — autoral` permanece separada dos cálculos historiográficos.

## Estrutura

- `src/components/` — instrumentos visuais, dossiês e modos de exploração.
- `src/state/` e `src/utils/` — estado previsível, filtros, tempo e análise determinística.
- `scripts/normalize-data.mjs` — pipeline reproduzível XLSX → JSON.
- `skills/` — cinco papéis especializados reutilizáveis.
- `e2e/` — fluxos de navegador e captura de erros de console.

## Publicação

O workflow `pages.yml` compila a revisão de `main` e publica o diretório `dist/`
no GitHub Pages, com base configurada para `/religiomundi/`.
