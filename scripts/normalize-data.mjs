import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readXlsxFile from "read-excel-file/node";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKBOOK_PATH = path.join(ROOT, "data", "UNO_reformulado.xlsx");
const OUTPUT_PATH = path.join(ROOT, "public", "data", "atlas.generated.json");
const CURRENT_YEAR = 2026;
const LIVING_DOCUMENTARY_FLOOR = 1800;
const PRECOLONIAL_VISIBILITY_FLOOR = 1450;

const MACRO_PERIODS = [
  { id: "prehistory", start: -180000, end: -3201 },
  { id: "bronze", start: -3200, end: -1201 },
  { id: "iron", start: -1200, end: -201 },
  { id: "late-antiquity", start: -200, end: 599 },
  { id: "medieval", start: 600, end: 1449 },
  { id: "early-modern", start: 1450, end: 1799 },
  { id: "industrial", start: 1800, end: 1944 },
  { id: "contemporary", start: 1945, end: CURRENT_YEAR },
];

const REGION_ANCHORS = [
  ["mesopotâmia meridional", 31, 46],
  ["mesopotâmia setentrional", 36, 43],
  ["mesopotâmia", 33, 44],
  ["vale do nilo", 26, 31],
  ["egito", 27, 30],
  ["levante", 32, 35],
  ["anatólia", 39, 35],
  ["cáucaso", 42, 44],
  ["irá", 32, 53],
  ["iraque", 33, 44],
  ["península arábica", 23, 45],
  ["arábia", 23, 45],
  ["oriente médio", 29, 44],
  ["oriente próximo", 31, 39],
  ["mediterrâneo", 36, 18],
  ["creta", 35, 25],
  ["grécia", 39, 22],
  ["egeu", 38, 25],
  ["eleusis", 38, 23],
  ["itália", 42, 12],
  ["roma", 42, 12],
  ["irlanda", 53, -8],
  ["grã-bretanha", 54, -2],
  ["escandinávia", 61, 15],
  ["finlândia", 64, 26],
  ["carélia", 64, 31],
  ["lituânia", 55, 24],
  ["letônia", 57, 25],
  ["prússia", 54, 20],
  ["europa ocidental", 50, 3],
  ["europa oriental", 51, 29],
  ["europa setentrional", 60, 16],
  ["europa central", 50, 12],
  ["alemanha", 51, 10],
  ["suíça", 47, 8],
  ["países baixos", 52, 5],
  ["frança", 46, 2],
  ["bálcãs", 43, 21],
  ["europa", 51, 10],
  ["sápmi", 68, 20],
  ["sibéria", 60, 90],
  ["ásia central", 44, 68],
  ["estepe", 46, 72],
  ["eurásia", 45, 60],
  ["punjab", 31, 74],
  ["índia", 22, 78],
  ["nepal", 28, 84],
  ["paquistão", 30, 70],
  ["afeganistão", 34, 66],
  ["sul da ásia", 22, 78],
  ["himalaia", 30, 85],
  ["tibete", 31, 88],
  ["china", 35, 104],
  ["taiwan", 24, 121],
  ["japão", 37, 138],
  ["coreia", 37, 127],
  ["vietnã", 16, 106],
  ["indonésia", -2, 117],
  ["filipinas", 12, 122],
  ["sudeste asiático", 10, 104],
  ["leste asiático", 34, 116],
  ["ásia", 34, 92],
  ["nigéria", 9, 8],
  ["benim", 9, 2],
  ["togo", 8, 1],
  ["gana", 8, -1],
  ["costa do marfim", 7, -5],
  ["áfrica ocidental", 9, -2],
  ["áfrica central", 0, 20],
  ["áfrica oriental", 1, 37],
  ["áfrica austral", -24, 24],
  ["madagascar", -19, 47],
  ["ilhas canárias", 28, -16],
  ["norte da áfrica", 29, 10],
  ["áfrica", 5, 20],
  ["nordeste do brasil", -8, -38],
  ["brasil", -12, -52],
  ["paraguai", -23, -58],
  ["argentina", -35, -64],
  ["bolívia", -17, -65],
  ["américa do sul", -15, -62],
  ["américa do norte", 40, -102],
  ["estados unidos", 38, -100],
  ["eua", 38, -100],
  ["méxico central", 19, -99],
  ["méxico", 23, -102],
  ["mesoamérica", 17, -90],
  ["guatemala", 15, -90],
  ["andes", -15, -72],
  ["caribe", 19, -72],
  ["guianas", 5, -58],
  ["cuba", 22, -79],
  ["haiti", 19, -72],
  ["jamaica", 18, -77],
  ["louisiana", 31, -92],
  ["américas", 5, -75],
  ["austrália", -25, 134],
  ["estreito de torres", -10, 142],
  ["aotearoa", -41, 174],
  ["nova zelândia", -41, 174],
  ["melanésia", -8, 160],
  ["oceania", -12, 160],
];

