import { type GeoProjection, geoPath } from "d3";
import { type CSSProperties, useMemo } from "react";
import type { PoliticalSnapshot, PolityFeature } from "../types/polities";
import { selectCollisionFreeLabels, semanticZoomScale } from "../utils/collision";

const POLITY_COLORS = [
  "#477c78",
  "#8b684b",
  "#6f7350",
  "#755f78",
  "#506c83",
  "#8a5d55",
  "#59735f",
  "#7d7048",
  "#58617a",
  "#7b5f66",
];

function stableColor(value: string): string {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return POLITY_COLORS[Math.abs(hash) % POLITY_COLORS.length];
}

export interface RenderedPolity {
  feature: PolityFeature;
  path: string;
  centroid: [number, number];
  area: number;
}

export function buildRenderedPolities(
  snapshot: PoliticalSnapshot,
  projection: GeoProjection,
): RenderedPolity[] {
  const path = geoPath(projection);
  return snapshot.features
    .map((feature) => {
      const geometry = feature as never;
      const pathValue = path(geometry);
      const centroid = path.centroid(geometry);
      const area = path.area(geometry);
      if (
        !pathValue ||
        !Number.isFinite(centroid[0]) ||
        !Number.isFinite(centroid[1]) ||
        area <= 0
      ) {
        return undefined;
      }
      return {
        feature,
        path: pathValue,
        centroid: centroid as [number, number],
        area,
      };
    })
    .filter((item): item is RenderedPolity => Boolean(item));
}

interface HistoricalPolityLayerProps {
  snapshot: PoliticalSnapshot;
  projection: GeoProjection;
  scale: number;
  selectedId?: string;
  interactive?: boolean;
  showLabels?: boolean;
  stale?: boolean;
  onSelect?: (feature: PolityFeature) => void;
}

export function HistoricalPolityLayer({
  snapshot,
  projection,
  scale,
  selectedId,
  interactive = true,
  showLabels = true,
  stale = false,
  onSelect,
}: HistoricalPolityLayerProps) {
  const rendered = useMemo(
    () => buildRenderedPolities(snapshot, projection),
    [projection, snapshot],
  );
  const visibleLabels = useMemo(() => {
    const candidates = rendered
      .filter((item) => item.area >= (scale > 2.2 ? 24 : 70))
      .sort((a, b) => b.area - a.area)
      .slice(0, scale > 3 ? 100 : scale > 1.5 ? 68 : 42)
      .map((item) => ({
        key: item.feature.id,
        x: item.centroid[0],
        y: item.centroid[1],
        label: item.feature.properties.name,
        priority: item.area,
      }));
    return selectCollisionFreeLabels(candidates, scale, "center");
  }, [rendered, scale]);

  return (
    <g
      className={`historical-polity-layer ${stale ? "is-stale" : ""}`}
      data-snapshot-year={snapshot.snapshotYear}
      aria-label={`Territórios do recorte cartográfico de ${snapshot.snapshotYear}`}
    >
      <g className="historical-polity-shapes">
        {rendered.map(({ feature, path }) => {
          const selected = selectedId === feature.id;
          const hiddenByFocus = Boolean(selectedId && !selected);
          const colorKey = feature.properties.subject || feature.properties.name;
          return (
            <path
              key={feature.id}
              d={path}
              className={`historical-polity precision-${feature.properties.borderPrecision} ${
                selected ? "selected" : ""
              } ${hiddenByFocus ? "focus-hidden" : ""}`}
              data-polity-name={feature.properties.name}
              data-border-precision={feature.properties.borderPrecision}
              style={{ "--polity-color": stableColor(colorKey) } as CSSProperties}
              role="button"
              tabIndex={interactive && !hiddenByFocus ? 0 : -1}
              aria-label={
                interactive
                  ? `${feature.properties.name}; ${feature.properties.polityType || "território"}; precisão cartográfica ${feature.properties.borderPrecision} de 3`
                  : undefined
              }
              onClick={
                interactive
                  ? (event) => {
                      event.stopPropagation();
                      onSelect?.(feature);
                    }
                  : undefined
              }
              onKeyDown={
                interactive
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect?.(feature);
                      }
                    }
                  : undefined
              }
            >
              <title>
                {feature.properties.name}
                {feature.properties.partOf ? ` · parte de ${feature.properties.partOf}` : ""}
                {` · fronteira ${feature.properties.borderPrecision}/3`}
              </title>
            </path>
          );
        })}
      </g>
      {showLabels && (
        <g className="historical-polity-labels">
          {rendered.map(({ feature, centroid }) =>
            visibleLabels.has(feature.id) && (!selectedId || selectedId === feature.id) ? (
              <g
                key={feature.id}
                transform={`translate(${centroid[0]} ${centroid[1]}) scale(${semanticZoomScale(
                  scale,
                )})`}
              >
                <text textAnchor="middle">{feature.properties.name}</text>
              </g>
            ) : null,
          )}
        </g>
      )}
    </g>
  );
}
