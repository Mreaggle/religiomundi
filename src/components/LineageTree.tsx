import { GitBranch, LocateFixed, Minus, Plus, X } from "lucide-react";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";
import { LINEAGE_GROUPS, LINEAGE_RELATIONS, type LineageRelation } from "../data/lineage";
import { useSvgZoom } from "../hooks/useSvgZoom";
import { useAtlas } from "../state/AtlasProvider";
import type { Tradition } from "../types/atlas";
import { semanticZoomScale } from "../utils/collision";
import { formatYear, yearToPosition } from "../utils/temporal";

const VIEW_WIDTH = 1600;
const VIEW_HEIGHT = 850;
const CONTENT_WIDTH = 2520;
const LABEL_SPACING = 205;
const LANE_GAP = 30;

const REGION_ORDER = [
  "África",
  "Ásia Ocidental e Norte da África",
  "Sul e Centro da Ásia",
  "Leste e Sudeste da Ásia",
  "Europa",
  "Américas",
  "Oceania",
  "Global, diáspora ou região indeterminada",
] as const;

interface PositionedNode {
  tradition: Tradition;
  x: number;
  y: number;
  region: string;
  lane: number;
}

interface RegionBand {
  name: string;
  top: number;
  height: number;
  laneCount: number;
  traditions: Tradition[];
}

interface DisplayRelation extends LineageRelation {
  id: string;
}