const ORIGIN_OVERRIDE_GROUPS = [
  [["T318"], "Levante/Mesopotâmia"],
  [["T319", "T320", "T321"], "Europa"],
  [["T322", "T323"], "Estados Unidos"],
  [["T330"], "Levante/Mediterrâneo"],
  [["T331"], "Mediterrâneo/Europa"],
  [["T332"], "Mediterrâneo/Europa Oriental"],
  [["T333"], "Levante/África"],
  [["T334"], "Mesopotâmia"],
  [["T335"], "Grã-Bretanha"],
  [["T336"], "Alemanha"],
  [["T337"], "Suíça/Europa Ocidental"],
  [["T338"], "Países Baixos/Grã-Bretanha"],
  [["T339"], "Grã-Bretanha"],
  [["T340", "T341", "T342"], "Estados Unidos"],
  [["T343"], "Grã-Bretanha"],
  [["T344"], "Europa Central"],
  [["T351"], "Estados Unidos"],
  [["T352"], "Estados Unidos/Grã-Bretanha"],
  [["T353"], "Filipinas"],
  [["T354"], "Estados Unidos"],
  [["T356"], "Península Arábica"],
  [["T357"], "Iraque"],
  [["T358"], "Península Arábica"],
  [["T359"], "Iraque/Egito"],
  [["T360"], "Iraque"],
  [["T366"], "Oriente Médio"],
  [["T367"], "Iraque"],
  [["T368"], "Ásia Central"],
  [["T369"], "Afeganistão/Sul da Ásia"],
  [["T370"], "Anatólia"],
  [["T371"], "Norte da África"],
  [["T372"], "Anatólia/Bálcãs"],
  [["T379"], "Irã/Iraque"],
  [["T389"], "Estados Unidos/Europa"],
  [["T390"], "Alemanha/Suíça"],
  [["T399"], "Grã-Bretanha"],
  [["T400"], "Grã-Bretanha/Europa"],
  [["T401"], "Estados Unidos/Grã-Bretanha"],
  [["T402", "T403"], "Estados Unidos"],
  [["T404"], "Grã-Bretanha/Egito"],
  [["T405"], "Europa Central"],
  [["T406", "T407"], "Grã-Bretanha"],
  [["T413"], "Grã-Bretanha/Europa"],
  [["T424", "T426"], "Estados Unidos"],
  [["T427"], "Europa/América do Norte"],
  [["T428", "T429", "T430", "T431"], "Estados Unidos"],
  [["T432", "T433"], "América do Norte/Europa Ocidental"],
  [["T434", "T435"], "Estados Unidos"],
  [["T436"], "América do Norte/Europa"],
  [["T437", "T438"], "Europa"],
  [["T439", "T440"], "Estados Unidos"],
  [["T441", "T442", "T443", "T444"], "Índia"],
  [["T445"], "Indonésia"],
  [["T453", "T454", "T455"], "Coreia"],
  [["T456"], "Estados Unidos"],
  [["T457"], "França"],
  [["T458"], "Grã-Bretanha"],
  [["T459"], "Estados Unidos"],
  [["T460"], "Taiwan"],
  [["T461"], "Estados Unidos"],
  [["T467"], "Europa"],
  [["T468"], "Europa/América do Norte"],
  [["T469"], "França"],
  [["T470"], "Estados Unidos"],
  [["T471"], "Europa/América do Norte"],
];

