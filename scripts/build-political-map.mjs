import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoArea } from "d3";
import { feature } from "topojson-client";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(ROOT, "public", "data", "polities");
const UPSTREAM_COMMIT = "62d8f1a03a71f2d3ff17f2d166f7553f256bce68";
const UPSTREAM_ROOT = `https://raw.githubusercontent.com/aourednik/historical-basemaps/${UPSTREAM_COMMIT}`;
const INDEX_URL = `${UPSTREAM_ROOT}/index.json`;
const SIMPLIFICATION_TOLERANCE = 0.12;
const COORDINATE_PRECISION = 2;
const CURRENT_YEAR = new Date().getFullYear();

const investigativeSources = [
  {
    title: "Historical boundaries of world countries and cultural regions",
    institution: "Alexandre Ourednik / GitHub",
    url: "https://github.com/aourednik/historical-basemaps",
    role: "Geometria histórica aproximada e campos de precisão cartográfica.",
  },
  {
    title: "Natural Earth — Admin 0 Countries",
    institution: "Natural Earth",
    url: "https://www.naturalearthdata.com/downloads/110m-cultural-vectors/",
    role: "Referência contemporânea simplificada.",
  },
  {
    title: "List of empires",
    institution: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/List_of_empires",
    role: "Auditoria investigativa de nomes e intervalos de impérios.",
  },
  {
    title: "List of largest empires",
    institution: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/List_of_largest_empires",
    role: "Referência comparativa de extensão, sem uso como geometria.",
  },
  {
    title: "Empires in World History",
    institution: "Global Policy Forum",
    url: "https://archive.globalpolicy.org/component/content/article/155-history/25992-empires-in-world-history.html",
    role: "Contexto historiográfico investigativo.",
  },
  {
    title: "List of countries and dependencies by area",
    institution: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_area",
    role: "Auditoria contemporânea de denominações territoriais.",
  },
  {
    title: "GeaCron World History Atlas",
    institution: "GeaCron",
    url: "https://geacron.com/home-en/",
    role: "Referência visual comparativa; nenhum polígono foi extraído.",
  },
  {
    title: "Portal: Civilizations",
    institution: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Portal:Civilizations",
    role: "Roteiro investigativo de civilizações.",
  },
  {
    title: "Human history",
    institution: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Human_history",
    role: "Contexto cronológico geral.",
  },
];

function roundCoordinate(value, precision = COORDINATE_PRECISION) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function squaredDistance(a, b) {
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  return x * x + y * y;
}

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyDouglasPeucker(points, first, last, toleranceSquared, output) {
  let maxDistance = toleranceSquared;
  let index;

  for (let cursor = first + 1; cursor < last; cursor += 1) {
    const distance = squaredSegmentDistance(points[cursor], points[first], points[last]);
    if (distance > maxDistance) {
      index = cursor;
      maxDistance = distance;
    }
  }

  if (index === undefined) return;
  if (index - first > 1) {
    simplifyDouglasPeucker(points, first, index, toleranceSquared, output);
  }
  output.push(points[index]);
  if (last - index > 1) {
    simplifyDouglasPeucker(points, index, last, toleranceSquared, output);
  }
}

function simplifyLine(coordinates, tolerance = SIMPLIFICATION_TOLERANCE) {
  const rounded = coordinates.map(([longitude, latitude]) => [
    roundCoordinate(longitude),
    roundCoordinate(latitude),
  ]);
  const deduplicated = rounded.filter(
    (point, index) => index === 0 || squaredDistance(point, rounded[index - 1]) > 0,
  );
  if (deduplicated.length <= 2) return deduplicated;

  const toleranceSquared = tolerance * tolerance;
  const output = [deduplicated[0]];
  simplifyDouglasPeucker(deduplicated, 0, deduplicated.length - 1, toleranceSquared, output);
  output.push(deduplicated.at(-1));
  return output;
}

function simplifyRing(ring) {
  if (!Array.isArray(ring) || ring.length < 4) return undefined;
  const first = ring[0];
  const last = ring.at(-1);
  const isClosed = first[0] === last[0] && first[1] === last[1];
  const openRing = isClosed ? ring.slice(0, -1) : ring;
  const simplified = simplifyLine(openRing);
  if (simplified.length < 3) return undefined;
  simplified.push([...simplified[0]]);
  return simplified;
}

