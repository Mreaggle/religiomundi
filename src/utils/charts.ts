import type { Archetype, CorrelationType, Tradition } from "../types/atlas";

const ACTIVE_TYPES: CorrelationType[] = ["direct", "partial", "impersonal", "uncertain"];
const SIMILARITY_WEIGHT: Record<CorrelationType, number> = {
  direct: 1,
  partial: 0.78,
  impersonal: 0.82,
  uncertain: 0.25,
  absent: 0,
};

export interface RankedDatum {
  id: string;
  label: string;
  value: number;
  detail: string;
  target?: { type: "tradition" | "archetype"; id: string };
}

export interface ArchetypeChartDatum extends Archetype {
  counts: Record<CorrelationType, number>;
  total: number;
}

export interface ChartStats {
  dense: RankedDatum[];
  uncertainTraditions: RankedDatum[];
  impersonalTraditions: RankedDatum[];
  nonSovereignDense: RankedDatum[];
  familyReach: RankedDatum[];
  familySize: RankedDatum[];
  editorialDebt: RankedDatum[];
  contestedArchetypes: RankedDatum[];
  absentArchetypes: RankedDatum[];
  rareArchetypes: RankedDatum[];
  crossFamilyArchetypes: RankedDatum[];
  sourceRichTraditions: RankedDatum[];
  surprisingPairs: RankedDatum[];
  archetypes: ArchetypeChartDatum[];
}

function supportedCount(tradition: Tradition): number {
  return tradition.counts.direct + tradition.counts.partial + tradition.counts.impersonal;
}

function activeCount(tradition: Tradition): number {
  return supportedCount(tradition) + tradition.counts.uncertain;
}

function top(items: RankedDatum[], direction: "asc" | "desc" = "desc"): RankedDatum[] {
  return items
    .sort(
      (a, b) =>
        (direction === "desc" ? b.value - a.value : a.value - b.value) ||
        a.label.localeCompare(b.label, "pt-BR"),
    )
    .slice(0, 10);
}

function archetypeCounts(
  traditions: Tradition[],
  archetype: Archetype,
): Record<CorrelationType, number> {
  const counts: Record<CorrelationType, number> = {
    direct: 0,
    partial: 0,
    impersonal: 0,
    uncertain: 0,
    absent: 0,
  };
  for (const tradition of traditions) {
    const type = tradition.correlations[archetype.code]?.type;
    if (type) counts[type] += 1;
  }
  return counts;
}

function functionalSimilarity(left: Tradition, right: Tradition, archetypes: Archetype[]) {
  let intersection = 0;
  let union = 0;
  let shared = 0;
  for (const archetype of archetypes) {
    const leftType = left.correlations[archetype.code]?.type ?? "absent";
    const rightType = right.correlations[archetype.code]?.type ?? "absent";
    const leftWeight = SIMILARITY_WEIGHT[leftType];
    const rightWeight = SIMILARITY_WEIGHT[rightType];
    intersection += Math.min(leftWeight, rightWeight);
    union += Math.max(leftWeight, rightWeight);
    if (leftType !== "absent" && rightType !== "absent") shared += 1;
  }
  return {
    score: union ? Math.round((intersection / union) * 100) : 0,
    shared,
  };
}

function surprisingPairs(traditions: Tradition[], archetypes: Archetype[]): RankedDatum[] {
  const candidates = traditions.filter(
    (tradition) =>
      supportedCount(tradition) >= 6 &&
      tradition.mappingScope === "Individualizado" &&
      !/(visão agregada|perfil agregado|categoria descentralizada|campo agregado)/i.test(
        tradition.name,
      ),
  );
  const pairs: RankedDatum[] = [];
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    const left = candidates[leftIndex];
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      const right = candidates[rightIndex];
      if (left.family === right.family) continue;
      const similarity = functionalSimilarity(left, right, archetypes);
      if (similarity.shared < 5 || similarity.score < 20) continue;
      pairs.push({
        id: `${left.id}:${right.id}`,
        label: `${left.name} × ${right.name}`,
        value: similarity.score,
        detail: `${similarity.shared} funções compartilhadas · ${left.family} / ${right.family}`,
      });
    }
  }
  return top(pairs);
}

