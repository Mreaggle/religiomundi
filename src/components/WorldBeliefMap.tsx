import { Layers3, LocateFixed, Minus, Plus, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePoliticalMap } from "../data/usePoliticalMap";
import { useSvgZoom } from "../hooks/useSvgZoom";
import { useAtlas } from "../state/AtlasProvider";
import type { Archetype, TraditionCluster as TraditionClusterData } from "../types/atlas";
import type { PolityFeature } from "../types/polities";
import { clusterTraditions } from "../utils/atlas";
import { selectCollisionFreeLabels, semanticZoomScale } from "../utils/collision";
import { formatYear } from "../utils/temporal";
import { HistoricalPolityLayer } from "./HistoricalPolityLayer";
import { MapGeometry, useWorldGeometry } from "./MapGeometry";
import { TraditionCluster } from "./TraditionCluster";

const WIDTH = 1200;
const HEIGHT = 700;
const EXTENT: [[number, number], [number, number]] = [
  [62, 72],
  [1138, 628],
];

function dominant(values: string[]): string {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Não informado";
}

function analyseCluster(cluster: TraditionClusterData, archetypes: Archetype[]) {
  const functionCounts = new Map<string, number>();
  for (const tradition of cluster.traditions) {
    for (const archetype of archetypes) {
      if (tradition.correlations[archetype.code]?.type !== "absent") {
        functionCounts.set(archetype.code, (functionCounts.get(archetype.code) ?? 0) + 1);
      }
    }
  }
  const topArchetypes = [...functionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({
      archetype: archetypes.find((item) => item.code === code),
      count,
    }));
  return {
    family: dominant(cluster.traditions.map((tradition) => tradition.family)),
    status: dominant(cluster.traditions.map((tradition) => tradition.status)),
    period: dominant(cluster.traditions.map((tradition) => tradition.periodLabel)),
    topArchetypes,
  };
}