const ORIGIN_OVERRIDES = new Map(
  ORIGIN_OVERRIDE_GROUPS.flatMap(([ids, region]) => ids.map((id) => [id, region])),
);

function text(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function fold(value) {
  return text(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function rowsAsObjects(rows, headerIndex) {
  const headers = rows[headerIndex].map(text);
  return rows
    .slice(headerIndex + 1)
    .filter((row) => row.some((cell) => text(cell)))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null])));
}

function romanToInt(roman) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  return [...roman.toUpperCase()].reduceRight(
    (total, character, index, source) =>
      total +
      (index < source.length - 1 && values[character] < values[source[index + 1]]
        ? -values[character]
        : values[character]),
    0,
  );
}

function centuryInterval(value, era) {
  if (era === "bce") {
    return { start: -value * 100, end: -(value - 1) * 100 - 1 };
  }
  return { start: (value - 1) * 100 + 1, end: value * 100 };
}

function millenniumInterval(value, era) {
  if (era === "bce") {
    return { start: -value * 1000, end: -(value - 1) * 1000 - 1 };
  }
  return { start: (value - 1) * 1000 + 1, end: value * 1000 };
}

function inferMacroPeriod(label, startYear) {
  const normalized = fold(label);
  if (Number.isFinite(startYear)) {
    return (
      MACRO_PERIODS.find((period) => startYear >= period.start && startYear <= period.end)?.id ??
      "contemporary"
    );
  }
  if (normalized.includes("pre-hist") || normalized.includes("paleolit")) return "prehistory";
  if (normalized.includes("antiguidade tardia")) return "late-antiquity";
  if (normalized.includes("antiguidade")) return "bronze";
  if (normalized.includes("medieval") || normalized.includes("idade media")) return "medieval";
  if (
    normalized.includes("renascimento") ||
    normalized.includes("iluminismo") ||
    normalized.includes("colonial")
  ) {
    return "early-modern";
  }
  if (normalized.includes("seculo xix")) return "industrial";
  return "contemporary";
}

