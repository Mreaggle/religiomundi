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

function statusTokens(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[/;,]/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function statusMarksLiving(value) {
  return statusTokens(value).includes("viva");
}

const ids = new Set();
const names = new Set();
const signatures = new Map();
const sourceCodes = new Set(data.sources.map((source) => source.code));
const visibilityBases = new Set([
  "parsed-attestation",
  "macroperiod-bound",
  "living-documentary-floor",
  "present-only",
]);

assert(data.archetypes.length === 44, `Esperados 44 arquétipos; obtidos ${data.archetypes.length}`);
assert(data.traditions.length >= 482, `Catálogo regrediu para ${data.traditions.length} tradições`);

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
  assert(
    visibilityBases.has(tradition.visibilityBasis),
    `${tradition.name}: base de visibilidade temporal inválida`,
  );
  if (tradition.visibilityBasis === "living-documentary-floor") {
    assert(
      tradition.startYear === undefined && tradition.visibilityStartYear === 1800,
      `${tradition.name}: piso documental não pode substituir a data histórica de início`,
    );
    assert(
      tradition.parsingNotes.includes("não é data de origem"),
      `${tradition.name}: piso documental sem ressalva explícita`,
    );
  }
  const tokens = statusTokens(tradition.status);
  if (tokens.includes("revival") && !tokens.includes("viva")) {
    assert(
      !tradition.isStillActive,
      `${tradition.name}: revival sem continuidade viva tratado como intervalo ininterrupto`,
    );
  }
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
  ["Brahmo Samaj", 1828],
  ["Arya Samaj", 1875],
  ["Navayāna/Budismo ambedkarista", 1956],
  ["Won Buddhism", 1916],
  ["Radhasoami/Sant Mat moderno", 1861],
  ["Moorish Science Temple of America", 1920],
  ["Igreja Morávia/Unitas Fratrum", 1457],
  ["Exército de Salvação", 1865],
  ["Deísmo moderno", 1690],
]);
for (const [name, expected] of expectedStarts) {
  const tradition = data.traditions.find((item) => item.name === name);
  assert(Boolean(tradition), `Tradição auditada ausente: ${name}`);
  assert(
    tradition?.startYear === expected,
    `${name}: início ${tradition?.startYear ?? "indefinido"}, esperado ${expected}`,
  );
}

for (const code of [
  "L01",
  "L02",
  "L03",
  "P01",
  "P02",
  "P03",
  "P04",
  "G01",
  "G02",
  "G03",
  "G04",
  "G05",
  "G06",
  "G07",
  "G08",
  "G09",
  "G10",
  "G11",
  "G12",
  "G13",
  "G14",
  "G15",
]) {
  assert(sourceCodes.has(code), `Referência investigativa/arqueológica ausente: ${code}`);
}

function panoramaVisible(tradition, year) {
  const start = tradition.visibilityStartYear ?? tradition.startYear;
  if (start === undefined) {
    return tradition.isStillActive && year === (tradition.endYear ?? data.metadata.currentYear);
  }
  return year >= start && year <= (tradition.endYear ?? start);
}

for (const name of [
  "Religião Yorùbá e Ifá",
  "Religião Akan",
  "Vodun Fon-Ewe",
  "Odinani (Igbo)",
  "Religião Dinka",
  "Religiões San",
  "Religião tradicional malgaxe",
  "Cultos Mami Wata",
  "Bwiti",
  "Bori Hausa",
  "Culto Zar",
]) {
  const tradition = data.traditions.find((item) => item.name === name);
  assert(Boolean(tradition), `Tradição africana auditada ausente: ${name}`);
  assert(
    tradition && panoramaVisible(tradition, 1900),
    `${name}: tradição viva desaparece do panorama de 1900`,
  );
}
for (const name of ["Religião Guanche", "Religião núbia/kushita"]) {
  const tradition = data.traditions.find((item) => item.name === name);
  assert(
    tradition && !panoramaVisible(tradition, 1900) && !panoramaVisible(tradition, 2026),
    `${name}: religião histórica apresentada como continuidade moderna`,
  );
}

const livingUnknownStarts = data.traditions.filter(
  (tradition) => statusMarksLiving(tradition.status) && tradition.startYear === undefined,
);
for (const tradition of livingUnknownStarts) {
  assert(
    Number.isFinite(tradition.visibilityStartYear) && tradition.visibilityStartYear <= 1900,
    `${tradition.name}: tradição viva com início desconhecido reaparece apenas no presente`,
  );
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
    livingDocumentaryFloors: data.traditions.filter(
      (tradition) => tradition.visibilityBasis === "living-documentary-floor",
    ).length,
    activePresentOnly: data.traditions.filter(
      (tradition) =>
        tradition.isStillActive &&
        tradition.startYear === undefined &&
        tradition.visibilityStartYear === undefined,
    ).length,
    earliestStartYear: Math.min(
      ...data.traditions
        .map((tradition) => tradition.startYear)
        .filter((year) => Number.isFinite(year)),
    ),
  }),
);
