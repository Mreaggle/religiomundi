import { GitBranch, LocateFixed, Minus, Plus, Trees, X } from "lucide-react";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";
import { LINEAGE_GROUPS, LINEAGE_RELATIONS } from "../data/lineage";
import { useSvgZoom } from "../hooks/useSvgZoom";
import { useAtlas } from "../state/AtlasProvider";
import type { Tradition } from "../types/atlas";
import { semanticZoomScale } from "../utils/collision";
import { yearToPosition } from "../utils/temporal";

const WIDTH = 1580;
const MIN_HEIGHT = 760;

interface PositionedNode {
  tradition: Tradition;
  x: number;
  y: number;
  groupId: string;
  root: boolean;
}

function temporalX(tradition: Tradition): number {
  return 90 + yearToPosition(tradition.startYear ?? 2026) * 1.38;
}

function broadFamily(value: string): string {
  return value.split(/[/:]/)[0]?.trim() || value;
}

export function LineageTree() {
  const { visibleTraditions, selectedYear, setSelectedTraditionId, clearSelection } = useAtlas();
  const [contextKey, setContextKey] = useState<string>();
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const byName = useMemo(
    () => new Map(visibleTraditions.map((tradition) => [tradition.name, tradition])),
    [visibleTraditions],
  );

  const layout = useMemo(() => {
    const positions = new Map<string, PositionedNode>();
    const groups: Array<{
      id: string;
      title: string;
      note: string;
      sources: string[];
      top: number;
      height: number;
      root: Tradition;
      children: Tradition[];
    }> = [];
    let top = 64;

    for (const definition of LINEAGE_GROUPS) {
      const root = byName.get(definition.root);
      const children = definition.children
        .map((name) => byName.get(name))
        .filter((item): item is Tradition => Boolean(item))
        .sort((a, b) => (a.startYear ?? 2026) - (b.startYear ?? 2026));
      if (!root || children.length === 0) continue;

      const laneEnds: number[] = [];
      const childPositions = children.map((tradition) => {
        const x = Math.max(temporalX(root) + 125, temporalX(tradition));
        let lane = laneEnds.findIndex((lastX) => x - lastX > 205);
        if (lane < 0) {
          lane = laneEnds.length;
          laneEnds.push(x);
        } else {
          laneEnds[lane] = x;
        }
        return { tradition, x, lane };
      });
      const height = Math.max(112, 62 + laneEnds.length * 34);
      const rootY = top + height / 2;
      positions.set(root.name, {
        tradition: root,
        x: temporalX(root),
        y: rootY,
        groupId: definition.id,
        root: true,
      });
      for (const child of childPositions) {
        positions.set(child.tradition.name, {
          tradition: child.tradition,
          x: child.x,
          y: top + 48 + child.lane * 34,
          groupId: definition.id,
          root: false,
        });
      }
      groups.push({
        id: definition.id,
        title: definition.title,
        note: definition.note,
        sources: definition.sourceCodes,
        top,
        height,
        root,
        children,
      });
      top += height + 24;
    }
    return { groups, positions, height: Math.max(MIN_HEIGHT, top + 36) };
  }, [byName]);

  const linkedNames = useMemo(() => new Set(layout.positions.keys()), [layout.positions]);
  const contextualGroups = useMemo(() => {
    const grouped = new Map<string, Tradition[]>();
    for (const tradition of visibleTraditions) {
      if (linkedNames.has(tradition.name)) continue;
      const family = broadFamily(tradition.family);
      const region = tradition.isGlobal ? "Global/diáspora" : tradition.region.split("/")[0];
      const key = `${family} · ${region}`;
      grouped.set(key, [...(grouped.get(key) ?? []), tradition]);
    }
    return [...grouped.entries()]
      .map(([key, traditions]) => ({ key, traditions }))
      .sort((a, b) => b.traditions.length - a.traditions.length || a.key.localeCompare(b.key));
  }, [linkedNames, visibleTraditions]);
  const selectedContext = contextualGroups.find((group) => group.key === contextKey);
  const { scale, zoomBy, panBy, resetZoom } = useSvgZoom(svgRef, viewportRef, {
    width: WIDTH,
    height: MIN_HEIGHT,
    contentHeight: layout.height,
    minScale: 0.65,
    maxScale: 5,
  });

  function handleKey(event: KeyboardEvent) {
    if (event.key === "+" || event.key === "=") zoomBy(1.3);
    else if (event.key === "-") zoomBy(1 / 1.3);
    else if (event.key === "0") resetZoom();
    else if (event.key === "ArrowLeft") panBy(54, 0);
    else if (event.key === "ArrowRight") panBy(-54, 0);
    else if (event.key === "ArrowUp") panBy(0, 54);
    else if (event.key === "ArrowDown") panBy(0, -54);
    else return;
    event.preventDefault();
  }

  return (
    <section className="lineage-view instrument-panel" aria-labelledby="lineage-title">
      <div className="instrument-heading lineage-heading">
        <div>
          <p className="eyebrow">GENEALOGIA DOCUMENTAL E BOSQUE CONTEXTUAL</p>
          <h2 id="lineage-title">Árvore das tradições</h2>
        </div>
        <p>
          Linhas sólidas indicam continuidade documentada; pontilhadas, influência parcial; linhas
          azuladas ligam somente categorias do catálogo. Proximidade não cria parentesco.
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
          viewBox={`0 0 ${WIDTH} ${MIN_HEIGHT}`}
          role="img"
          aria-label={`Árvore temporal com ${layout.positions.size} tradições ligadas e ${contextualGroups.length} agrupamentos sem parentesco demonstrado`}
        >
          <g ref={viewportRef} className="lineage-viewport">
            <defs>
              <linearGradient id="lineage-trunk" x1="0" x2="1">
                <stop offset="0" stopColor="#d59a4a" stopOpacity=".12" />
                <stop offset="1" stopColor="#57c8d4" stopOpacity=".04" />
              </linearGradient>
            </defs>
            <rect className="lineage-background" width={WIDTH} height={layout.height} />
            {layout.groups.map((group) => (
              <g key={group.id}>
                <rect
                  className="lineage-band"
                  x="18"
                  y={group.top}
                  width={WIDTH - 36}
                  height={group.height}
                />
                <text className="lineage-group-title" x="34" y={group.top + 23}>
                  {group.title}
                </text>
                <text className="lineage-group-source" x={WIDTH - 34} y={group.top + 23}>
                  {group.sources.join(" · ")}
                </text>
                {group.children.map((child) => {
                  const source = layout.positions.get(group.root.name);
                  const target = layout.positions.get(child.name);
                  if (!source || !target) return null;
                  if (
                    LINEAGE_RELATIONS.some(
                      (relation) => relation.from === group.root.name && relation.to === child.name,
                    )
                  ) {
                    return null;
                  }
                  const mid = Math.max(source.x + 62, (source.x + target.x) / 2);
                  return (
                    <path
                      key={`${group.root.id}-${child.id}`}
                      className="lineage-edge lineage-catalog"
                      d={`M${source.x},${source.y} C${mid},${source.y} ${mid},${target.y} ${target.x},${target.y}`}
                    >
                      <title>
                        Agrupamento catalogal — {group.note} Fontes: {group.sources.join(", ")}
                      </title>
                    </path>
                  );
                })}
              </g>
            ))}

            {LINEAGE_RELATIONS.map((relation) => {
              const source = layout.positions.get(relation.from);
              const target = layout.positions.get(relation.to);
              if (!source || !target) return null;
              const mid = (source.x + target.x) / 2;
              return (
                <path
                  key={`${relation.from}-${relation.to}`}
                  className={`lineage-edge lineage-${relation.kind}`}
                  d={`M${source.x},${source.y} C${mid},${source.y} ${mid},${target.y} ${target.x},${target.y}`}
                >
                  <title>
                    {relation.kind === "documented" ? "Continuidade documentada" : "Influência"}:{" "}
                    {relation.note} Fontes: {relation.sourceCodes.join(", ")}
                  </title>
                </path>
              );
            })}

            {[...layout.positions.values()].map(({ tradition, x, y, root }) => (
              <g
                key={tradition.id}
                className={`lineage-node ${root ? "lineage-root" : ""}`}
                transform={`translate(${x} ${y}) scale(${semanticZoomScale(scale)})`}
                role="button"
                tabIndex={0}
                aria-label={`${tradition.name}, ${tradition.periodLabel}`}
                onClick={() => setSelectedTraditionId(tradition.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTraditionId(tradition.id);
                  }
                }}
              >
                <circle r={root ? 8 : 5} />
                <text
                  x={x > WIDTH - 260 ? -12 : 12}
                  y="4"
                  textAnchor={x > WIDTH - 260 ? "end" : "start"}
                >
                  {tradition.name}
                </text>
                <title>
                  {tradition.name} · {tradition.periodLabel} · {tradition.region}
                </title>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="lineage-key" role="group" aria-label="Legenda da árvore">
        <span className="key-documented">Continuidade documentada</span>
        <span className="key-influence">Influência parcial</span>
        <span className="key-catalog">Ramo catalogal</span>
        <strong>Ausência de linha = sem parentesco demonstrado nos dados</strong>
      </div>

      <section className="context-grove" aria-labelledby="context-grove-title">
        <div>
          <p className="eyebrow">BOSQUE CONTEXTUAL · {selectedYear}</p>
          <h3 id="context-grove-title">Tradições sem vínculo histórico explícito</h3>
          <p>
            Agrupadas apenas por família e contexto regional para reduzir colisões. Os cartões não
            representam descendência.
          </p>
        </div>
        <div className="context-grove-grid">
          {contextualGroups.map((group) => (
            <button
              type="button"
              key={group.key}
              onClick={() => setContextKey(contextKey === group.key ? undefined : group.key)}
            >
              <Trees aria-hidden="true" />
              <span>{group.key}</span>
              <b>{group.traditions.length}</b>
            </button>
          ))}
        </div>
      </section>

      {selectedContext && (
        <aside className="context-grove-inspector" aria-label={selectedContext.key}>
          <button
            type="button"
            className="map-inspector-close"
            onClick={() => setContextKey(undefined)}
            aria-label="Fechar bosque contextual"
          >
            <X aria-hidden="true" />
          </button>
          <p className="eyebrow">SEM PARENTESCO DEMONSTRADO</p>
          <h3>{selectedContext.key}</h3>
          <div>
            {selectedContext.traditions.map((tradition) => (
              <button
                type="button"
                key={tradition.id}
                onClick={() => setSelectedTraditionId(tradition.id)}
              >
                <GitBranch aria-hidden="true" />
                <span>
                  <strong>{tradition.name}</strong>
                  <small>
                    {tradition.periodLabel} · {tradition.region}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <button type="button" className="context-clear" onClick={clearSelection}>
            Limpar seleção
          </button>
        </aside>
      )}
    </section>
  );
}
