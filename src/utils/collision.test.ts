import { describe, expect, it } from "vitest";
import {
  expandedTraditionPosition,
  selectCollisionFreeLabels,
  semanticZoomScale,
} from "./collision";

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

  it("trata rótulos políticos como textos centrados no território", () => {
    const centered = [
      { key: "north", x: 100, y: 100, label: "Território setentrional", priority: 2 },
      { key: "south", x: 100, y: 112, label: "Território meridional", priority: 1 },
    ];
    expect(selectCollisionFreeLabels(centered, 1, "center")).toEqual(new Set(["north"]));
  });

  it("aumenta progressivamente o texto sem deixá-lo crescer na mesma razão do mapa", () => {
    expect(semanticZoomScale(1)).toBe(1);
    expect(semanticZoomScale(4)).toBe(0.5);
    expect(semanticZoomScale(9)).toBeCloseTo(1 / 3);
  });

  it("distribui membros expandidos em uma grade legível dentro da cena", () => {
    const positions = Array.from({ length: 19 }, (_, index) =>
      expandedTraditionPosition([400, 560], index, 19),
    );
    expect(new Set(positions.map(([x, y]) => `${x}:${y}`)).size).toBe(19);
    expect(Math.min(...positions.map(([, y]) => y))).toBeGreaterThanOrEqual(110);
    expect(Math.max(...positions.map(([, y]) => y))).toBeLessThanOrEqual(620);
    for (let index = 0; index < positions.length; index += 1) {
      for (let peer = index + 1; peer < positions.length; peer += 1) {
        const [leftX, leftY] = positions[index];
        const [rightX, rightY] = positions[peer];
        expect(Math.hypot(leftX - rightX, leftY - rightY)).toBeGreaterThanOrEqual(24);
      }
    }
  });
});
