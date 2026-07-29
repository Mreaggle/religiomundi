import { beforeAll, describe, expect, it } from "vitest";
import type { AtlasData } from "../types/atlas";
import { LINEAGE_GROUPS, LINEAGE_RELATIONS } from "./lineage";

let data: AtlasData;

beforeAll(async () => {
  data = (await import("../../public/data/atlas.generated.json")).default as AtlasData;
});

describe("relações da árvore", () => {
  it("referencia somente tradições existentes no catálogo", () => {
    const names = new Set(data.traditions.map((tradition) => tradition.name));
    for (const group of LINEAGE_GROUPS) {
      expect(names.has(group.root), group.root).toBe(true);
      for (const child of group.children) expect(names.has(child), child).toBe(true);
    }
    for (const relation of LINEAGE_RELATIONS) {
      expect(names.has(relation.from), relation.from).toBe(true);
      expect(names.has(relation.to), relation.to).toBe(true);
    }
  });

  it("separa hipóteses e fornece referência acadêmica externa", () => {
    const hypotheses = LINEAGE_RELATIONS.filter((relation) => relation.kind === "hypothesis");
    expect(hypotheses.length).toBeGreaterThan(0);
    for (const relation of hypotheses) {
      expect(relation.sourceUrls?.length, `${relation.from} → ${relation.to}`).toBeGreaterThan(0);
      expect(relation.note.length).toBeGreaterThan(30);
    }
  });

  it("separa sincretismos documentados e exige referência externa", () => {
    const syncretisms = LINEAGE_RELATIONS.filter((relation) => relation.kind === "syncretism");
    expect(syncretisms.length).toBeGreaterThanOrEqual(8);
    for (const relation of syncretisms) {
      expect(relation.sourceUrls?.length, `${relation.from} → ${relation.to}`).toBeGreaterThan(0);
      expect(relation.note.length).toBeGreaterThan(60);
    }
  });

  it("não duplica pares nem inverte a anterioridade catalogada", () => {
    const seen = new Set<string>();
    const traditions = new Map(data.traditions.map((tradition) => [tradition.name, tradition]));
    for (const relation of LINEAGE_RELATIONS) {
      const key = `${relation.from}→${relation.to}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
      const source = traditions.get(relation.from);
      const target = traditions.get(relation.to);
      if (source?.startYear !== undefined && target?.startYear !== undefined) {
        expect(source.startYear, key).toBeLessThanOrEqual(target.startYear);
      }
    }
  });
});
