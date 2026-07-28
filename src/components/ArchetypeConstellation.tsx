import { useEffect, useMemo, useState } from "react";
import { useAtlas } from "../state/AtlasProvider";
import type { Archetype, CorrelationType, Tradition } from "../types/atlas";
import { clusterTraditions, countByCorrelation } from "../utils/atlas";
import { CorrelationFiber } from "./CorrelationFiber";
import { MapGeometry, useWorldGeometry } from "./MapGeometry";
import { TraditionCluster } from "./TraditionCluster";

const EXTENT: [[number, number], [number, number]] = [
  [315, 170],
  [885, 505],
];
const TYPE_SCORE: Record<CorrelationType, number> = {
  direct: 5,
  partial: 4,
  impersonal: 3,
  uncertain: 2,
  absent: 0,
};

function archetypePositions(archetypes: Archetype[]): Map<string, [number, number]> {
  const positions = new Map<string, [number, number]>();
  archetypes.forEach((archetype, index) => {
    const outer = index < 24;
    const ringIndex = outer ? index : index - 24;
    const count = outer ? 24 : 20;
    const angle = -Math.PI / 2 + (ringIndex / count) * Math.PI * 2;
    const rx = outer ? 545 : 430;
    const ry = outer ? 300 : 238;
    positions.set(archetype.code, [600 + Math.cos(angle) * rx, 350 + Math.sin(angle) * ry]);
  });
  return positions;
}

