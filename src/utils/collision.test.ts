import { describe, expect, it } from "vitest";
import { selectCollisionFreeLabels, semanticZoomScale } from "./collision";

describe("seleção de rótulos sem colisão", () => {
  const candidates = [
    { key: "large", x: 100, y: 100, label: "Região dominante", priority: 12 },
    { key: "small", x: 135, y: 101, label: "Vizinha", priority: 2 },
    { key: "far", x: 260, y: 100, label: "Distante", priority: 1 },
  ];

  it("preserva o agrupamento prioritário e remove o rótulo sobreposto", () => {
    expect([...selectCollisionFreeLabels(candidates, 1)]).toEqual(["large", "far"]);
  });

  it("revela mais rótulos quando o zoom aumenta a distância visual", () => {
    expect(selectCollisionFreeLabels(candidates, 8)).toEqual(new Set(["large", "small", "far"]));
  });

  it("aumenta progressivamente o texto sem deixá-lo crescer na mesma razão do mapa", () => {
    expect(semanticZoomScale(1)).toBe(1);
    expect(semanticZoomScale(4)).toBe(0.5);
    expect(semanticZoomScale(9)).toBeCloseTo(1 / 3);
  });
});