function parseTemporal(label, status) {
  const original = text(label);
  const normalized = fold(original).replaceAll("–", "-").replaceAll("—", "-");
  const foldedStatus = fold(status);
  const statusTokens = foldedStatus
    .split(/[/;,]/)
    .map((token) => token.trim())
    .filter(Boolean);
  const statusMarksLiving = statusTokens.includes("viva");
  const statusMarksRevival = statusTokens.includes("revival");
  const presentOnlyAsRevival =
    normalized.includes("presente/avivamento") || normalized.includes("presente/revival");
  const labelMarksLiving = /(?:^|\W)vivas?(?:\W|$)/.test(normalized);
  const isStillActive =
    (normalized.includes("presente") && !presentOnlyAsRevival) ||
    labelMarksLiving ||
    statusMarksLiving;
  const points = [];
  let hasCentury = false;
  let hasMillennium = false;
  const firstCenturiesMatch = original.match(/primeiros?\s+s(?:é|e)culos?\s+d\.?\s*C\.?/i);
  if (firstCenturiesMatch) {
    hasCentury = true;
    points.push(1, 300);
  }

  for (const match of original.matchAll(
    /s(?:é|e)culos?\.?\s+(?!d\.?\s*C)([IVXLCDM]+)(?:\s*[–-]\s*([IVXLCDM]+))?\s*(a\.?\s*C\.?|d\.?\s*C\.?)?/gi,
  )) {
    hasCentury = true;
    const first = romanToInt(match[1]);
    const last = romanToInt(match[2] || match[1]);
    const eraText = fold(match[3] || "");
    const era =
      eraText.includes("a") ||
      (!eraText && normalized.includes("a.c") && !normalized.includes("d.c"))
        ? "bce"
        : "ce";
    const intervals = [centuryInterval(first, era), centuryInterval(last, era)];
    points.push(...intervals.flatMap((interval) => [interval.start, interval.end]));
  }

  for (const match of original.matchAll(
    /([IVXLCDM]+)(?:\s*[–-]\s*([IVXLCDM]+))?\s+mil(?:ê|e)nios?\s*(a\.?\s*C\.?|d\.?\s*C\.?)/gi,
  )) {
    hasMillennium = true;
    const first = romanToInt(match[1]);
    const last = romanToInt(match[2] || match[1]);
    const era = fold(match[3]).includes("a") ? "bce" : "ce";
    const intervals = [millenniumInterval(first, era), millenniumInterval(last, era)];
    points.push(...intervals.flatMap((interval) => [interval.start, interval.end]));
  }

  const masked = original
    .replace(/primeiros?\s+s(?:é|e)culos?\s+d\.?\s*C\.?/gi, "")
    .replace(
      /s(?:é|e)culos?\.?\s+(?!d\.?\s*C)[IVXLCDM]+(?:\s*[–-]\s*[IVXLCDM]+)?\s*(?:a\.?\s*C\.?|d\.?\s*C\.?)?/gi,
      "",
    )
    .replace(
      /[IVXLCDM]+(?:\s*[–-]\s*[IVXLCDM]+)?\s+mil(?:ê|e)nios?\s*(?:a\.?\s*C\.?|d\.?\s*C\.?)/gi,
      "",
    );
  const numericMatches = [...masked.matchAll(/\d{1,3}(?:\.\d{3})+|\d{4,6}|\d{1,3}/g)];
  const onlyBce = normalized.includes("a.c") && !normalized.includes("d.c");
  const onlyCe = normalized.includes("d.c") && !normalized.includes("a.c");
  const onlyBeforePresent =
    (normalized.includes("anos ap") || normalized.includes(" years bp")) && !onlyBce && !onlyCe;

  for (const match of numericMatches) {
    const raw = match[0];
    const number = Number(raw.replaceAll(".", ""));
    if (!Number.isFinite(number)) continue;
    const after = fold(masked.slice(match.index + raw.length, match.index + raw.length + 24));
    const before = fold(masked.slice(Math.max(0, match.index - 18), match.index));
    let sign = 1;
    if (onlyBeforePresent) {
      points.push(1950 - number);
      continue;
    }
    if (after.match(/(?:^|\W)a\.?\s*c\.?(?:\W|$)/)) sign = -1;
    else if (after.match(/(?:^|\W)d\.?\s*c\.?(?:\W|$)/)) sign = 1;
    else if (onlyBce) sign = -1;
    else if (onlyCe) sign = 1;
    else if (before.match(/(?:^|\W)a\.?\s*c\.?(?:\W|$)/)) sign = -1;
    points.push(number * sign);
  }

  let startYear = points.length ? Math.min(...points) : undefined;
  let endYear = points.length ? Math.max(...points) : undefined;
  const macroPeriodId = inferMacroPeriod(original, startYear);
  const macro = MACRO_PERIODS.find((period) => period.id === macroPeriodId);
  const notes = [];

  if (startYear === undefined) {
    if (normalized.includes("antiguidade tardia")) {
      startYear = -200;
      notes.push("Início associado apenas ao macroperíodo da Antiguidade tardia.");
    } else if (normalized.includes("medieval")) {
      startYear = 600;
      notes.push("Início associado apenas ao macroperíodo medieval.");
    } else {
      notes.push(
        "Sem data inicial convertível com segurança; não foi criada uma data de surgimento.",
      );
    }
  }
  if (isStillActive) {
    endYear = CURRENT_YEAR;
  } else if (endYear === undefined && startYear !== undefined) {
    endYear = macro?.end;
  }

  const temporalPrecision = hasCentury
    ? "century"
    : hasMillennium
      ? "macroperiod"
      : points.length && !normalized.includes("c.") && !normalized.includes("aprox")
        ? "exact"
        : points.length
          ? "approximate"
          : startYear !== undefined
            ? "macroperiod"
            : "unknown";
  const isApproximate =
    temporalPrecision !== "exact" ||
    normalized.includes("c.") ||
    normalized.includes("debat") ||
    normalized.includes("oral");

  if (isApproximate && !notes.length) {
    notes.push("Conversão aproximada; o texto original prevalece.");
  }

  let visibilityStartYear = startYear;
  let visibilityBasis = startYear !== undefined ? "parsed-attestation" : "present-only";
  const revivalWithoutLivingStatus = statusMarksRevival && !statusMarksLiving;
  const livingContinuityClaim =
    !revivalWithoutLivingStatus &&
    (statusMarksLiving ||
      normalized.includes("presente") ||
      normalized.includes("tradicao viva") ||
      normalized.includes("tradicoes vivas") ||
      normalized.includes("historicas e vivas"));

  if (visibilityStartYear === undefined && livingContinuityClaim) {
    if (normalized.includes("idade do bronze")) {
      visibilityStartYear = -3200;
      visibilityBasis = "macroperiod-bound";
      notes.push(
        "No Panorama, a tradição é mantida desde o limite amplo da Idade do Bronze informado pelo catálogo; isso não data sua origem.",
      );
    } else if (normalized.includes("periodo helenistico")) {
      visibilityStartYear = -323;
      visibilityBasis = "macroperiod-bound";
      notes.push(
        "No Panorama, a tradição é mantida desde o limite amplo do período helenístico informado pelo catálogo; isso não data sua origem.",
      );
    } else if (normalized.includes("primeiro milenio d.c")) {
      visibilityStartYear = 1;
      visibilityBasis = "macroperiod-bound";
      notes.push(
        "No Panorama, a tradição é mantida desde o limite amplo do primeiro milênio d.C.; isso não cria uma data de fundação.",
      );
    } else if (normalized.includes("pre-colonial")) {
      visibilityStartYear = PRECOLONIAL_VISIBILITY_FLOOR;
      visibilityBasis = "macroperiod-bound";
      notes.push(
        "No Panorama, 1450 funciona apenas como limite conservador para uma presença explicitamente pré-colonial; não é data de origem nem de primeira atestação.",
      );
    } else {
      visibilityStartYear = LIVING_DOCUMENTARY_FLOOR;
      visibilityBasis = "living-documentary-floor";
      notes.push(
        "No Panorama, 1800 é um piso documental conservador para impedir que uma tradição viva com início não convertível apareça somente no presente; não é data de origem, fundação ou primeira atestação.",
      );
    }
  }

  return {
    startYear,
    endYear,
    visibilityStartYear,
    visibilityBasis,
    temporalPrecision,
    temporalLabel: original,
    isApproximate,
    isStillActive,
    parsingNotes: notes.join(" "),
    macroPeriodId,
  };
}

