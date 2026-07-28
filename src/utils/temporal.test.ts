import { describe, expect, it } from "vitest";
import type { Tradition } from "../types/atlas";
import { positionToYear, traditionIsVisible, yearToPosition } from "./temporal";

describe("escala temporal híbrida", () => {
  it.each([-100000, -3200, -1200, -200, 600, 1450, 1800, 1945, 2026])(
    "preserva o marco %i na ida e volta",
    (year) => {
      expect(positionToYear(yearToPosition(year))).toBe(year);
    },
  );

  it("dá espaço próprio a todas as oito faixas", () => {
    const positions = [-100000, -3200, -1200, -200, 600, 1450, 1800, 1945, 2026].map(
      yearToPosition,
    );
    expect(positions).toEqual([0, 180, 320, 430, 550, 670, 770, 870, 1000]);
  });
});

describe("visibilidade temporal", () => {
  const tradition = {
    startYear: -600,
    endYear: 300,
    temporalPrecision: "approximate",
  } as Tradition;

  it("usa o intervalo no modo panorama", () => {
    expect(traditionIsVisible(tradition, -400, "panorama")).toBe(true);
    expect(traditionIsVisible(tradition, 500, "panorama")).toBe(false);
  });

  it("usa a proximidade do início no modo emergências", () => {
    expect(traditionIsVisible(tradition, -500, "emergences")).toBe(true);
    expect(traditionIsVisible(tradition, 200, "emergences")).toBe(false);
  });
});
