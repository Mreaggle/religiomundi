import { LocateFixed, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useAtlas } from "../state/AtlasProvider";
import { clusterTraditions } from "../utils/atlas";
import { MapGeometry, useWorldGeometry } from "./MapGeometry";
import { TraditionCluster } from "./TraditionCluster";

const EXTENT: [[number, number], [number, number]] = [
  [70, 55],
  [1130, 640],
];

export function WorldBeliefMap() {
  const { visibleTraditions, setSelectedTraditionId } = useAtlas();
  const clusters = useMemo(() => clusterTraditions(visibleTraditions), [visibleTraditions]);
  const { projection } = useWorldGeometry(EXTENT);
  const [expanded, setExpanded] = useState<string>();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>();

  return (
    <section className="map-view instrument-panel" aria-labelledby="map-view-title">
      <div className="instrument-heading">
        <div>
          <p className="eyebrow">CARTOGRAFIA REGIONAL</p>
          <h2 id="map-view-title">Mapa das tradições documentadas</h2>
        </div>
        <p>
          Localização aproximada segundo a região informada no catálogo. O mapa não representa
          coordenadas arqueológicas precisas.
        </p>
      </div>
      <div className="map-canvas">
        <div className="map-tools" role="group" aria-label="Controles do mapa">
          <button
            onClick={() => setZoom((value) => Math.min(2.6, value + 0.2))}
            aria-label="Aumentar zoom"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setZoom((value) => Math.max(0.8, value - 0.2))}
            aria-label="Diminuir zoom"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            aria-label="Restaurar mapa"
          >
            <LocateFixed size={16} />
          </button>
        </div>
        <svg
          viewBox="0 0 1200 700"
          role="img"
          aria-label={`Mapa com ${clusters.length} agrupamentos e ${visibleTraditions.length} tradições`}
          onWheel={(event) => {
            event.preventDefault();
            setZoom((value) =>
              Math.max(0.8, Math.min(2.6, value + (event.deltaY < 0 ? 0.1 : -0.1))),
            );
          }}
          onPointerDown={(event) =>
            setDragStart({ x: event.clientX - offset.x, y: event.clientY - offset.y })
          }
          onPointerMove={(event) => {
            if (dragStart)
              setOffset({ x: event.clientX - dragStart.x, y: event.clientY - dragStart.y });
          }}
          onPointerUp={() => setDragStart(undefined)}
          onPointerLeave={() => setDragStart(undefined)}
        >
          <g transform={`translate(${offset.x} ${offset.y}) scale(${zoom})`}>
            <MapGeometry extent={EXTENT} />
            {clusters.map((cluster, index) => {
              const projected =
                cluster.latitude !== undefined && cluster.longitude !== undefined
                  ? projection([cluster.longitude, cluster.latitude])
                  : [1030 + (index % 4) * 28, 78 + Math.floor(index / 4) * 28];
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
                    cluster.traditions.slice(0, 28).map((tradition, itemIndex) => {
                      const angle =
                        (itemIndex / Math.min(28, cluster.traditions.length)) * Math.PI * 2;
                      const radius = 34 + Math.floor(itemIndex / 10) * 23;
                      const x = projected[0] + Math.cos(angle) * radius;
                      const y = projected[1] + Math.sin(angle) * radius;
                      return (
                        <g
                          key={tradition.id}
                          className="expanded-tradition"
                          transform={`translate(${x} ${y})`}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedTraditionId(tradition.id)}
                          onKeyDown={(event) =>
                            event.key === "Enter" && setSelectedTraditionId(tradition.id)
                          }
                        >
                          <title>
                            {tradition.name} · {tradition.periodLabel} · {tradition.region}
                          </title>
                          <circle r="4.5" />
                          <text x="7" y="3">
                            {tradition.name}
                          </text>
                        </g>
                      );
                    })}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}
