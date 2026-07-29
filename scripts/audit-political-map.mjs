import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "public", "data", "polities");
const index = JSON.parse(await readFile(path.join(DATA_DIR, "index.json"), "utf8"));
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

assert(index.snapshots.length >= 50, `Apenas ${index.snapshots.length} recortes cartográficos`);
assert(index.interpolation === false, "A camada cartográfica não pode interpolar fronteiras");
assert(
  index.selectionRule === "latest-snapshot-not-after-selected-year",
  `Regra temporal inesperada: ${index.selectionRule}`,
);

let previousYear = Number.NEGATIVE_INFINITY;
let totalFeatures = 0;
let totalBytes = 0;
for (const entry of index.snapshots) {
  assert(entry.year > previousYear, `Recortes fora de ordem ou repetidos em ${entry.year}`);
  previousYear = entry.year;

  const filePath = path.join(DATA_DIR, entry.file);
  const [raw, fileStats] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
  const snapshot = JSON.parse(raw);
  totalBytes += fileStats.size;
  totalFeatures += snapshot.features.length;

  assert(
    snapshot.snapshotYear === entry.year,
    `${entry.file}: ano interno ${snapshot.snapshotYear}, esperado ${entry.year}`,
  );
  assert(
    snapshot.features.length === entry.featureCount,
    `${entry.file}: ${snapshot.features.length} feições, índice declara ${entry.featureCount}`,
  );
  assert(fileStats.size < 750_000, `${entry.file}: ${(fileStats.size / 1000).toFixed(0)} KB`);

  const ids = new Set();
  for (const feature of snapshot.features) {
    assert(!ids.has(feature.id), `${entry.file}: ID repetido ${feature.id}`);
    ids.add(feature.id);
    assert(Boolean(feature.properties.name), `${entry.file}: feição sem nome`);
    assert(
      [1, 2, 3].includes(feature.properties.borderPrecision),
      `${entry.file}: precisão inválida em ${feature.properties.name}`,
    );
    assert(
      ["Polygon", "MultiPolygon"].includes(feature.geometry?.type),
      `${entry.file}: geometria inválida em ${feature.properties.name}`,
    );
  }
}

const years = new Set(index.snapshots.map((entry) => entry.year));
for (const required of [-3000, -1500, 1200, 1492, 1914, 1945, 2010, 2026]) {
  assert(years.has(required), `Recorte essencial ausente: ${required}`);
}

const sources = new Set(index.sources.map((source) => source.url));
for (const required of [
  "https://en.wikipedia.org/wiki/List_of_empires",
  "https://en.wikipedia.org/wiki/List_of_largest_empires",
  "https://archive.globalpolicy.org/component/content/article/155-history/25992-empires-in-world-history.html",
  "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_area",
  "https://geacron.com/home-en/",
  "https://en.wikipedia.org/wiki/Portal:Civilizations",
  "https://en.wikipedia.org/wiki/Human_history",
]) {
  assert(sources.has(required), `Referência investigativa ausente: ${required}`);
}

if (errors.length) {
  console.error(`Auditoria cartográfica falhou com ${errors.length} problema(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  JSON.stringify({
    snapshots: index.snapshots.length,
    features: totalFeatures,
    totalBytes,
    averageSnapshotBytes: Math.round(totalBytes / index.snapshots.length),
    firstYear: index.snapshots[0].year,
    lastYear: index.snapshots.at(-1).year,
  }),
);
