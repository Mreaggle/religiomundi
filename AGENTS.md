# Repository Guidelines

## Project Structure & Ownership

`src/components/` contains React/D3 instruments; `src/state/` owns global atlas state; `src/utils/`
contains pure temporal, filtering, clustering, collision, and analysis rules. Browser scenarios live
in `e2e/`. `public/data/UNO_reformulado.xlsx` is canonical; `scripts/normalize-data.mjs` generates
runtime JSON and `scripts/audit-data.mjs` guards historical/data regressions. Treat source scripts,
the workbook, CSV, and generated JSON as one data change. Specialized review procedures live in
`skills/`, including mandatory pre-publication Q.A. in `skills/qa-religiomundi/`.

## Commands

- `npm run dev` — normalize data and start Vite.
- `npm run data:build` / `npm run data:audit` — regenerate and validate the dataset.
- `npm test` — run Vitest rules and data-integrity checks.
- `npm run test:e2e` — exercise Chromium desktop and mobile flows.
- `npm run build` — type-check and create the production bundle.
- `npm run check` — run lint, unit tests, build, and data audit.

Use Node.js 20.19+. Workbook reconstruction requires `python -m pip install -r requirements.txt`.

## Code & Interaction Conventions

Use two-space TypeScript indentation, PascalCase components, `useCamelCase` hooks, and pure derived
state. Biome is authoritative. Preserve Portuguese accents, cell text, diacritics, and `● ≈ ◇ ? —`.
Never hard-code catalog counts.

Color identifies an archetype; line pattern identifies epistemic status. Every active archetype
must have a representative fiber. SVG zoom must progressively enlarge labels and targets without
scaling them as fast as geometry. Selection closes exactly once through X, backdrop, outside click,
or `Escape`; `Revelar padrões` must not mount a competing dossier. On phone landscape, the sticky
timeline starts collapsed and remains manually reversible.

## Testing & Data Integrity

Name unit tests `*.test.ts` and browser tests `*.spec.ts`. Run the Q.A. skill for changes affecting
SVG, timeline, responsive layout, dossiers, filters, SEO, or data. Validate at 1440×1000, 393×851,
and 844×390. Reject duplicate full profiles, unexplained `-3200` fallbacks, unknown source codes,
family profiles presented as individual facts, console errors, flicker, and horizontal overflow.
Ambiguous dates remain approximate or unknown. The ÁRVORE draws sourced lineage/influence only.

## SEO, Commits & Pull Requests

Keep `index.html`, JSON-LD, canonical URL, Open Graph, `robots.txt`, `sitemap.xml`, README counts,
and production metadata synchronized. Use imperative commits, e.g. `Fix archetype fiber coverage`.
PRs must explain root cause, UI/data impact, checks run, and include visual evidence when relevant.
Never commit secrets, temporary artifacts, `collision.png`, or unrelated user files.