function approximateLocations(region) {
  const normalized = fold(region);
  const parts = normalized.split(/[/;]/).map((part) => part.trim());
  const locations = [];
  for (const part of parts) {
    if (!part) continue;
    const anchor = REGION_ANCHORS.find(([name]) => part.includes(fold(name)));
    if (!anchor) continue;
    const [, latitude, longitude] = anchor;
    if (!locations.some((item) => item.latitude === latitude && item.longitude === longitude)) {
      locations.push({
        latitude,
        longitude,
        precision: "regional",
        label: text(region),
      });
    }
  }
  if (!locations.length) {
    const anchor = REGION_ANCHORS.find(([name]) => normalized.includes(fold(name)));
    if (anchor) {
      locations.push({
        latitude: anchor[1],
        longitude: anchor[2],
        precision: "regional",
        label: text(region),
      });
    }
  }
  return { location: locations[0], locations: locations.slice(0, 3) };
}

function normalizeGeography(id, distributionLabel) {
  const normalized = fold(distributionLabel);
  const hasGlobalReach = normalized.split(/[/;]/).some((part) => part.trim() === "global");
  const hasDiaspora = normalized.split(/[/;]/).some((part) => part.trim() === "diaspora");
  const catalogOrigins = text(distributionLabel)
    .split(/[/;]/)
    .map((part) => part.trim())
    .filter((part) => !["global", "diáspora", "diaspora"].includes(fold(part)));
  const override = ORIGIN_OVERRIDES.get(id);
  const region = override || catalogOrigins.join("/");
  if (!region) throw new Error(`${id}: alcance “${distributionLabel}” sem origem editorial`);

  const locationData = approximateLocations(region);
  if (!locationData.location) {
    throw new Error(`${id}: origem “${region}” sem âncora cartográfica controlada`);
  }
  const geographicReach = hasGlobalReach
    ? "global"
    : hasDiaspora
      ? "diasporic"
      : locationData.locations.length > 1
        ? "multi-regional"
        : "regional";
  return {
    region,
    distributionLabel: text(distributionLabel),
    geographicReach,
    originBasis: override ? "editorial-broad-region" : "catalog-region",
    ...locationData,
    isGlobal: hasGlobalReach,
  };
}

