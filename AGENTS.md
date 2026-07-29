# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the React/TypeScript application: reusable instruments live in
`src/components/`, global state in `src/state/`, and deterministic parsing/filtering helpers in
`src/utils/`. Browser flows are in `e2e/`. `scripts/rebuild_workbook.py` generates the canonical
`public/data/UNO_reformulado.xlsx` and structured `data/UNO_reformulado.csv`;
`scripts/normalize-data.mjs` produces the runtime JSON. Treat generated data and source scripts as
one change. Role-specific review checklists are under `skills/`.

## Build, Test, and Development Commands

- `npm install` installs frontend dependencies.
- `npm run dev` starts Vite locally.
- `npm run data:build` converts the workbook into normalized JSON.
- `npm run data:audit` checks dimensions, IDs, signatures, sources, and temporal sentinels.
- `npm test` runs Vitest unit and data-integrity tests.
- `npm run test:e2e` runs Playwright desktop/mobile flows.
- `npm run check` runs lint, tests, build, and the data audit before publication.

Python workbook generation requires `openpyxl`; install dependencies with
`python -m pip install -r requirements.txt`.

## Coding Style & Naming Conventions

Use two-space indentation in TypeScript and descriptive PascalCase component names such as
`TraditionDossier.tsx`; hooks use `useCamelCase`. Keep transformations pure and counters derived
from data rather than hard-coded. ESLint and Prettier-compatible formatting are enforced by
`npm run lint`. Preserve Portuguese accents, diacritics, original cell text, and the five
epistemic symbols (`●`, `≈`, `◇`, `?`, `—`).

## Testing & Data Integrity

Name unit tests `*.test.ts` and browser tests `*.spec.ts`. Any data edit must reject duplicate full
profiles, unexplained `-3200` fallbacks, invalid source codes, and family profiles presented as
individual facts. Ambiguous dates remain unknown or approximate. Selecting a tradition/archetype
must isolate related elements; clicking outside restores the scene without overlap regressions.

## Commits & Pull Requests

Use short imperative commits, for example `Audit temporal mappings`. PRs should explain the root
cause, changed data sources, UI impact, and checks executed. Include screenshots for visual changes
and never commit secrets, temporary workbooks, or build artifacts outside the publication workflow.