function simplifyPolygon(polygon) {
  const rings = polygon.map(simplifyRing).filter(Boolean);
  return rings.length ? rings : undefined;
}

function simplifyGeometry(geometry) {
  if (!geometry) return undefined;
  if (geometry.type === "Polygon") {
    const coordinates = simplifyPolygon(geometry.coordinates);
    return coordinates ? { type: "Polygon", coordinates } : undefined;
  }
  if (geometry.type === "MultiPolygon") {
    const coordinates = geometry.coordinates.map(simplifyPolygon).filter(Boolean);
    return coordinates.length ? { type: "MultiPolygon", coordinates } : undefined;
  }
  return undefined;
}

function roundGeometry(geometry, precision = COORDINATE_PRECISION) {
  if (!geometry || !["Polygon", "MultiPolygon"].includes(geometry.type)) return undefined;
  const roundCoordinates = (value) =>
    typeof value[0] === "number"
      ? [roundCoordinate(value[0], precision), roundCoordinate(value[1], precision)]
      : value.map(roundCoordinates);
  return { type: geometry.type, coordinates: roundCoordinates(geometry.coordinates) };
}

function normalizePrecision(value, fallback = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(1, Math.min(3, Math.round(numeric)));
}

function normalizeFeature(sourceFeature, snapshotYear, index, contemporary = false) {
  const properties = sourceFeature.properties ?? {};
  const rawName = String(properties.NAME ?? properties.name ?? "").trim();
  if (!rawName) return undefined;
  const name = rawName;
  const simplifiedGeometry = simplifyGeometry(sourceFeature.geometry);
  if (!simplifiedGeometry) return undefined;
  const originalArea = geoArea(sourceFeature);
  const simplifiedArea = geoArea({
    type: "Feature",
    properties: {},
    geometry: simplifiedGeometry,
  });
  const distortionLimit = Math.max(Math.PI, originalArea * 4 + 0.01);
  let geometry = simplifiedGeometry;
  if (simplifiedArea > distortionLimit) {
    const roundedGeometry = roundGeometry(sourceFeature.geometry);
    const roundedArea = roundedGeometry
      ? geoArea({ type: "Feature", properties: {}, geometry: roundedGeometry })
      : Number.POSITIVE_INFINITY;
    geometry =
      roundedArea > distortionLimit ? roundGeometry(sourceFeature.geometry, 5) : roundedGeometry;
  }
  if (!geometry) return undefined;
  const outputArea = geoArea({ type: "Feature", properties: {}, geometry });
  if (originalArea < Math.PI && outputArea > distortionLimit) {
    return undefined;
  }
  const subject = String(properties.SUBJECTO ?? "").trim() || name;
  const partOf = String(properties.PARTOF ?? "").trim();
  const polityType = String(properties.type ?? "").trim() || (contemporary ? "country" : "polity");
  const sourceUrl = String(properties.weblnks ?? "").trim();

  return {
    type: "Feature",
    id: `${snapshotYear}:${index}`,
    properties: {
      name,
      subject,
      partOf,
      polityType,
      borderPrecision: normalizePrecision(properties.BORDERPRECISION, contemporary ? 3 : 1),
      sourceUrl: /^https?:\/\//.test(sourceUrl) ? sourceUrl : undefined,
    },
    geometry,
  };
}

