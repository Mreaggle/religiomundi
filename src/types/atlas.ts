export type CorrelationType = "direct" | "partial" | "impersonal" | "uncertain" | "absent";
export type TemporalPrecision = "exact" | "approximate" | "century" | "macroperiod" | "unknown";
export type TemporalMode = "panorama" | "emergences" | "catalog";
export type ViewMode =
  | "constellation"
  | "map"
  | "tree"
  | "charts"
  | "matrix"
  | "signatures"
  | "sources";

export interface Correlation {
  archetypeCode: string;
  type: CorrelationType;
  originalText: string;
  displayLabel: string;
}

export interface RegionalLocation {
  latitude: number;
  longitude: number;
  precision: "regional";
  label: string;
}

export interface Tradition {
  id: string;
  name: string;
  family: string;
  region: string;
  distributionLabel: string;
  geographicReach: "regional" | "multi-regional" | "diasporic" | "global";
  originBasis: "catalog-region" | "editorial-broad-region";
  periodLabel: string;
  type: string;
  status: string;
  coverage: string;
  profileBase: string;
  mappingScope: string;
  individualizedCells: number;
  sourceCodes: string[];
  scopeNote?: string;
  counts: Record<CorrelationType, number>;
  startYear?: number;
  endYear?: number;
  temporalPrecision: TemporalPrecision;
  temporalLabel: string;
  isApproximate: boolean;
  isStillActive: boolean;
  parsingNotes: string;
  macroPeriodId: string;
  location?: RegionalLocation;
  locations: RegionalLocation[];
  isGlobal: boolean;
  correlations: Record<string, Correlation>;
}

export interface Archetype {
  code: string;
  name: string;
  inclusionCriteria: string;
  avoidConfusion: string;
  totals: Record<CorrelationType, number>;
}

export interface Source {
  code: string;
  scope: string;
  title: string;
  institution: string;
  url?: string;
  usage: string;
}

export interface ChronologyPeriod {
  id: string;
  name: string;
  intervalLabel: string;
  context: string;
  documentedChanges: string;
  limitations: string;
  startYear: number;
  endYear: number;
}

export interface Aeon {
  aeon: string;
  quantity: number;
  era: string;
  astrologicalAeon: string;
  thelemicAeon: string;
  correspondences: string;
  macroPeriodId: string;
  epistemicStatus: string;
}

export interface AtlasData {
  metadata: {
    title: string;
    subtitle: string;
    workbook: string;
    workbookSha256: string;
    generatedAt: string;
    currentYear: number;
    traditionCount: number;
    archetypeCount: number;
    correlationCount: number;
    sourceCount: number;
    locationMethod: string;
  };
  methodology: string[];
  chronology: ChronologyPeriod[];
  archetypes: Archetype[];
  traditions: Tradition[];
  sources: Source[];
  revisions: Array<{
    issue: string;
    action: string;
    rationale: string;
    destination: string;
  }>;
  aeons: Aeon[];
}

export interface AtlasFilters {
  query: string;
  family: string;
  region: string;
  type: string;
  status: string;
  coverage: string;
  macroPeriod: string;
  archetypeCode: string;
  correlationType: CorrelationType | "";
  sourceCode: string;
  statusFlag: "" | "historical" | "living" | "revival" | "archaeological" | "fragmentary";
}

export interface TraditionCluster {
  key: string;
  label: string;
  traditions: Tradition[];
  latitude?: number;
  longitude?: number;
  isGlobal: boolean;
  coverage: string;
  predominantPeriod: string;
}
