import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { AtlasData } from "../types/atlas";
import { traditionIsVisible } from "../utils/temporal";

const data = JSON.parse(
  readFileSync(resolve("public/data/atlas.generated.json"), "utf8"),
) as AtlasData;

describe("integração da planilha canônica", () => {
  it("mantém as dimensões declaradas", () => {
    expect(data.traditions.length).toBeGreaterThanOrEqual(482);
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
    expect(byName.get("Jainismo Digambara")?.startYear).toBe(1);
    expect(byName.get("Jainismo Śvetāmbara")?.startYear).toBe(1);
    expect(byName.get("Igreja Católica")?.correlations.A23.originalText).toContain(
      "São Camilo de Lellis",
    );
    expect(byName.get("Igreja Católica")?.correlations.A34.originalText).toContain("Santa Cecília");
  });

  it("mantém as lacunas resolvidas com fonte, data e origem explícitas", () => {
    const expected = new Map([
      ["Ājīvika", -500],
      ["Brahmo Samaj", 1828],
      ["Arya Samaj", 1875],
      ["Navayāna/Budismo ambedkarista", 1956],
      ["Won Buddhism", 1916],
      ["Mahima Dharma", 1801],
      ["Radhasoami/Sant Mat moderno", 1861],
      ["Moorish Science Temple of America", 1920],
      ["Igreja Morávia/Unitas Fratrum", 1457],
      ["Exército de Salvação", 1865],
      ["Deísmo moderno", 1690],
    ]);
    const byName = new Map(data.traditions.map((tradition) => [tradition.name, tradition]));
    for (const [name, startYear] of expected) {
      const tradition = byName.get(name);
      expect(tradition, name).toBeDefined();
      expect(tradition?.startYear, name).toBe(startYear);
      expect(tradition?.sourceCodes.length, name).toBeGreaterThan(0);
      expect(tradition?.region, name).not.toBe("Global");
      expect(tradition?.location, name).toBeDefined();
    }
    expect(data.sources).toHaveLength(59);
  });

  it("preserva no panorama tradições orais vivas sem inventar data de emergência", () => {
    const byName = new Map(data.traditions.map((tradition) => [tradition.name, tradition]));
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
      const tradition = byName.get(name);
      expect(tradition, name).toBeDefined();
      expect(traditionIsVisible(tradition as NonNullable<typeof tradition>, 1900, "panorama")).toBe(
        true,
      );
      if (tradition?.visibilityBasis === "living-documentary-floor") {
        expect(tradition.startYear, name).toBeUndefined();
        expect(tradition.visibilityStartYear, name).toBe(1800);
        expect(traditionIsVisible(tradition, 1800, "emergences"), name).toBe(false);
      }
    }
    for (const name of ["Religião Guanche", "Religião núbia/kushita"]) {
      const tradition = byName.get(name);
      expect(tradition, name).toBeDefined();
      expect(traditionIsVisible(tradition as NonNullable<typeof tradition>, 1900, "panorama")).toBe(
        false,
      );
      expect(traditionIsVisible(tradition as NonNullable<typeof tradition>, 2026, "panorama")).toBe(
        false,
      );
    }
  });

  it("não despeja no presente tradições vivas com início documental desconhecido", () => {
    const livingUnknownStarts = data.traditions.filter(
      (tradition) =>
        tradition.status
          .toLocaleLowerCase("pt-BR")
          .split(/[/;,]/)
          .map((token) => token.trim())
          .includes("viva") && tradition.startYear === undefined,
    );
    expect(livingUnknownStarts.length).toBeGreaterThan(100);
    expect(
      livingUnknownStarts.every(
        (tradition) =>
          tradition.visibilityStartYear !== undefined && tradition.visibilityStartYear <= 1900,
      ),
    ).toBe(true);
  });

  it("não transforma revival moderno em continuidade ininterrupta do culto histórico", () => {
    const byName = new Map(data.traditions.map((tradition) => [tradition.name, tradition]));
    for (const name of [
      "Religião nórdica antiga",
      "Religião eslava pré-cristã",
      "Religiões bálticas históricas",
      "Gnosticismos da Antiguidade tardia",
      "Religião mexica",
      "Hermetic Order of the Golden Dawn",
    ]) {
      const tradition = byName.get(name);
      expect(tradition, name).toBeDefined();
      expect(traditionIsVisible(tradition as NonNullable<typeof tradition>, 2026, "panorama")).toBe(
        false,
      );
    }
    for (const name of ["Heathenry/Ásatrú", "Rodnovery", "Romuva"]) {
      const tradition = byName.get(name);
      expect(tradition, name).toBeDefined();
      expect(traditionIsVisible(tradition as NonNullable<typeof tradition>, 2026, "panorama")).toBe(
        true,
      );
    }
  });

  it("separa origem regional de alcance global ou diaspórico", () => {
    expect(data.traditions.every((tradition) => tradition.region !== "Global")).toBe(true);
    expect(data.traditions.every((tradition) => Boolean(tradition.location))).toBe(true);
    const catholic = data.traditions.find((tradition) => tradition.name === "Igreja Católica");
    expect(catholic?.region).toBe("Mediterrâneo/Europa");
    expect(catholic?.distributionLabel).toBe("Global");
    expect(catholic?.geographicReach).toBe("global");
    const yoruba = data.traditions.find((tradition) => tradition.name === "Religião Yorùbá e Ifá");
    expect(yoruba?.region).toBe("Nigéria/Benim");
    expect(yoruba?.geographicReach).toBe("diasporic");
  });
});
