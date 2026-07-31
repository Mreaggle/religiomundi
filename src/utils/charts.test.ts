import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { AtlasData } from "../types/atlas";
import { buildChartStats } from "./charts";

const data = JSON.parse(
  readFileSync(resolve("public/data/atlas.generated.json"), "utf8"),
) as AtlasData;

describe("charts comparativos provocativos", () => {
  const stats = buildChartStats(data.traditions, data.archetypes);
  const byId = new Map(data.traditions.map((tradition) => [tradition.id, tradition]));

  it("mantém rankings curtos, ordenados e determinísticos", () => {
    const rankings = [
      stats.dense,
      stats.uncertainTraditions,
      stats.impersonalTraditions,
      stats.nonSovereignDense,
      stats.familyReach,
      stats.familySize,
      stats.editorialDebt,
      stats.contestedArchetypes,
      stats.absentArchetypes,
      stats.rareArchetypes,
      stats.crossFamilyArchetypes,
      stats.sourceRichTraditions,
      stats.surprisingPairs,
    ];
    expect(rankings.every((ranking) => ranking.length <= 10)).toBe(true);
    expect(buildChartStats(data.traditions, data.archetypes)).toEqual(stats);
  });

  it("não transforma ausência de A03 em afirmação teológica", () => {
    for (const item of stats.nonSovereignDense) {
      expect(byId.get(item.id)?.correlations.A03.type).toBe("absent");
      expect(item.detail).toContain("A03 ausente nesta matriz");
    }
  });

  it("compara apenas pares de famílias diferentes e com sobreposição suficiente", () => {
    expect(stats.surprisingPairs.length).toBeGreaterThan(0);
    for (const pair of stats.surprisingPairs) {
      const [leftId, rightId] = pair.id.split(":");
      const left = byId.get(leftId);
      const right = byId.get(rightId);
      expect(left?.family).not.toBe(right?.family);
      expect(left?.mappingScope).toBe("Individualizado");
      expect(right?.mappingScope).toBe("Individualizado");
      expect(pair.detail).toMatch(/\d+ funções compartilhadas/);
      expect(pair.value).toBeGreaterThanOrEqual(20);
    }
  });

  it("expõe dívida editorial sem chamar perfil familiar de fato individual", () => {
    expect(stats.editorialDebt.length).toBeGreaterThan(0);
    expect(stats.editorialDebt.every((item) => item.detail.includes("perfil familiar"))).toBe(true);
  });
});