export function WorldBeliefMap() {
  const {
    data,
    visibleTraditions,
    selectedTradition,
    setSelectedTraditionId,
    clearSelection,
    selectedYear,
    temporalMode,
    setTemporalMode,
  } = useAtlas();
  const [expanded, setExpanded] = useState<string>();
  const [politicalLayerEnabled, setPoliticalLayerEnabled] = useState(true);
  const [selectedPolityState, setSelectedPolityState] = useState<{
    year: number;
    feature: PolityFeature;
  }>();
  const selectedPolity =
    selectedPolityState?.year === selectedYear ? selectedPolityState.feature : undefined;
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const { projection } = useWorldGeometry(EXTENT);
  const politicalMap = usePoliticalMap(selectedYear, politicalLayerEnabled);
  const focusTraditions = useMemo(
    () => (selectedTradition ? [selectedTradition] : visibleTraditions),
    [selectedTradition, visibleTraditions],
  );
  const clusters = useMemo(() => clusterTraditions(focusTraditions), [focusTraditions]);
  const { scale, zoomBy, panBy, resetZoom, focusAt } = useSvgZoom(svgRef, viewportRef, {
    width: WIDTH,
    height: HEIGHT,
    minScale: 0.85,
    maxScale: 9,
  });
  const expandedCluster = useMemo(
    () => clusters.find((cluster) => cluster.key === expanded),
    [clusters, expanded],
  );
  const clusterAnalysis = useMemo(
    () => (expandedCluster ? analyseCluster(expandedCluster, data.archetypes) : undefined),
    [data.archetypes, expandedCluster],
  );

  useEffect(() => {
    if (expanded && !clusters.some((cluster) => cluster.key === expanded)) setExpanded(undefined);
  }, [clusters, expanded]);

  function clusterPoint(
    cluster: TraditionClusterData,
    index: number,
  ): [number, number] | undefined {
    if (cluster.latitude !== undefined && cluster.longitude !== undefined) {
      return projection([cluster.longitude, cluster.latitude]) as [number, number] | undefined;
    }
    const angle = (index / Math.max(1, clusters.length)) * Math.PI * 2;
    return [600 + Math.cos(angle) * 455, 350 + Math.sin(angle) * 255];
  }

  const clusterLayout = clusters
    .map((cluster, index) => {
      const point = clusterPoint(cluster, index);
      return point ? { cluster, point } : undefined;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const visibleClusterLabels = selectCollisionFreeLabels(
    clusterLayout.map(({ cluster, point }) => ({
      key: cluster.key,
      x: point[0],
      y: point[1],
      label: cluster.label,
      priority: cluster.traditions.length,
    })),
    scale,
  );

  function handleMapKey(event: KeyboardEvent) {
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
    } else if (event.key === "Escape") {
      setExpanded(undefined);
    }
  }

  return (
    <section className="map-view instrument-panel" aria-labelledby="map-title">
      <div className="instrument-heading map-heading">
        <div>
          <p className="eyebrow">CARTOGRAFIA REGIONAL</p>
          <h2 id="map-title">Mapa das tradições documentadas</h2>
        </div>
        <div className="map-heading-meta">
          <p className="map-summary" aria-live="polite">
            <strong>{visibleTraditions.length}</strong> tradições em{" "}
            <strong>{clusters.length}</strong> agrupamentos. Cada número no mapa é a quantidade de
            tradições naquele agrupamento, não uma única religião.
          </p>
          <button
            className="map-summary-toggle"
            type="button"
            onClick={() => setTemporalMode(temporalMode === "catalog" ? "panorama" : "catalog")}
          >
            {temporalMode === "catalog"
              ? "Voltar ao recorte temporal"
              : `Ver catálogo completo · ${data.metadata.traditionCount}`}
          </button>
        </div>
      </div>

      <div className="map-canvas">
        <div
          className="map-tools"
          role="group"
          aria-label="Controles de navegação do mapa"
          onKeyDown={handleMapKey}
        >
          <button type="button" onClick={() => zoomBy(1.45)} aria-label="Aproximar mapa">
            <Plus aria-hidden="true" />
          </button>
          <output aria-label="Nível de zoom">{Math.round(scale * 100)}%</output>
          <button type="button" onClick={() => zoomBy(1 / 1.45)} aria-label="Afastar mapa">
            <Minus aria-hidden="true" />
          </button>
          <button type="button" onClick={resetZoom} aria-label="Restaurar posição do mapa">
            <LocateFixed aria-hidden="true" />
          </button>
          <button
            type="button"
            className={politicalLayerEnabled ? "is-active" : ""}
            aria-label={
              politicalLayerEnabled
                ? "Ocultar territórios históricos"
                : "Exibir territórios históricos"
            }
            aria-pressed={politicalLayerEnabled}
            onClick={() => {
              setPoliticalLayerEnabled((current) => !current);
              setSelectedPolityState(undefined);
            }}
          >
            <Layers3 aria-hidden="true" />
          </button>
        </div>

        <div className="map-stage">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={`Distribuição aproximada de ${visibleTraditions.length} tradições${
              politicalMap.snapshot
                ? ` sobre o recorte político de ${formatYear(politicalMap.snapshot.snapshotYear)}`
                : ""
            }`}
          >
            <g ref={viewportRef} className="map-viewport">
              <MapGeometry
                extent={EXTENT}
                className={`map-full-geometry ${
                  politicalLayerEnabled && politicalMap.snapshot ? "has-political-layer" : ""
                }`}
              />
              {selectedPolity && (
                <rect
                  className="polity-dismiss-surface"
                  x="0"
                  y="0"
                  width={WIDTH}
                  height={HEIGHT}
                  role="button"
                  tabIndex={0}
                  aria-label="Limpar foco do território"
                  onClick={() => setSelectedPolityState(undefined)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPolityState(undefined);
                    }
                  }}
                >
                  <title>Clique fora do território para limpar o foco</title>
                </rect>
              )}
              {politicalLayerEnabled && politicalMap.snapshot && (
                <HistoricalPolityLayer
                  snapshot={politicalMap.snapshot}
                  projection={projection}
                  scale={scale}
                  stale={politicalMap.stale}
                  selectedId={selectedPolity?.id}
                  onSelect={(feature) => {
                    clearSelection();
                    setExpanded(undefined);
                    setSelectedPolityState((current) =>
                      current?.feature.id === feature.id
                        ? undefined
                        : { year: selectedYear, feature },
                    );
                  }}
                />
              )}
              {selectedTradition && (
                <g
                  role="button"
                  tabIndex={0}
                  aria-label="Limpar seleção e mostrar todas as tradições"
                  onClick={() => {
                    clearSelection();
                    setExpanded(undefined);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      clearSelection();
                      setExpanded(undefined);
                    }
                  }}
                >
                  <rect className="focus-dismiss-surface" x="0" y="0" width={WIDTH} height={HEIGHT}>
                    <title>Clique para limpar a seleção</title>
                  </rect>
                </g>
              )}
              <g className={`map-traditions ${selectedPolity ? "focus-muted" : ""}`}>
                {clusterLayout.map(({ cluster, point: projected }) => {
                  const analysis = analyseCluster(cluster, data.archetypes);
                  return (
                    <g key={cluster.key}>
                      <TraditionCluster
                        cluster={cluster}
                        x={projected[0]}
                        y={projected[1]}
                        active={expanded === cluster.key}
                        visualScale={scale}
                        showLabel={
                          politicalLayerEnabled
                            ? expanded === cluster.key
                            : visibleClusterLabels.has(cluster.key)
                        }
                        summary={`Família predominante: ${analysis.family}. Status predominante: ${analysis.status}. Funções mais frequentes: ${analysis.topArchetypes
                          .slice(0, 3)
                          .map(({ archetype }) => archetype?.name)
                          .filter(Boolean)
                          .join(", ")}.`}
                        onActivate={() => {
                          setSelectedPolityState(undefined);
                          if (cluster.traditions.length === 1) {
                            setSelectedTraditionId(cluster.traditions[0].id);
                            return;
                          }
                          const next = expanded === cluster.key ? undefined : cluster.key;
                          setExpanded(next);
                          if (next) focusAt(projected[0], projected[1], Math.max(scale, 2.6));
                        }}
                      />
                      {expanded === cluster.key &&
                        cluster.traditions.slice(0, 36).map((tradition, itemIndex) => {
                          const visibleCount = Math.min(36, cluster.traditions.length);
                          const angle = (itemIndex / visibleCount) * Math.PI * 2;
                          const ring = Math.floor(itemIndex / 12);
                          const radius = 42 + ring * 31;
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
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setSelectedTraditionId(tradition.id);
                                }
                              }}
                            >
                              <title>
                                {tradition.name} · {tradition.periodLabel}
                              </title>
                              <circle r="5" />
                              <text x="8" y="3">
                                {tradition.name}
                              </text>
                            </g>
                          );
                        })}
                      {expanded === cluster.key && cluster.traditions.length > 36 && (
                        <text
                          className="map-overflow-label"
                          x={projected[0]}
                          y={projected[1] + 118}
                          textAnchor="middle"
                        >
                          +{cluster.traditions.length - 36} listadas no painel
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        </div>

        <p className="map-gesture-hint">
          Roda do mouse: zoom focal · arrastar: mover · duplo clique: aproximar · teclado: + − 0 e
          setas
        </p>
        {politicalLayerEnabled && (
          <details className="political-map-status">
            <summary>
              <span>RECORTE POLÍTICO</span>
              <strong>
                {politicalMap.loading && !politicalMap.snapshot
                  ? "Carregando cartografia…"
                  : politicalMap.requested
                    ? `${politicalMap.requested.label} · ${politicalMap.requested.featureCount} regiões`
                    : "Sem recorte cartográfico defensável"}
              </strong>
            </summary>
            <p>
              {politicalMap.index?.caveat ??
                "A camada usa snapshots descontínuos e não interpola fronteiras."}
            </p>
            {politicalMap.requested && politicalMap.requested.year !== selectedYear && (
              <p>
                Ano observado: <b>{formatYear(selectedYear)}</b>. Base cartográfica utilizada:{" "}
                <b>{formatYear(politicalMap.requested.year)}</b>, o último snapshot disponível não
                posterior ao recorte.
              </p>
            )}
            {politicalMap.loading && politicalMap.snapshot && (
              <p aria-live="polite">Atualizando a cartografia sem interromper a cena…</p>
            )}
            {politicalMap.error && <p className="political-map-error">{politicalMap.error}</p>}
            <div>
              {politicalMap.index?.sources.slice(0, 2).map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                  {source.institution}
                </a>
              ))}
            </div>
          </details>
        )}
        {selectedTradition && (
          <button className="focus-status map-focus-status" type="button" onClick={clearSelection}>
            <span>FOCO ISOLADO</span>
            <strong>{selectedTradition.name}</strong>
            <small>Clique aqui ou fora do marcador para mostrar tudo</small>
          </button>
        )}

        {selectedPolity && politicalMap.snapshot && (
          <aside
            className="polity-inspector"
            aria-label={`Território ${selectedPolity.properties.name}`}
          >
            <button
              className="map-inspector-close"
              type="button"
              onClick={() => setSelectedPolityState(undefined)}
              aria-label="Fechar território"
            >
              <X aria-hidden="true" />
            </button>
            <p className="eyebrow">TERRITÓRIO NO RECORTE</p>
            <h3>{selectedPolity.properties.name}</h3>
            <dl>
              <div>
                <dt>Tipo registrado</dt>
                <dd>{selectedPolity.properties.polityType || "Não especificado"}</dd>
              </div>
              <div>
                <dt>Autoridade / área</dt>
                <dd>{selectedPolity.properties.subject || selectedPolity.properties.name}</dd>
              </div>
              {selectedPolity.properties.partOf && (
                <div>
                  <dt>Parte de</dt>
                  <dd>{selectedPolity.properties.partOf}</dd>
                </div>
              )}
              <div>
                <dt>Snapshot cartográfico</dt>
                <dd>{formatYear(politicalMap.snapshot.snapshotYear)}</dd>
              </div>
              <div>
                <dt>Precisão da fronteira</dt>
                <dd>{selectedPolity.properties.borderPrecision} de 3</dd>
              </div>
            </dl>
            {selectedPolity.properties.sourceUrl && (
              <a
                className="polity-source-link"
                href={selectedPolity.properties.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Consultar referência associada
              </a>
            )}
            <p className="map-location-note">
              O polígono é uma aproximação cartográfica, não prova controle uniforme, soberania
              exclusiva, fronteira consensual ou identidade cultural única.
            </p>
          </aside>
        )}

        {expandedCluster && clusterAnalysis && (
          <aside
            className="map-cluster-inspector"
            aria-label={`Agrupamento ${expandedCluster.label}`}
          >
            <button
              className="map-inspector-close"
              type="button"
              onClick={() => setExpanded(undefined)}
              aria-label="Fechar agrupamento"
            >
              <X aria-hidden="true" />
            </button>
            <p className="eyebrow">AGRUPAMENTO REGIONAL</p>
            <h3>{expandedCluster.label}</h3>
            <p className="map-inspector-count">
              {expandedCluster.traditions.length} tradições — todas listadas abaixo
            </p>
            <dl>
              <div>
                <dt>Família predominante</dt>
                <dd>{clusterAnalysis.family}</dd>
              </div>
              <div>
                <dt>Status predominante</dt>
                <dd>{clusterAnalysis.status}</dd>
              </div>
              <div>
                <dt>Período predominante</dt>
                <dd>{clusterAnalysis.period}</dd>
              </div>
              <div>
                <dt>Cobertura</dt>
                <dd>{expandedCluster.coverage}</dd>
              </div>
            </dl>
            <div className="map-inspector-functions">
              <span>Funções mais documentadas</span>
              {clusterAnalysis.topArchetypes.map(({ archetype, count }) =>
                archetype ? (
                  <button type="button" key={archetype.code} title={archetype.inclusionCriteria}>
                    {archetype.code} — {archetype.name} <b>{count}</b>
                  </button>
                ) : null,
              )}
            </div>
            <div className="map-inspector-list">
              {[...expandedCluster.traditions]
                .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
                .map((tradition) => (
                  <button
                    type="button"
                    key={tradition.id}
                    onClick={() => setSelectedTraditionId(tradition.id)}
                  >
                    <span>{tradition.name}</span>
                    <small>
                      {tradition.id} · {tradition.family}
                    </small>
                  </button>
                ))}
            </div>
            <p className="map-location-note">
              Localização aproximada segundo a região informada no catálogo. Agrupamento visual não
              implica parentesco histórico.
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}