export function ArchetypeConstellation() {
  const {
    data,
    visibleTraditions,
    selectedTradition,
    setSelectedTraditionId,
    selectedArchetype,
    setSelectedArchetypeCode,
    selectedYear,
    showAbsences,
    effectsEnabled,
  } = useAtlas();
  const [expanded, setExpanded] = useState<string>();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string }>();
  const positions = useMemo(() => archetypePositions(data.archetypes), [data.archetypes]);
  const clusters = useMemo(() => clusterTraditions(visibleTraditions), [visibleTraditions]);
  const { projection } = useWorldGeometry(EXTENT);

  useEffect(() => {
    if (Number.isFinite(selectedYear)) setTooltip(undefined);
  }, [selectedYear]);

  const archetypeCounts = useMemo(
    () =>
      new Map(
        data.archetypes.map((archetype) => {
          const counts = countByCorrelation(visibleTraditions, archetype.code);
          return [
            archetype.code,
            counts.direct + counts.partial + counts.impersonal + counts.uncertain,
          ];
        }),
      ),
    [data.archetypes, visibleTraditions],
  );
  const maximum = Math.max(1, ...archetypeCounts.values());
  const topArchetypes = [...data.archetypes]
    .sort((a, b) => (archetypeCounts.get(b.code) ?? 0) - (archetypeCounts.get(a.code) ?? 0))
    .slice(0, 6);

  const sourceForTradition = (tradition: Tradition, index = 0): [number, number] => {
    if (tradition.location) {
      return (
        (projection([tradition.location.longitude, tradition.location.latitude]) as [
          number,
          number,
        ]) ?? [600, 350]
      );
    }
    const angle = (index / Math.max(1, visibleTraditions.length)) * Math.PI * 2;
    return [600 + Math.cos(angle) * 175, 350 + Math.sin(angle) * 92];
  };

  const connections = useMemo(() => {
    if (selectedTradition) {
      return data.archetypes
        .map((archetype) => ({
          tradition: selectedTradition,
          archetype,
          correlation: selectedTradition.correlations[archetype.code],
        }))
        .filter((item) => item.correlation.type !== "absent" || showAbsences);
    }
    if (selectedArchetype) {
      return visibleTraditions
        .map((tradition) => ({
          tradition,
          archetype: selectedArchetype,
          correlation: tradition.correlations[selectedArchetype.code],
        }))
        .filter((item) => item.correlation.type !== "absent" || showAbsences)
        .sort((a, b) => TYPE_SCORE[b.correlation.type] - TYPE_SCORE[a.correlation.type])
        .slice(0, 110);
    }
    return clusters
      .map((cluster) => {
        let best:
          | {
              tradition: Tradition;
              archetype: Archetype;
              correlation: Tradition["correlations"][string];
            }
          | undefined;
        for (const tradition of cluster.traditions) {
          for (const archetype of topArchetypes) {
            const correlation = tradition.correlations[archetype.code];
            if (!best || TYPE_SCORE[correlation.type] > TYPE_SCORE[best.correlation.type]) {
              best = { tradition, archetype, correlation };
            }
          }
        }
        return best;
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .filter((item) => item.correlation.type !== "absent")
      .slice(0, 64);
  }, [
    clusters,
    data.archetypes,
    selectedArchetype,
    selectedTradition,
    showAbsences,
    topArchetypes,
    visibleTraditions,
  ]);

  return (
    <section
      className={`constellation-view instrument-panel ${effectsEnabled ? "" : "effects-off"}`}
      aria-labelledby="constellation-title"
    >
      <div className="instrument-heading constellation-heading">
        <div>
          <p className="eyebrow">VISUALIZAÇÃO PRINCIPAL</p>
          <h2 id="constellation-title">Constelação Arquetípica Temporal</h2>
        </div>
        <p>
          Os 44 eixos permanecem fixos. Agrupamentos orbitais são decisões de interface, não novas
          categorias acadêmicas.
        </p>
      </div>
      <div className="constellation-canvas">
        <svg
          viewBox="0 0 1200 700"
          role="img"
          aria-label={`Constelação com 44 arquétipos fixos e ${visibleTraditions.length} tradições visíveis`}
        >
          <defs>
            <radialGradient id="globe-glow">
              <stop offset="0%" stopColor="#193038" stopOpacity=".35" />
              <stop offset="100%" stopColor="#07100f" stopOpacity="0" />
            </radialGradient>
            <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle className="constellation-aura" cx="600" cy="350" r="270" />
          <circle className="orbit-line orbit-outer" cx="600" cy="350" rx="545" ry="300" />
          <circle className="orbit-line orbit-inner" cx="600" cy="350" rx="430" ry="238" />
          <MapGeometry extent={EXTENT} />

          <g className="correlation-layer">
            {connections.map((item, index) => {
              const target = positions.get(item.archetype.code);
              if (!target) return null;
              if (item.correlation.type === "absent") {
                return (
                  <circle
                    key={`${item.tradition.id}-${item.archetype.code}`}
                    className="absence-mark"
                    cx={target[0]}
                    cy={target[1]}
                    r={2 + (index % 3)}
                  >
                    <title>
                      {item.tradition.name} · {item.correlation.originalText}
                    </title>
                  </circle>
                );
              }
              return (
                <CorrelationFiber
                  key={`${item.tradition.id}-${item.archetype.code}`}
                  {...item}
                  source={sourceForTradition(item.tradition, index)}
                  target={target}
                  onSelect={() => {
                    setSelectedTraditionId(item.tradition.id);
                    setSelectedArchetypeCode(item.archetype.code);
                  }}
                  onTooltip={(event, visible) => {
                    if (!visible) return setTooltip(undefined);
                    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (!rect) return;
                    setTooltip({
                      x: event.clientX - rect.left,
                      y: event.clientY - rect.top,
                      content: `${item.tradition.name} · ${item.archetype.code} — ${item.archetype.name}\n${item.correlation.originalText}`,
                    });
                  }}
                />
              );
            })}
          </g>

          <g className="tradition-layer">
            {clusters.map((cluster, index) => {
              const projected =
                cluster.latitude !== undefined && cluster.longitude !== undefined
                  ? projection([cluster.longitude, cluster.latitude])
                  : [520 + (index % 7) * 27, 300 + Math.floor(index / 7) * 25];
              if (!projected) return null;
              return (
                <g key={cluster.key}>
                  <TraditionCluster
                    cluster={cluster}
                    x={projected[0]}
                    y={projected[1]}
                    active={expanded === cluster.key}
                    onActivate={() => {
                      if (cluster.traditions.length === 1) {
                        setSelectedTraditionId(cluster.traditions[0].id);
                      } else {
                        setExpanded(expanded === cluster.key ? undefined : cluster.key);
                      }
                    }}
                  />
                  {expanded === cluster.key &&
                    cluster.traditions.slice(0, 18).map((tradition, itemIndex) => {
                      const angle =
                        (itemIndex / Math.min(18, cluster.traditions.length)) * Math.PI * 2;
                      const radius = 28 + Math.floor(itemIndex / 8) * 18;
                      return (
                        <g
                          key={tradition.id}
                          className="expanded-tradition"
                          transform={`translate(${projected[0] + Math.cos(angle) * radius} ${
                            projected[1] + Math.sin(angle) * radius
                          })`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedTraditionId(tradition.id)}
                          onKeyDown={(event) =>
                            event.key === "Enter" && setSelectedTraditionId(tradition.id)
                          }
                        >
                          <title>
                            {tradition.name} · {tradition.periodLabel}
                          </title>
                          <circle r="4" />
                          <text x="6" y="3">
                            {tradition.name}
                          </text>
                        </g>
                      );
                    })}
                </g>
              );
            })}
          </g>

          <g className="archetype-layer">
            {data.archetypes.map((archetype) => {
              const position = positions.get(archetype.code) ?? [0, 0];
              const count = archetypeCounts.get(archetype.code) ?? 0;
              const intensity = count / maximum;
              const selected = selectedArchetype?.code === archetype.code;
              return (
                <g
                  key={archetype.code}
                  className={`archetype-node ${selected ? "selected" : ""} ${
                    count === 0 ? "inactive" : ""
                  }`}
                  transform={`translate(${position[0]} ${position[1]})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${archetype.code}, ${archetype.name}, ${count} correlações no período`}
                  onClick={() => setSelectedArchetypeCode(selected ? undefined : archetype.code)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedArchetypeCode(selected ? undefined : archetype.code);
                    }
                  }}
                >
                  <title>
                    {archetype.code} — {archetype.name}. {archetype.inclusionCriteria}
                  </title>
                  <circle className="archetype-halo" r={17 + intensity * 12} />
                  <circle className="archetype-disc" r={13 + intensity * 3} />
                  <path className="archetype-glyph" d="M-5,0 L0,-6 L5,0 L0,6 Z" />
                  <text className="archetype-code" y={3}>
                    {archetype.code}
                  </text>
                  <text className="archetype-name" y={28}>
                    {archetype.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        {tooltip && (
          <div className="fiber-tooltip" style={{ left: tooltip.x, top: tooltip.y }} role="tooltip">
            {tooltip.content.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        )}
        <div className="constellation-mantra">
          <span>Os nomes mudam.</span>
          <span>As funções reaparecem.</span>
          <strong>As diferenças continuam importando.</strong>
        </div>
      </div>
    </section>
  );
}