function correlationType(value) {
  const symbol = text(value).charAt(0);
  return (
    {
      "●": "direct",
      "≈": "partial",
      "◇": "impersonal",
      "?": "uncertain",
      "—": "absent",
      "-": "absent",
    }[symbol] ?? "uncertain"
  );
}

function sourceCodes(value) {
  return text(value)
    .split(/[;,]/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function nonEmptyLines(rows) {
  return rows.map((row) => row.map(text).filter(Boolean).join(" · ")).filter(Boolean);
}

const workbookBuffer = await readFile(WORKBOOK_PATH);
const workbookHash = createHash("sha256").update(workbookBuffer).digest("hex");
const sheets = await readXlsxFile(WORKBOOK_PATH);
const sheet = Object.fromEntries(sheets.map((entry) => [entry.sheet, entry.data]));

const requiredSheets = [
  "LEIA-ME",
  "Matriz global",
  "Catálogo",
  "Arquétipos",
  "Cronologia",
  "Fontes",
  "Revisões",
  "Aeons — autoral",
];
for (const required of requiredSheets) {
  if (!sheet[required]) throw new Error(`Aba obrigatória ausente: ${required}`);
}

const matrixRows = rowsAsObjects(sheet["Matriz global"], 4);
const catalogRows = rowsAsObjects(sheet.Catálogo, 4);
const archetypeRows = rowsAsObjects(sheet.Arquétipos, 4);
const chronologyRows = rowsAsObjects(sheet.Cronologia, 4);
const sourceRows = rowsAsObjects(sheet.Fontes, 4);
const revisionRows = rowsAsObjects(sheet.Revisões, 4);
const aeonRows = rowsAsObjects(sheet["Aeons — autoral"], 5);

const archetypes = archetypeRows.map((row) => ({
  code: text(row.Código),
  name: text(row["Função comparativa"]),
  inclusionCriteria: text(row["Critério de inclusão"]),
  avoidConfusion: text(row["Evitar / não confundir"]),
  totals: {
    direct: Number(row["●"] ?? 0),
    partial: Number(row["≈"] ?? 0),
    impersonal: Number(row["◇"] ?? 0),
    uncertain: Number(row["?"] ?? 0),
    absent: Number(row["—"] ?? 0),
  },
}));

const matrixById = new Map(matrixRows.map((row) => [text(row.ID), row]));
const traditions = catalogRows.map((catalog) => {
  const id = text(catalog.ID);
  const matrix = matrixById.get(id);
  if (!matrix) throw new Error(`Tradição ${id} ausente da Matriz global`);
  const correlations = Object.fromEntries(
    archetypes.map((archetype) => {
      const header = Object.keys(matrix).find((key) => key.startsWith(`${archetype.code} —`));
      const originalText = text(header ? matrix[header] : "");
      if (!originalText) throw new Error(`Correlação vazia: ${id} × ${archetype.code}`);
      return [
        archetype.code,
        {
          archetypeCode: archetype.code,
          type: correlationType(originalText),
          originalText,
          displayLabel: originalText.replace(/^[●≈◇?—-]\s*/, ""),
        },
      ];
    }),
  );
  const periodLabel = text(catalog["Período / atestação"]);
  const status = text(catalog.Status);
  const distributionLabel = text(catalog.Região);
  const geography = normalizeGeography(id, distributionLabel);
  return {
    id,
    name: text(catalog["Tradição / cosmovisão"]),
    family: text(catalog.Família),
    region: geography.region,
    periodLabel,
    type: text(catalog.Tipo),
    status,
    coverage: text(catalog.Cobertura),
    profileBase: text(catalog["Perfil-base"]),
    mappingScope: text(catalog["Escopo do mapeamento"]) || "Individualizado",
    individualizedCells: Number(catalog["Células individualizadas"] ?? 0),
    sourceCodes: sourceCodes(catalog.Fontes),
    scopeNote: text(catalog["Nota de escopo"]) || undefined,
    counts: {
      direct: Number(catalog["●"] ?? 0),
      partial: Number(catalog["≈"] ?? 0),
      impersonal: Number(catalog["◇"] ?? 0),
      uncertain: Number(catalog["?"] ?? 0),
      absent: Number(catalog["—"] ?? 0),
    },
    ...parseTemporal(periodLabel, status),
    ...geography,
    correlations,
  };
});

const chronology = chronologyRows.map((row, index) => ({
  id: MACRO_PERIODS[index]?.id ?? `period-${index + 1}`,
  name: text(row.Macroperíodo),
  intervalLabel: text(row["Intervalo aproximado"]),
  context: text(row["Contextos úteis"]),
  documentedChanges: text(row["Mudanças religiosas documentáveis"]),
  limitations: text(row["Limites da periodização"]),
  startYear: MACRO_PERIODS[index]?.start,
  endYear: MACRO_PERIODS[index]?.end,
}));

const sources = sourceRows.map((row) => ({
  code: text(row.Código),
  scope: text(row.Escopo),
  title: text(row["Título / recurso"]),
  institution: text(row.Instituição),
  url: text(row.URL) || undefined,
  usage: text(row["Uso nesta revisão"]),
}));

const revisions = revisionRows.map((row) => ({
  issue: text(row["Item original / problema"]),
  action: text(row.Ação),
  rationale: text(row["Justificativa historiográfica"]),
  destination: text(row["Onde consultar agora"]),
}));

const aeonPeriod = {
  "pre-historia": "prehistory",
  antiguidade: "bronze",
  "era axial": "iron",
  "era classica": "late-antiquity",
  "idade media": "medieval",
  "renascimento e iluminismo": "early-modern",
  "era moderna": "industrial",
};
const aeons = aeonRows.map((row) => ({
  aeon: text(row.AEON),
  quantity: Number(row.QUANTITAS ?? 0),
  era: text(row["ERA ASTROLÓGICA"]),
  astrologicalAeon: text(row["AEON ASTROLÓGICO"]),
  thelemicAeon: text(row["AEON TELEMITA"]),
  correspondences: text(row.CORRESPONDÊNCIAS),
  macroPeriodId: aeonPeriod[fold(row["ERA ASTROLÓGICA"])] ?? "contemporary",
  epistemicStatus: "Interpretação autoral / esotérica",
}));

if (archetypes.length !== 44)
  throw new Error(`Esperados 44 arquétipos; obtidos ${archetypes.length}`);
const correlationCount = traditions.reduce(
  (total, tradition) => total + Object.keys(tradition.correlations).length,
  0,
);
if (correlationCount !== traditions.length * archetypes.length) {
  throw new Error(
    `Matriz incompleta: ${correlationCount} correlações para ${traditions.length} × ${archetypes.length}`,
  );
}

const output = {
  metadata: {
    title: "RELIGIO MUNDI",
    subtitle: "Atlas Temporal das Religiões, Cosmovisões e Arquétipos Humanos",
    workbook: "UNO_reformulado.xlsx",
    workbookSha256: workbookHash,
    generatedAt: "2026-07-29",
    currentYear: CURRENT_YEAR,
    traditionCount: traditions.length,
    archetypeCount: archetypes.length,
    correlationCount,
    sourceCount: sources.length,
    locationMethod:
      "A origem regional é separada do alcance global/diaspórico. Coordenadas são âncoras amplas de navegação, não sítios precisos.",
  },
  methodology: nonEmptyLines(sheet["LEIA-ME"]),
  chronology,
  archetypes,
  traditions,
  sources,
  revisions,
  aeons,
};

await writeFile(OUTPUT_PATH, JSON.stringify(output));
console.log(
  JSON.stringify({
    output: path.relative(ROOT, OUTPUT_PATH),
    workbookSha256: workbookHash,
    traditions: traditions.length,
    archetypes: archetypes.length,
    correlations: correlationCount,
    sources: sources.length,
    located: traditions.filter((tradition) => tradition.location).length,
    transregionalOrDiasporic: traditions.filter(
      (tradition) => tradition.geographicReach !== "regional",
    ).length,
  }),
);
