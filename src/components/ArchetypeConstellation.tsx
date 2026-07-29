import { LocateFixed, Minus, Plus } from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSvgZoom } from "../hooks/useSvgZoom";
import { useAtlas } from "../state/AtlasProvider";
import type { Archetype, CorrelationType, Tradition } from "../types/atlas";
import { clusterTraditions, countByCorrelation } from "../utils/atlas";
import { selectCollisionFreeLabels, semanticZoomScale } from "../utils/collision";
import { getArchetypeVisual } from "./archetypeVisuals";
import { CorrelationFiber } from "./CorrelationFiber";
import { MapGeometry, useWorldGeometry } from "./MapGeometry";
import { TraditionCluster } from "./TraditionCluster";

const EXTENT: [[number, number], [number, number]] = [
  [105, 105],
  [1095, 595],
];
const WIDTH = 1200;
const HEIGHT = 700;
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
    clearSelection,
    selectedYear,
    showAbsences,
    effectsEnabled,
  } = useAtlas();
  const [expanded, setExpanded] = useState<string>();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string }>();
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const positions = useMemo(() => archetypePositions(data.archetypes), [data.archetypes]);
  const focusActive = Boolean(selectedTradition || selectedArchetype);
  const focusTraditions = useMemo(() => {
    if (selectedTradition) return [selectedTradition];
    if (selectedArchetype) {
      return visibleTraditions.filter(
        (tradition) => tradition.correlations[selectedArchetype.code]?.type !== "absent",
      );
    }
    return visibleTraditions;
  }, [selectedArchetype, selectedTradition, visibleTraditions]);
  const clusters = useMemo(() => clusterTraditions(focusTraditions), [focusTraditions]);
  const { projection } = useWorldGeometry(EXTENT);
  const { scale, zoomBy, panBy, resetZoom } = useSvgZoom(svgRef, viewportRef, {
    width: WIDTH,
    height: HEIGHT,
    minScale: 0.75,
    maxScale: 9,
  });
  const clusterLayout = useMemo(
    () =>
      clusters
        .map((cluster, index) => {
          const point =
            cluster.latitude !== undefined && cluster.longitude !== undefined
              ? projection([cluster.longitude, cluster.latitude])
              : [420 + (index % 11) * 36, 245 + Math.floor(index / 11) * 32];
          return point ? { cluster, index, point: point as [number, number] } : undefined;
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [clusters, projection],
  );
  const visibleClusterLabels = useMemo(
    () =>
      selectCollisionFreeLabels(
        clusterLayout.map(({ cluster, point }) => ({
          key: cluster.key,
          x: point[0],
          y: point[1],
          label: cluster.label,
          priority: cluster.traditions.length,
        })),
        scale,
      ),
    [clusterLayout, scale],
  );

  useEffect(() => {
    if (Number.isFinite(selectedYear)) setTooltip(undefined);
  }, [selectedYear]);

  function handleConstellationKey(event: KeyboardEvent) {
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomBy(1.35);
    } else if (event.key === "-") {
      event.preventDefault();
      zoomBy(1 / 1.35);
    } else if (event.key === "0") {
      event.preventDefault();
      resetZoom();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      panBy(44, 0);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      panBy(-44, 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      panBy(0, 44);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      panBy(0, -44);
    }
  }

  const archetypeStats = useMemo(
    () =>
      new Map(
        data.archetypes.map((archetype) => {
          const counts = countByCorrelation(visibleTraditions, archetype.code);
          const total = counts.direct + counts.partial + counts.impersonal + counts.uncertain;
          const topTraditions = visibleTraditions
            .filter((tradition) => tradition.correlations[archetype.code]?.type !== "absent")
            .sort(
              (a, b) =>
                TYPE_SCORE[b.correlations[archetype.code].type] -
                TYPE_SCORE[a.correlations[archetype.code].type],
            )
            .slice(0, 5)
            .map((tradition) => tradition.name);
          return [archetype.code, { counts, total, topTraditions }];
        }),
      ),
    [data.archetypes, visibleTraditions],
  );
  const archetypeCounts = useMemo(
    () => new Map([...archetypeStats.entries()].map(([code, stats]) => [code, stats.total])),
    [archetypeStats],
  );
  const maximum = Math.max(1, ...archetypeCounts.values());
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
      const focusedArchetypes = selectedArchetype ? [selectedArchetype] : data.archetypes;
      return focusedArchetypes
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
    return data.archetypes
      .map((archetype, archetypeIndex) => {
        const ranked = visibleTraditions
          .map((tradition) => ({
            tradition,
            archetype,
            correlation: tradition.correlations[archetype.code],
          }))
          .filter((item) => item.correlation.type !== "absent")
          .sort((a, b) => TYPE_SCORE[b.correlation.type] - TYPE_SCORE[a.correlation.type]);
        if (!ranked.length) return undefined;
        const bestScore = TYPE_SCORE[ranked[0].correlation.type];
        const strongest = ranked.filter((item) => TYPE_SCORE[item.correlation.type] === bestScore);
        return strongest[archetypeIndex % strongest.length];
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [data.archetypes, selectedArchetype, selectedTradition, showAbsences, visibleTraditions]);

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
          categorias acadêmicas. Ícones e cores são marcadores de navegação, não símbolos sagrados.
        </p>
      </div>
      <div className="constellation-canvas">
        <div
          className="map-tools constellation-tools"
          role="group"
          aria-label="Controles de navegação da constelação"
          onKeyDown={handleConstellationKey}
        >
          <button type="button" onClick={() => zoomBy(1.45)} aria-label="Aproximar constelação">
            <Plus aria-hidden="true" />
          </button>
          <output aria-label="Nível de zoom da constelação">{Math.round(scale * 100)}%</output>
          <button type="button" onClick={() => zoomBy(1 / 1.45)} aria-label="Afastar constelação">
            <Minus aria-hidden="true" />
          </button>
          <button type="button" onClick={resetZoom} aria-label="Restaurar posição da constelação">
            <LocateFixed aria-hidden="true" />
          </button>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
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
          <g ref={viewportRef} className="constellation-viewport">
            <circle className="constellation-aura" cx="600" cy="350" r="270" />
            <circle className="orbit-line orbit-outer" cx="600" cy="350" rx="545" ry="300" />
            <circle className="orbit-line orbit-inner" cx="600" cy="350" rx="430" ry="238" />
            <MapGeometry extent={EXTENT} />
            {focusActive && (
              <g
                role="button"
                tabIndex={0}
                aria-label="Limpar seleção e mostrar todos os elementos"
                onClick={() => {
                  clearSelection();
                  setExpanded(undefined);
                  setTooltip(undefined);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    clearSelection();
                    setExpanded(undefined);
                    setTooltip(undefined);
                  }
                }}
              >
                <rect className="focus-dismiss-surface" x="0" y="0" width={WIDTH} height={HEIGHT}>
                  <title>Clique para limpar a seleção</title>
                </rect>
              </g>
            )}

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
              {clusterLayout.map(({ cluster, point: projected }) => {
                return (
                  <g key={cluster.key}>
                    <TraditionCluster
                      cluster={cluster}
                      x={projected[0]}
                      y={projected[1]}
                      active={expanded === cluster.key}
                      visualScale={scale}
                      showLabel={visibleClusterLabels.has(cluster.key)}
                      onActivate={() => {
                        if (cluster.traditions.length === 1) {
                          if (!selectedArchetype) setSelectedArchetypeCode(undefined);
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
                            }) scale(${semanticZoomScale(scale)})`}
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
                const stats = archetypeStats.get(archetype.code);
                const visual = getArchetypeVisual(archetype.code);
                const ArchetypeIcon = visual.icon;
                const count = stats?.total ?? 0;
                const intensity = count / maximum;
                const selected = selectedArchetype?.code === archetype.code;
                const relevantToTradition =
                  selectedTradition?.correlations[archetype.code]?.type !== "absent";
                const hiddenByFocus =
                  (Boolean(selectedArchetype) && !selected) ||
                  (Boolean(selectedTradition) && !relevantToTradition);
                return (
                  <g
                    key={archetype.code}
                    className={`archetype-node ${selected ? "selected" : ""} ${
                      count === 0 ? "inactive" : ""
                    } ${hiddenByFocus ? "focus-hidden" : ""}`}
                    data-archetype-code={archetype.code}
                    data-color-family={visual.colorFamily}
                    style={{ "--archetype-color": visual.color } as CSSProperties}
                    transform={`translate(${position[0]} ${position[1]})`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${archetype.code}, ${archetype.name}, ${count} correlações no período`}
                    onClick={() => {
                      if (selected) {
                        clearSelection();
                      } else {
                        setSelectedTraditionId(undefined);
                        setSelectedArchetypeCode(archetype.code);
                      }
                    }}
                    onPointerMove={(event) => {
                      const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      if (!rect || !stats) return;
                      setTooltip({
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top,
                        content: `${archetype.code} — ${archetype.name}\nGlifo de interface: ${visual.iconLabel} · Família cromática: ${visual.colorFamily}\n${archetype.inclusionCriteria}\nEvitar / não confundir: ${archetype.avoidConfusion}\n● ${stats.counts.direct} · ≈ ${stats.counts.partial} · ◇ ${stats.counts.impersonal} · ? ${stats.counts.uncertain} · — ${stats.counts.absent}\nPrincipais no recorte: ${stats.topTraditions.join(", ") || "nenhuma"}`,
                      });
                    }}
                    onPointerLeave={() => setTooltip(undefined)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (selected) {
                          clearSelection();
                        } else {
                          setSelectedTraditionId(undefined);
                          setSelectedArchetypeCode(archetype.code);
                        }
                      }
                    }}
                  >
                    <title>
                      {archetype.code} — {archetype.name}. {archetype.inclusionCriteria}
                    </title>
                    <g transform={`scale(${semanticZoomScale(scale)})`}>
                      <circle className="archetype-halo" r={17 + intensity * 12} />
                      <circle className="archetype-disc" r={13 + intensity * 3} />
                      <ArchetypeIcon
                        className="archetype-icon"
                        x={-7}
                        y={-7}
                        width={14}
                        height={14}
                        strokeWidth={1.65}
                        aria-hidden="true"
                      />
                      <text className="archetype-code" y={-20}>
                        {archetype.code}
                      </text>
                      <text className="archetype-name" y={28}>
                        {archetype.name}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
        {tooltip && (
          <div className="fiber-tooltip" style={{ left: tooltip.x, top: tooltip.y }} role="tooltip">
            {tooltip.content.split("\n").map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        )}
        {focusActive && (
          <button className="focus-status" type="button" onClick={clearSelection}>
            <span>FOCO ISOLADO</span>
            <strong>
              {selectedTradition?.name ?? `${selectedArchetype?.code} — ${selectedArchetype?.name}`}
            </strong>
            <small>Clique aqui ou fora dos elementos para mostrar tudo</small>
          </button>
        )}
        <div className="constellation-mantra">
          <span>Os nomes mudam.</span>
          <span>As funções reaparecem.</span>
          <strong>As diferenças continuam importando.</strong>
        </div>
        <p className="constellation-gesture-hint">
          Roda do mouse: zoom focal · arrastar: mover · duplo clique: aproximar · teclado: + − 0 e
          setas
        </p>
      </div>
    </section>
  );
}
