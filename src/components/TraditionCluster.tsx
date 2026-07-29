import type { TraditionCluster as TraditionClusterData } from "../types/atlas";

export function TraditionCluster({
  cluster,
  x,
  y,
  active,
  summary,
  visualScale = 1,
  showLabel = true,
  onActivate,
}: {
  cluster: TraditionClusterData;
  x: number;
  y: number;
  active: boolean;
  summary?: string;
  visualScale?: number;
  showLabel?: boolean;
  onActivate: () => void;
}) {
  const radius = Math.min(18, 5 + Math.sqrt(cluster.traditions.length) * 1.8);
  const semanticScale = 1 / Math.max(1, visualScale);
  return (
    <g
      className={`tradition-cluster ${active ? "active" : ""} ${
        showLabel ? "label-visible" : "label-collapsed"
      }`}
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={`${cluster.label}, ${cluster.traditions.length} tradições, localização aproximada`}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate();
        }
      }}
    >
      <g className="cluster-semantic-scale" transform={`scale(${semanticScale})`}>
        <title>
          {cluster.label} · {cluster.traditions.length} tradições · cobertura predominante:{" "}
          {cluster.coverage}. Período predominante: {cluster.predominantPeriod}. {summary ?? ""}
          Localização aproximada segundo a região informada no catálogo.
        </title>
        <circle className="cluster-pulse" r={radius + 8} />
        <circle className="cluster-core" r={radius} />
        <circle className="cluster-ring" r={radius + 3} />
        <text className="cluster-count" y={3}>
          {cluster.traditions.length}
        </text>
        <text className="cluster-label" y={radius + 15}>
          {cluster.label}
        </text>
      </g>
    </g>
  );
}