function stableNumber(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function regionForTradition(tradition: Tradition): (typeof REGION_ORDER)[number] {
  if (tradition.isGlobal) return "Global, diáspora ou região indeterminada";
  const location = tradition.locations[0] ?? tradition.location;
  if (!location) return "Global, diáspora ou região indeterminada";
  const { latitude, longitude } = location;
  if (longitude < -25) return "Américas";
  if (longitude >= 110 && latitude < -10) return "Oceania";
  if (longitude >= 90) return "Leste e Sudeste da Ásia";
  if (longitude >= 55) return "Sul e Centro da Ásia";
  if (longitude >= 25 && latitude < 45) return "Ásia Ocidental e Norte da África";
  if (latitude < 32 && longitude > -25) return "África";
  return "Europa";
}

function temporalX(tradition: Tradition, selectedYear: number): number {
  const year = tradition.startYear ?? selectedYear;
  const jitter = (stableNumber(tradition.id) % 17) - 8;
  return 180 + yearToPosition(year) * 2.25 + jitter;
}

function buildRelations(): DisplayRelation[] {
  const relations = new Map<string, DisplayRelation>();
  for (const group of LINEAGE_GROUPS) {
    for (const child of group.children) {
      const id = `${group.root}→${child}`;
      relations.set(id, {
        id,
        from: group.root,
        to: child,
        kind: "documented",
        sourceCodes: group.sourceCodes,
        note: `${group.note} Relação catalogal documentada; não implica ancestralidade institucional simples.`,
      });
    }
  }
  for (const relation of LINEAGE_RELATIONS) {
    const id = `${relation.from}→${relation.to}`;
    relations.set(id, { ...relation, id });
  }
  return [...relations.values()];
}

const DISPLAY_RELATIONS = buildRelations();

export function LineageTree() {
  const { data, visibleTraditions, selectedYear, setSelectedTraditionId } = useAtlas();
  const [selectedRelation, setSelectedRelation] = useState<DisplayRelation>();
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);

  const layout = useMemo(() => {
    const grouped = new Map<string, Tradition[]>(
      REGION_ORDER.map((region) => [region, [] as Tradition[]]),
    );
    for (const tradition of visibleTraditions) {
      grouped.get(regionForTradition(tradition))?.push(tradition);
    }

    const positions = new Map<string, PositionedNode>();
    const bands: RegionBand[] = [];
    let top = 68;

    for (const region of REGION_ORDER) {
      const traditions = (grouped.get(region) ?? []).sort(
        (a, b) =>
          temporalX(a, selectedYear) - temporalX(b, selectedYear) ||
          a.name.localeCompare(b.name, "pt-BR"),
      );
      if (traditions.length === 0) continue;

      const laneEnds: number[] = [];
      for (const tradition of traditions) {
        const x = temporalX(tradition, selectedYear);
        let lane = laneEnds.findIndex((lastX) => x - lastX >= LABEL_SPACING);
        if (lane < 0) {
          lane = laneEnds.length;
          laneEnds.push(x);
        } else {
          laneEnds[lane] = x;
        }
        positions.set(tradition.name, { tradition, x, y: 0, region, lane });
      }

      const height = Math.max(116, 82 + laneEnds.length * LANE_GAP);
      for (const tradition of traditions) {
        const node = positions.get(tradition.name);
        if (node) node.y = top + 58 + node.lane * LANE_GAP;
      }
      bands.push({
        name: region,
        top,
        height,
        laneCount: laneEnds.length,
        traditions,
      });
      top += height + 22;
    }

    return { positions, bands, height: Math.max(VIEW_HEIGHT, top + 36) };
  }, [selectedYear, visibleTraditions]);

  const visibleRelations = useMemo(
    () =>
      DISPLAY_RELATIONS.filter(
        (relation) => layout.positions.has(relation.from) && layout.positions.has(relation.to),
      ),
    [layout.positions],
  );
  const { scale, zoomBy, panBy, resetZoom } = useSvgZoom(svgRef, viewportRef, {
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    contentWidth: CONTENT_WIDTH,
    contentHeight: layout.height,
    minScale: 0.08,
    maxScale: 6,
    initialScale: 0.55,
    initialX: 18,
    initialY: 18,
  });
  const nodeVisualScale =
    scale < 1 ? Math.min(3.4, 1 / Math.sqrt(Math.max(scale, 0.08))) : semanticZoomScale(scale);

  function handleKey(event: KeyboardEvent) {
    if (event.key === "+" || event.key === "=") zoomBy(1.3);
    else if (event.key === "-") zoomBy(1 / 1.3);
    else if (event.key === "0") resetZoom();
    else if (event.key === "ArrowLeft") panBy(54, 0);
    else if (event.key === "ArrowRight") panBy(-54, 0);
    else if (event.key === "ArrowUp") panBy(0, 54);
    else if (event.key === "ArrowDown") panBy(0, -54);
    else if (event.key === "Escape") setSelectedRelation(undefined);
    else return;
    event.preventDefault();
  }

  return (
    <section className="lineage-view instrument-panel" aria-labelledby="lineage-title">
      <div className="instrument-heading lineage-heading">
        <div>
          <p className="eyebrow">GENEALOGIA TEMPORAL · TODAS AS TRADIÇÕES VISÍVEIS</p>
          <h2 id="lineage-title">Árvore das tradições</h2>
        </div>
        <p>
          O tempo avança da esquerda para a direita. Faixas regionais organizam proximidade visual,
          sem criar parentesco. Arestas existem somente quando registradas como relação documentada
          ou hipótese/debate. Arraste para percorrer todos os ramos.
        </p>
      </div>

      <div className="lineage-stage">
        <div
          className="map-tools lineage-tools"
          role="group"
          aria-label="Controles da árvore"
          onKeyDown={handleKey}
        >
          <button type="button" onClick={() => zoomBy(1.4)} aria-label="Aproximar árvore">
            <Plus aria-hidden="true" />
          </button>
          <output aria-label="Nível de zoom da árvore">{Math.round(scale * 100)}%</output>
          <button type="button" onClick={() => zoomBy(1 / 1.4)} aria-label="Afastar árvore">
            <Minus aria-hidden="true" />
          </button>
          <button type="button" onClick={resetZoom} aria-label="Restaurar posição da árvore">
            <LocateFixed aria-hidden="true" />
          </button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`Árvore linear com ${layout.positions.size} tradições e ${visibleRelations.length} relações explícitas`}
        >
          <g ref={viewportRef} className="lineage-viewport">
            <rect className="lineage-background" width={CONTENT_WIDTH} height={layout.height} />

            <g className="lineage-time-grid">
              {data.chronology.map((period) => {
                const x = 180 + yearToPosition(period.startYear) * 2.25;
                return (
                  <g key={period.id} transform={`translate(${x} 0)`}>
                    <line y1="36" y2={layout.height} />
                    <text y="26">{period.name.split("/")[0]}</text>
                  </g>
                );
              })}
            </g>

            {layout.bands.map((band) => (
              <g key={band.name} className="lineage-region-band">
                <rect x="24" y={band.top} width={CONTENT_WIDTH - 48} height={band.height} />
                <line
                  className="lineage-region-branch"
                  x1="150"
                  x2={CONTENT_WIDTH - 42}
                  y1={band.top + 43}
                  y2={band.top + 43}
                />
                <text className="lineage-region-title" x="42" y={band.top + 27}>
                  {band.name}
                </text>
                <text className="lineage-region-count" x={CONTENT_WIDTH - 48} y={band.top + 27}>
                  {band.traditions.length} tradições · {band.laneCount} linhas de leitura
                </text>
              </g>
            ))}

            <g className="lineage-relations">
              {visibleRelations.map((relation) => {
                const source = layout.positions.get(relation.from);
                const target = layout.positions.get(relation.to);
                if (!source || !target) return null;
                const direction = target.x >= source.x ? 1 : -1;
                const curve = Math.max(50, Math.abs(target.x - source.x) * 0.42);
                const selected = selectedRelation?.id === relation.id;
                return (
                  <path
                    key={relation.id}
                    className={`lineage-edge lineage-${relation.kind} ${
                      selected ? "selected" : ""
                    }`}
                    d={`M${source.x},${source.y} C${source.x + curve * direction},${source.y} ${
                      target.x - curve * direction
                    },${target.y} ${target.x},${target.y}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${relation.kind === "documented" ? "Relação documentada" : "Hipótese ou debate"}: ${relation.from} para ${relation.to}`}
                    onClick={() =>
                      setSelectedRelation((current) =>
                        current?.id === relation.id ? undefined : relation,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedRelation((current) =>
                          current?.id === relation.id ? undefined : relation,
                        );
                      }
                    }}
                  >
                    <title>
                      {relation.kind === "documented"
                        ? "Relação documentada"
                        : "Hipótese ou debate"}
                      : {relation.note}
                    </title>
                  </path>
                );
              })}
            </g>

            <g className="lineage-nodes">
              {[...layout.positions.values()].map(({ tradition, x, y, region }) => (
                <g
                  key={tradition.id}
                  className="lineage-node"
                  transform={`translate(${x} ${y}) scale(${nodeVisualScale})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${tradition.name}, ${tradition.periodLabel}, faixa ${region}`}
                  onClick={() => setSelectedTraditionId(tradition.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedTraditionId(tradition.id);
                    }
                  }}
                >
                  <circle r="5" />
                  <text x="10" y="3">
                    {tradition.name}
                  </text>
                  <title>
                    {tradition.name} · {tradition.periodLabel} · {tradition.region}
                  </title>
                </g>
              ))}
            </g>
          </g>
        </svg>

        <div className="lineage-axis-readout" aria-hidden="true">
          <GitBranch />
          <span>mais antigo</span>
          <i />
          <strong>{formatYear(selectedYear)}</strong>
        </div>

        {selectedRelation && (
          <aside className="lineage-relation-inspector" aria-label="Relação histórica selecionada">
            <button
              type="button"
              className="map-inspector-close"
              onClick={() => setSelectedRelation(undefined)}
              aria-label="Fechar relação histórica"
            >
              <X aria-hidden="true" />
            </button>
            <p className="eyebrow">
              {selectedRelation.kind === "documented" ? "RELAÇÃO DOCUMENTADA" : "HIPÓTESE / DEBATE"}
            </p>
            <h3>
              {selectedRelation.from} <span>→</span> {selectedRelation.to}
            </h3>
            <p>{selectedRelation.note}</p>
            <small>Fontes do catálogo: {selectedRelation.sourceCodes.join(" · ")}</small>
            {selectedRelation.sourceUrls?.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                Consultar referência acadêmica
              </a>
            ))}
          </aside>
        )}
      </div>

      <div className="lineage-key" role="group" aria-label="Legenda da árvore">
        <span className="key-documented">Relação documentada</span>
        <span className="key-hypothesis">Hipótese, reconstrução ou debate</span>
        <span className="key-region">Faixa regional de proximidade</span>
        <strong>Ausência de aresta = sem parentesco demonstrado nos dados</strong>
      </div>
    </section>
  );
}
