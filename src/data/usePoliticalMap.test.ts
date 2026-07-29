import { describe, expect, it } from "vitest";
import type { PoliticalSnapshotIndex } from "../types/polities";
import { selectPoliticalSnapshot } from "./usePoliticalMap";

const snapshots: PoliticalSnapshotIndex[] = [-3000, -1500, 1200, 2010, 2026].map((year) => ({
  year,
  label: String(year),
  file: `${year}.json`,
  featureCount: 1,
  source: year === 2026 ? "natural-earth" : "historical-basemaps",
  precision: year === 2026 ? "contemporary-reference" : "varies",
}));

describe("seleção do recorte cartográfico", () => {
  it("usa o último snapshot não posterior ao ano observado", () => {
    expect(selectPoliticalSnapshot(snapshots, 1210)?.year).toBe(1200);
    expect(selectPoliticalSnapshot(snapshots, 2025)?.year).toBe(2010);
    expect(selectPoliticalSnapshot(snapshots, 2026)?.year).toBe(2026);
  });

  it("não projeta um mapa posterior sobre períodos sem cobertura", () => {
    expect(selectPoliticalSnapshot(snapshots, -4000)).toBeUndefined();
  });
});
