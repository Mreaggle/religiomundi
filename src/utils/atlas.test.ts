import { describe, expect, it } from "vitest";
import type { Archetype, Tradition } from "../types/atlas";
import { clusterTraditions, functionalSimilarity, traditionSearchText } from "./atlas";

const archetype = {
  code: "A07",
  name: "Sol / luz",
} as Archetype;

function tradition(id: string, direct: boolean): Tradition {
  return {
    id,
    name: id === "T001" ? "Tradição Š" : "Outra",
    family: "Família",
    region: "Mesopotâmia",
    distributionLabel: "Mesopotâmia",
    geographicReach: "regional",
    originBasis: "catalog-region",
    periodLabel: "c. 100 a.C.",
    type: "Histórica",
    status: "Histórica",
    coverage: "Detalhado",
    profileBase: "",
    mappingScope: "Individualizado",
    individualizedCells: 1,
    sourceCodes: ["A01"],
    counts: { direct: 1, partial: 0, impersonal: 0, uncertain: 0, absent: 43 },
    temporalPrecision: "approximate",
    temporalLabel: "c. 100 a.C.",
    isApproximate: true,
    isStillActive: false,
    parsingNotes: "",
    macroPeriodId: "iron",
    location: { latitude: 33, longitude: 44, precision: "regional", label: "Mesopotâmia" },
    locations: [],
    isGlobal: false,
    correlations: {
      A07: {
        archetypeCode: "A07",
        type: direct ? "direct" : "absent",
        originalText: direct ? "● Šamaš — luz e justiça" : "— Sem correlato documentado",
        displayLabel: direct ? "Šamaš — luz e justiça" : "Sem correlato documentado",
      },
    },
  } as Tradition;
}

describe("operações do atlas", () => {
  it("preserva diacríticos no texto pesquisável", () => {
    const searchable = traditionSearchText(tradition("T001", true), [archetype]);
    expect(searchable).toContain("samas");
    expect(searchable).toContain("tradicao s");
  });

  it("agrupa marcadores pela mesma região aproximada", () => {
    expect(clusterTraditions([tradition("T001", true), tradition("T002", false)])).toHaveLength(1);
  });

  it("calcula proximidade funcional sem afirmar equivalência", () => {
    expect(functionalSimilarity(tradition("T001", true), tradition("T002", true))).toBe(1);
    expect(functionalSimilarity(tradition("T001", true), tradition("T002", false))).toBe(0);
  });
});
