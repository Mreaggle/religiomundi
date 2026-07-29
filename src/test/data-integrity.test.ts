import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { AtlasData } from "../types/atlas";

const data = JSON.parse(
  readFileSync(resolve("public/data/atlas.generated.json"), "utf8"),
) as AtlasData;

describe("integração da planilha canônica", () => {
  it("mantém as dimensões declaradas", () => {
    expect(data.traditions.length).toBeGreaterThanOrEqual(470);
    expect(data.archetypes).toHaveLength(44);
    expect(data.sources.length).toBeGreaterThanOrEqual(44);
    expect(data.metadata.traditionCount).toBe(data.traditions.length);
    expect(data.metadata.archetypeCount).toBe(data.archetypes.length);
    expect(
      data.traditions.reduce(
        (total, tradition) => total + Object.keys(tradition.correlations).length,
        0,
      ),
    ).toBe(data.traditions.length * data.archetypes.length);
  });

  it("mantém todos os símbolos de correlação classificáveis", () => {
    const types = new Set(
      data.traditions.flatMap((tradition) =>
        Object.values(tradition.correlations).map((correlation) => correlation.type),
      ),
    );
    expect(types).toEqual(new Set(["direct", "partial", "impersonal", "uncertain", "absent"]));
  });

  it("mantém os códigos e posições de A01 a A44", () => {
    expect(data.archetypes.map((item) => item.code)).toEqual(
      Array.from({ length: 44 }, (_, index) => `A${String(index + 1).padStart(2, "0")}`),
    );
  });

  it("preserva a camada autoral separada", () => {
    expect(data.aeons.length).toBeGreaterThan(0);
    expect(data.aeons.every((item) => item.epistemicStatus.includes("autoral"))).toBe(true);
  });

  it("não replica fichas integrais entre tradições distintas", () => {
    const signatures = data.traditions.map((tradition) =>
      JSON.stringify(
        data.archetypes.map((archetype) => tradition.correlations[archetype.code].originalText),
      ),
    );
    expect(new Set(signatures).size).toBe(signatures.length);
  });

  it("preserva datas modernas e patronatos católicos auditados", () => {
    const byName = new Map(data.traditions.map((tradition) => [tradition.name, tradition]));
    expect(byName.get("Hermetic Order of the Golden Dawn")?.startYear).toBe(1888);
    expect(byName.get("Romuva")?.startYear).toBe(1967);
    expect(byName.get("Rodnovery")?.startYear).toBe(1980);
    expect(byName.get("Igreja Católica")?.correlations.A23.originalText).toContain(
      "São Camilo de Lellis",
    );
    expect(byName.get("Igreja Católica")?.correlations.A34.originalText).toContain("Santa Cecília");
  });
});
