# Repository Guidelines

## Project Structure & Module Organization

This repository is centered on `UNO.xlsx`, an Excel workbook containing the primary `uno` matrix plus the supporting `Planilha11` timeline and `Planilha1` correspondence table. Keep the workbook at the repository root unless a future migration is documented. `UNO.xlsx:Zone.Identifier` is Windows download metadata; do not treat it as project data or edit it.

When adding documentation or automation, place prose in `docs/` and reusable validation scripts in `scripts/`. Avoid committing temporary lock files such as `~$UNO.xlsx`, exported PDFs, or duplicate workbook copies.

## Build, Test, and Development Commands

There is no compilation step or package-managed development environment. Edit `UNO.xlsx` with Microsoft Excel, LibreOffice Calc, or another OOXML-compatible application.

- `unzip -t UNO.xlsx` checks that the workbook remains a valid ZIP/OOXML container.
- `git diff --stat` reviews the scope of tracked changes after Git is initialized.
- `git status --short` identifies unintended exports or editor-generated files.

Always open and save the workbook once in a spreadsheet application after automated processing.

## Data Style & Naming Conventions

Preserve existing Portuguese terminology, accents, sheet names, merged cells, formatting, and chronological ordering. Keep category labels in column A and historical or cultural entries in the corresponding period columns. Use concise, factual cell text and consistent date notation, such as `10.000 a.C.`. Do not rename sheets or reorder columns without documenting downstream impacts.

## Testing Guidelines

No automated test suite or coverage target currently exists. For every workbook change:

1. Run `unzip -t UNO.xlsx`.
2. Open all three sheets and check for repair warnings, clipped text, broken merges, or unexpected style changes.
3. Spot-check edited rows against their source material and verify dates, names, and accents.

For large edits, compare a before-and-after export or screenshot of the affected range.

## Commit & Pull Request Guidelines

No Git history is available, so use short imperative commits, for example `Correct Era Axial dates`. Keep workbook edits focused and avoid bundling unrelated formatting changes. Pull requests should describe the affected sheets and ranges, explain the source or rationale, list manual checks performed, and include screenshots when layout or formatting changes.