function snapshotFilename(year) {
  return year < 0 ? `snapshot-bc${Math.abs(year)}.json` : `snapshot-${year}.json`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ao carregar ${url}`);
  return response.json();
}

async function buildHistoricalSnapshot(entry) {
  const source = await fetchJson(`${UPSTREAM_ROOT}/geojson/${entry.filename}`);
  const features = source.features
    .map((item, index) => normalizeFeature(item, entry.year, index))
    .filter(Boolean);
  return {
    indexEntry: {
      year: entry.year,
      label:
        entry.year < 0 ? `${Math.abs(entry.year).toLocaleString("pt-BR")} a.C.` : `${entry.year}`,
      file: snapshotFilename(entry.year),
      featureCount: features.length,
      source: "historical-basemaps",
      precision: "varies",
    },
    collection: {
      type: "FeatureCollection",
      snapshotYear: entry.year,
      source: "historical-basemaps",
      sourceCommit: UPSTREAM_COMMIT,
      features,
    },
  };
}

async function buildCurrentSnapshot() {
  const topology = JSON.parse(
    await readFile(path.join(ROOT, "node_modules", "world-atlas", "countries-110m.json"), "utf8"),
  );
  const collection = feature(topology, topology.objects.countries);
  const features = collection.features
    .map((item, index) => normalizeFeature(item, CURRENT_YEAR, index, true))
    .filter(Boolean);
  return {
    indexEntry: {
      year: CURRENT_YEAR,
      label: `Atual · ${CURRENT_YEAR}`,
      file: snapshotFilename(CURRENT_YEAR),
      featureCount: features.length,
      source: "natural-earth",
      precision: "contemporary-reference",
    },
    collection: {
      type: "FeatureCollection",
      snapshotYear: CURRENT_YEAR,
      source: "natural-earth",
      sourceVersion: "Natural Earth 4.1.0 via world-atlas 2.0.2",
      features,
    },
  };
}

async function runPool(items, concurrency, task) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });

const upstreamIndex = await fetchJson(INDEX_URL);
const snapshots = await runPool(upstreamIndex.years, 6, buildHistoricalSnapshot);
snapshots.push(await buildCurrentSnapshot());
snapshots.sort((a, b) => a.indexEntry.year - b.indexEntry.year);

for (const snapshot of snapshots) {
  await writeFile(
    path.join(OUTPUT_DIR, snapshot.indexEntry.file),
    JSON.stringify(snapshot.collection),
  );
}

const index = {
  title: "Camada política temporal do RELIGIO MUNDI",
  generatedAt: new Date().toISOString(),
  selectionRule: "latest-snapshot-not-after-selected-year",
  interpolation: false,
  coordinatePrecision: COORDINATE_PRECISION,
  simplificationToleranceDegrees: SIMPLIFICATION_TOLERANCE,
  caveat:
    "Fronteiras, culturas e áreas de influência são aproximações por recortes descontínuos. Polígonos não provam soberania uniforme, ocupação exclusiva ou consenso historiográfico.",
  sources: investigativeSources,
  snapshots: snapshots.map(({ indexEntry }) => indexEntry),
};

await writeFile(path.join(OUTPUT_DIR, "index.json"), JSON.stringify(index));
await writeFile(
  path.join(OUTPUT_DIR, "NOTICE.md"),
  `# Aviso cartográfico

Os recortes históricos derivados de \`aourednik/historical-basemaps\` foram simplificados para
visualização global e carregamento progressivo. Fonte fixada no commit
\`${UPSTREAM_COMMIT}\`, licenciada sob GNU GPL v3. Os mapas são trabalho em andamento e devem ser
tratados como aproximações. A camada contemporânea deriva do Natural Earth 4.1.0 redistribuído por
\`world-atlas\`.

Não há interpolação entre recortes. A interface exibe o último snapshot não posterior ao ano
selecionado e informa permanentemente o ano cartográfico efetivamente utilizado.
`,
);

const license = await fetch(`${UPSTREAM_ROOT}/LICENSE`).then((response) => response.text());
await writeFile(path.join(OUTPUT_DIR, "LICENSE-GPL-3.0.txt"), license);

const totalBytes = (
  await Promise.all(
    snapshots.map(async ({ indexEntry }) => {
      const content = await readFile(path.join(OUTPUT_DIR, indexEntry.file));
      return content.byteLength;
    }),
  )
).reduce((sum, size) => sum + size, 0);

console.log(
  JSON.stringify({
    snapshots: snapshots.length,
    features: snapshots.reduce((sum, item) => sum + item.indexEntry.featureCount, 0),
    totalBytes,
    averageSnapshotBytes: Math.round(totalBytes / snapshots.length),
  }),
);
