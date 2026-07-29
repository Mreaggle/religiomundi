import { describe, expect, it } from "vitest";
import { RELIGIOUS_POPULATION_GROUPS, RELIGIOUS_POPULATION_SOURCE } from "./religiousPopulation";

describe("ranking demográfico religioso", () => {
  it("preserva a série global de 2020, ordenada e completa", () => {
    expect(RELIGIOUS_POPULATION_SOURCE.estimateYear).toBe(2020);
    expect(RELIGIOUS_POPULATION_GROUPS).toHaveLength(7);
    expect(RELIGIOUS_POPULATION_GROUPS.reduce((sum, item) => sum + item.share, 0)).toBeCloseTo(
      100,
      5,
    );
    expect(RELIGIOUS_POPULATION_GROUPS.map((item) => item.share)).toEqual(
      [...RELIGIOUS_POPULATION_GROUPS].map((item) => item.share).sort((a, b) => b - a),
    );
  });

  it("não apresenta sem-filiação como religião", () => {
    expect(RELIGIOUS_POPULATION_GROUPS.find((item) => item.id === "unaffiliated")?.isReligion).toBe(
      false,
    );
  });
});
