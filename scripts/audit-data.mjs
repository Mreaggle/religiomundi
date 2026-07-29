import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = path.join(ROOT, "public", "data", "atlas.generated.json");
const data = JSON.parse(await readFile(DATA_PATH, "utf8"));
const errors = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const ids = new Set();
const names = new Set();
const signatures = new Map();
const sourceCodes = new Set(data.sources.map((source) => source.code));

assert(data.archetypes.length === 44, `Esperados 44 arquétipos; obtidos ${data.archetypes.length}`);
assert(data.traditions.length >= 470, `Catálogo regrediu para ${data.traditions.length} tradições`);

for (const tradition of data.traditions) {
  assert(!ids.has(tradition.id), `ID duplicado: ${tradition.id}`);
  assert(!names.has(tradition.name), `Nome duplicado: ${tradition.name}`);
  ids.add(tradition.id);
  names.add(tradition.name);

  const cells = Object.values(tradition.correlations);
  assert(cells.length === 44, `${tradition.name}: ${cells.length} células, esperadas 44`);
  for (const code of tradition.sourceCodes) {
    assert(sourceCodes.has(code), `${tradition.name}: fonte desconhecida ${code}`);
  }

  const signature = JSON.stringify(cells.map((cell) => cell.originalText));
  const peers = signatures.get(signature) ?? [];
  peers.push(tradition.name);
  signatures.set(signature, peers);

  if (tradition.mappingScope === "Perfil de família auditável") {
    assert(
      Number.isInteger(tradition.individualizedCells) &&
        tradition.individualizedCells >= 0 &&
        tradition.individualizedCells <= data.archetypes.length,
      `${tradition.name}: contagem inválida de células individualizadas`,
    );
    const provisional = cells.filter((cell) =>
      cell.originalText.includes("Perfil de família ainda não individualizado"),
    ).length;
    assert(
      provisional + tradition.individualizedCells <= data.archetypes.length,
      `${tradition.name}: escopo provisório excede as ${data.archetypes.length} funções`,
    );
  }

  assert(
    tradition.startYear !== -3200 || tradition.periodLabel.includes("3.200"),
    `${tradition.name}: início -3200 parece fallback de “Antiguidade”`,
  );
  assert(Boolean(tradition.region), `${tradition.name}: origem regional vazia`);
  assert(tradition.region !== "Global", `${tradition.name}: alcance global usado como origem`);
  assert(Boolean(tradition.location), `${tradition.name}: origem sem âncora cartográfica`);
  assert(
    ["regional", "multi-regional", "diasporic", "global"].includes(tradition.geographicReach),
    `${tradition.name}: alcance geográfico inválido`,
  );
}

for (const peers of signatures.values()) {
  assert(peers.length === 1, `Assinatura integral repetida: ${peers.join(" | ")}`);
}

const expectedStarts = new Map([
  ["Hermetic Order of the Golden Dawn", 1888],
  ["Rosacrucianismos modernos", 1614],
  ["Romuva", 1967],
  ["Luteranismo", 1517],
  ["Batistas", 1609],
  ["Pentecostalismo", 1901],
  ["Cristianismo etíope/eritreu", 301],
  ["Jainismo Digambara", 1],
  ["Jainismo Śvetāmbara", 1],
]);
for (const [name, expected] of expectedStarts) {
  const tradition = data.traditions.find((item) => item.name === name);
  assert(Boolean(tradition), `Tradição auditada ausente: ${name}`);
  assert(
    tradition?.startYear === expected,
    `${name}: início ${tradition?.startYear ?? "indefinido"}, esperado ${expected}`,
  );
}

for (const code of ["L01", "L02", "L03", "P01", "P02", "P03", "P04"]) {
  assert(sourceCodes.has(code), `Referência investigativa/arqueológica ausente: ${code}`);
}

const bruniquel = data.traditions.find((item) => item.name.includes("Bruniquel"));
assert(
  (bruniquel?.startYear ?? 0) < -170000,
  "Bruniquel não ocupa o recorte anterior a 100.000 AP",
);
assert(
  /não.*animismo|função.*não.*demonstrada/i.test(bruniquel?.scopeNote ?? ""),
  "Bruniquel precisa explicitar o limite contra inferência religiosa",
);

if (errors.length) {
  console.error(`Auditoria falhou com ${errors.length} problema(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  JSON.stringify({
    traditions: data.traditions.length,
    archetypes: data.archetypes.length,
    correlations: data.metadata.correlationCount,
    sources: data.sources.length,
    uniqueSignatures: signatures.size,
    unknownTemporalStarts: data.traditions.filter(
      (tradition) => tradition.temporalPrecision === "unknown",
    ).length,
    earliestStartYear: Math.min(
      ...data.traditions
        .map((tradition) => tradition.startYear)
        .filter((year) => Number.isFinite(year)),
    ),
  }),
);
