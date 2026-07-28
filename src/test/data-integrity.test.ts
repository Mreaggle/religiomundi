import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { AtlasData } from "../types/atlas";

const data = JSON.parse(
  readFileSync(resolve("public/data/atlas.generated.json"), "utf8"),
) as AtlasData;

describe("integração da planilha canônica", () => {
  it("mantém as dimensões declaradas", () => {
    expect(data.traditions).toHaveLength(460);
    expect(data.archetypes).toHaveLength(44);
    expect(data.sources).toHaveLength(32);
    expect(
      data.traditions.reduce(
        (total, tradition) => total + Object.keys(tradition.correlations).length,
        0,
      ),
    ).toBe(20240);
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
});
