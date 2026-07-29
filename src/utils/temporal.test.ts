import { describe, expect, it } from "vitest";
import type { Tradition } from "../types/atlas";
import { positionToYear, traditionIsVisible, yearToPosition } from "./temporal";

describe("escala temporal híbrida", () => {
  it.each([-180000, -100000, -3200, -1200, -200, 600, 1450, 1800, 1945, 2026])(
    "preserva o marco %i na ida e volta",
    (year) => {
      expect(positionToYear(yearToPosition(year))).toBe(year);
    },
  );

  it("dá espaço próprio a todas as nove faixas", () => {
    const positions = [-180000, -100000, -3200, -1200, -200, 600, 1450, 1800, 1945, 2026].map(
      yearToPosition,
    );
    expect(positions).toEqual([0, 70, 180, 320, 430, 550, 670, 770, 870, 1000]);
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

  it("expõe o catálogo integral sem apagar a data documentada", () => {
    expect(traditionIsVisible(tradition, 2026, "catalog")).toBe(true);
  });

  it("não inventa início antigo para tradição viva com data desconhecida", () => {
    const unknown = {
      endYear: 2026,
      isStillActive: true,
      temporalPrecision: "unknown",
    } as Tradition;
    expect(traditionIsVisible(unknown, -3200, "panorama")).toBe(false);
    expect(traditionIsVisible(unknown, 2026, "panorama")).toBe(true);
    expect(traditionIsVisible(unknown, 2026, "emergences")).toBe(false);
  });
});
