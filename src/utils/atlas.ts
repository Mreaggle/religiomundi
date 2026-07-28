import type {
  Archetype,
  AtlasFilters,
  CorrelationType,
  Tradition,
  TraditionCluster,
} from "../types/atlas";
import { foldText } from "./text";

export const CORRELATION_META: Record<
  CorrelationType,
  { symbol: string; label: string; color: string }
> = {
  direct: { symbol: "●", label: "Direto / central", color: "#d59a4a" },
  partial: { symbol: "≈", label: "Parcial / variante", color: "#c9ad78" },
  impersonal: { symbol: "◇", label: "Princípio impessoal", color: "#57c8d4" },
  uncertain: { symbol: "?", label: "Hipótese / documentação insuficiente", color: "#8f3d37" },
  absent: { symbol: "—", label: "Sem correlato documentado", color: "#718091" },
};

export const EMPTY_FILTERS: AtlasFilters = {
  query: "",
  family: "",
  region: "",
  type: "",
  status: "",
  coverage: "",
  macroPeriod: "",
  archetypeCode: "",
  correlationType: "",
  sourceCode: "",
  statusFlag: "",
};

export function traditionSearchText(tradition: Tradition, archetypes: Archetype[]): string {
  return foldText(
    [
      tradition.id,
      tradition.name,
      tradition.family,
      tradition.region,
      tradition.periodLabel,
      tradition.type,
      tradition.status,
      tradition.coverage,
      tradition.sourceCodes.join(" "),
      tradition.scopeNote ?? "",
      ...archetypes.flatMap((archetype) => [
        archetype.code,
        archetype.name,
        tradition.correlations[archetype.code]?.originalText ?? "",
      ]),
    ].join(" "),
  );
}

export function matchesFilters(
  tradition: Tradition,
  filters: AtlasFilters,
  archetypes: Archetype[],
  searchCache: Map<string, string>,
): boolean {
  if (filters.query) {
    let searchable = searchCache.get(tradition.id);
    if (!searchable) {
      searchable = traditionSearchText(tradition, archetypes);
      searchCache.set(tradition.id, searchable);
    }
    if (!searchable.includes(foldText(filters.query))) return false;
  }
  if (filters.family && tradition.family !== filters.family) return false;
  if (filters.region && tradition.region !== filters.region) return false;
  if (filters.type && tradition.type !== filters.type) return false;
  if (filters.status && tradition.status !== filters.status) return false;
  if (filters.coverage && tradition.coverage !== filters.coverage) return false;
  if (filters.macroPeriod && tradition.macroPeriodId !== filters.macroPeriod) return false;
  if (filters.sourceCode && !tradition.sourceCodes.includes(filters.sourceCode)) return false;
  if (filters.archetypeCode) {
    const correlation = tradition.correlations[filters.archetypeCode];
    if (!correlation) return false;
    if (filters.correlationType && correlation.type !== filters.correlationType) return false;
    if (!filters.correlationType && correlation.type === "absent") return false;
  } else if (
    filters.correlationType &&
    !Object.values(tradition.correlations).some(
      (correlation) => correlation.type === filters.correlationType,
    )
  ) {
    return false;
  }
  const status = foldText(`${tradition.status} ${tradition.type} ${tradition.coverage}`);
  if (filters.statusFlag === "historical" && !status.includes("histor")) return false;
  if (filters.statusFlag === "living" && !status.includes("viva")) return false;
  if (filters.statusFlag === "revival" && !status.includes("revival")) return false;
  if (filters.statusFlag === "archaeological" && !status.includes("arqueol")) return false;
  if (filters.statusFlag === "fragmentary" && !status.includes("fragment")) return false;
  return true;
}

function dominant(values: string[]): string {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

export function clusterTraditions(traditions: Tradition[]): TraditionCluster[] {
  const grouped = new Map<string, Tradition[]>();
  for (const tradition of traditions) {
    const key =
      tradition.isGlobal && !tradition.location
        ? "global"
        : tradition.location
          ? `${Math.round(tradition.location.latitude / 5) * 5}:${
              Math.round(tradition.location.longitude / 5) * 5
            }`
          : `unlocated:${tradition.region}`;
    const group = grouped.get(key) ?? [];
    group.push(tradition);
    grouped.set(key, group);
  }
  return [...grouped.entries()].map(([key, items]) => ({
    key,
    label: key === "global" ? "Global / diásporas" : dominant(items.map((item) => item.region)),
    traditions: items,
    latitude: items.find((item) => item.location)?.location?.latitude,
    longitude: items.find((item) => item.location)?.location?.longitude,
    isGlobal: key === "global",
    coverage: dominant(items.map((item) => item.coverage)),
    predominantPeriod: dominant(items.map((item) => item.macroPeriodId)),
  }));
}

export function countByCorrelation(
  traditions: Tradition[],
  archetypeCode: string,
): Record<CorrelationType, number> {
  const counts: Record<CorrelationType, number> = {
    direct: 0,
    partial: 0,
    impersonal: 0,
    uncertain: 0,
    absent: 0,
  };
  for (const tradition of traditions) {
    const correlation = tradition.correlations[archetypeCode];
    if (correlation) counts[correlation.type] += 1;
  }
  return counts;
}

export function activeCorrelationCount(tradition: Tradition): number {
  return Object.values(tradition.correlations).filter(
    (correlation) => correlation.type !== "absent",
  ).length;
}

export function functionalSimilarity(a: Tradition, b: Tradition): number {
  const codes = Object.keys(a.correlations);
  let intersection = 0;
  let union = 0;
  for (const code of codes) {
    const aActive = a.correlations[code].type !== "absent";
    const bActive = b.correlations[code].type !== "absent";
    if (aActive || bActive) union += 1;
    if (aActive && bActive) intersection += 1;
  }
  return union ? intersection / union : 0;
}
