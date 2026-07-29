# RELIGIO MUNDI

Atlas temporal interativo de 471 religiões, cosmovisões, tradições e registros arqueológicos, correlacionados a 44 funções comparativas. A experiência combina uma constelação arquetípica fixa, cartografia regional, escala temporal híbrida, matriz virtualizada, dossiês e comparação lado a lado.

> Os nomes mudam. As funções reaparecem. As diferenças continuam importando.

## Fonte de dados

`public/data/UNO_reformulado.xlsx` é a fonte canônica. `npm run data:build` lê todas as oito abas e gera `public/data/atlas.generated.json`, preservando o texto integral das 20.724 células. O CSV estruturado para agentes está em `data/UNO_reformulado.csv`.

Coordenadas são aproximações regionais de interface, nunca localizações arqueológicas precisas. Datas ambíguas permanecem marcadas como aproximadas, por século, macroperíodo ou desconhecidas.

Na constelação e no mapa, use a roda do mouse ou gesto de pinça para aproximar no ponto focal e arraste para navegar. Os marcadores são agrupamentos: o número indica quantas tradições estão reunidas ali. `Catálogo · 471` ignora temporariamente o recorte cronológico para tornar todo o acervo pesquisável. Uma seleção isola somente seus elementos relacionados; clique fora do dossiê para restaurar a cena.

## Desenvolvimento

Requer Node.js 20.19 ou superior.

```bash
npm install
npm run dev
```

Comandos principais:

- `npm run data:build` — normaliza a planilha.
- `npm run data:audit` — detecta regressões de datas, perfis repetidos e referências.
- `npm run build` — gera os dados, verifica TypeScript e compila a aplicação.
- `npm test` — executa 20 testes unitários e de integridade.
- `npm run test:e2e` — valida desktop e celular no Chromium.
- `npm run lint` — verifica código, acessibilidade estática e formatação.
- `npm run check` — executa lint, testes e build.

## Princípio metodológico

“Arquétipo” é uma ferramenta de indexação comparativa. Uma função recorrente não prova que entidades sejam idênticas, que tradições tenham origem comum ou que tenha ocorrido transmissão histórica. A camada `Aeons — autoral` permanece separada dos cálculos historiográficos.

As listas [Wikimedia Commons — Religion](https://commons.wikimedia.org/wiki/Category:Religion), [Wikipedia — List of religions and spiritual traditions](https://en.wikipedia.org/wiki/List_of_religions_and_spiritual_traditions) e [Open Mind Project — All Faiths](https://www.openmindproject.com/all-faiths-religions-2) são checklists investigativos de cobertura, não evidência isolada para datas, doutrinas ou correlações. Cada inclusão exige fonte independente.

## Estrutura

- `src/components/` — instrumentos visuais, dossiês e modos de exploração.
- `src/state/` e `src/utils/` — estado previsível, filtros, tempo e análise determinística.
- `scripts/normalize-data.mjs` — pipeline reproduzível XLSX → JSON.
- `skills/` — cinco papéis especializados reutilizáveis.
- `e2e/` — fluxos de navegador e captura de erros de console.

## Publicação

O workflow `pages.yml` compila a revisão de `main` e publica o diretório `dist/`
no GitHub Pages, com base configurada para `/religiomundi/`.