export function buildChartStats(traditions: Tradition[], archetypes: Archetype[]): ChartStats {
  const archetypeData = archetypes.map((archetype) => {
    const counts = archetypeCounts(traditions, archetype);
    return {
      ...archetype,
      counts,
      total: ACTIVE_TYPES.reduce((sum, type) => sum + counts[type], 0),
    };
  });

  const families = new Map<
    string,
    {
      traditions: number;
      regions: Set<string>;
      sourceCodes: Set<string>;
      provisionalCells: number;
    }
  >();
  for (const tradition of traditions) {
    const current = families.get(tradition.family) ?? {
      traditions: 0,
      regions: new Set<string>(),
      sourceCodes: new Set<string>(),
      provisionalCells: 0,
    };
    current.traditions += 1;
    current.regions.add(tradition.region);
    tradition.sourceCodes.forEach((code) => {
      current.sourceCodes.add(code);
    });
    if (tradition.mappingScope === "Perfil de família auditável") {
      current.provisionalCells += archetypes.length - tradition.individualizedCells;
    }
    families.set(tradition.family, current);
  }

  return {
    dense: top(
      traditions
        .map((tradition) => ({
          id: tradition.id,
          label: tradition.name,
          value: supportedCount(tradition),
          detail: `${tradition.coverage} · ${tradition.family}`,
          target: { type: "tradition" as const, id: tradition.id },
        }))
        .filter((item) => item.value > 0),
    ),
    uncertainTraditions: top(
      traditions
        .filter(
          (tradition) =>
            tradition.counts.uncertain > 0 &&
            tradition.individualizedCells > 0 &&
            tradition.coverage.toLocaleLowerCase("pt-BR").includes("detalhado"),
        )
        .map((tradition) => ({
          id: tradition.id,
          label: tradition.name,
          value: tradition.counts.uncertain,
          detail: `${tradition.individualizedCells} células individualizadas · ${tradition.coverage}`,
          target: { type: "tradition" as const, id: tradition.id },
        })),
    ),
    impersonalTraditions: top(
      traditions
        .filter((tradition) => tradition.counts.impersonal > 0)
        .map((tradition) => ({
          id: tradition.id,
          label: tradition.name,
          value: tradition.counts.impersonal,
          detail: `${supportedCount(tradition)} funções sustentadas · ${tradition.family}`,
          target: { type: "tradition" as const, id: tradition.id },
        })),
    ),
    nonSovereignDense: top(
      traditions
        .filter(
          (tradition) =>
            tradition.correlations.A03?.type === "absent" && supportedCount(tradition) >= 6,
        )
        .map((tradition) => ({
          id: tradition.id,
          label: tradition.name,
          value: supportedCount(tradition),
          detail: `A03 ausente nesta matriz · ${tradition.family}`,
          target: { type: "tradition" as const, id: tradition.id },
        })),
    ),
    familyReach: top(
      [...families.entries()].map(([label, item]) => ({
        id: label,
        label,
        value: item.regions.size,
        detail: `${item.traditions} tradições catalogadas no recorte`,
      })),
    ),
    familySize: top(
      [...families.entries()].map(([label, item]) => ({
        id: label,
        label,
        value: item.traditions,
        detail: `${item.regions.size} regiões · granularidade editorial, não população`,
      })),
    ),
    editorialDebt: top(
      [...families.entries()]
        .filter(([, item]) => item.provisionalCells > 0)
        .map(([label, item]) => ({
          id: label,
          label,
          value: item.provisionalCells,
          detail: `${item.traditions} tradições · células ainda dependentes de perfil familiar`,
        })),
    ),
    contestedArchetypes: top(
      archetypeData
        .filter((archetype) => archetype.counts.uncertain > 0)
        .map((archetype) => ({
          id: archetype.code,
          label: `${archetype.code} — ${archetype.name}`,
          value: archetype.counts.uncertain,
          detail: `${Math.round((archetype.counts.uncertain / Math.max(1, archetype.total)) * 100)}% das ocorrências não ausentes`,
          target: { type: "archetype" as const, id: archetype.code },
        })),
    ),
    absentArchetypes: top(
      archetypeData.map((archetype) => ({
        id: archetype.code,
        label: `${archetype.code} — ${archetype.name}`,
        value: archetype.counts.absent,
        detail: `${archetype.total} classificações não ausentes no recorte`,
        target: { type: "archetype" as const, id: archetype.code },
      })),
    ),
    rareArchetypes: top(
      archetypeData
        .filter((archetype) => archetype.total > 0)
        .map((archetype) => ({
          id: archetype.code,
          label: `${archetype.code} — ${archetype.name}`,
          value: archetype.total,
          detail: `${archetype.counts.direct} diretas · ${archetype.counts.uncertain} incertas`,
          target: { type: "archetype" as const, id: archetype.code },
        })),
      "asc",
    ),
    crossFamilyArchetypes: top(
      archetypeData.map((archetype) => {
        const representedFamilies = new Set(
          traditions
            .filter((tradition) => tradition.correlations[archetype.code]?.type !== "absent")
            .map((tradition) => tradition.family),
        );
        return {
          id: archetype.code,
          label: `${archetype.code} — ${archetype.name}`,
          value: representedFamilies.size,
          detail: `${archetype.total} ocorrências classificadas`,
          target: { type: "archetype" as const, id: archetype.code },
        };
      }),
    ),
    sourceRichTraditions: top(
      traditions.map((tradition) => ({
        id: tradition.id,
        label: tradition.name,
        value: tradition.sourceCodes.length,
        detail: `${tradition.coverage} · ${activeCount(tradition)} células não ausentes`,
        target: { type: "tradition" as const, id: tradition.id },
      })),
    ),
    surprisingPairs: surprisingPairs(traditions, archetypes),
    archetypes: archetypeData.sort((a, b) => b.total - a.total).slice(0, 12),
  };
}
