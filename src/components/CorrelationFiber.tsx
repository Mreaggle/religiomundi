import type { CSSProperties } from "react";
import type { Archetype, Correlation, Tradition } from "../types/atlas";
import { getArchetypeVisual } from "./archetypeVisuals";

export function CorrelationFiber({
  tradition,
  archetype,
  correlation,
  source,
  target,
  onSelect,
  onTooltip,
}: {
  tradition: Tradition;
  archetype: Archetype;
  correlation: Correlation;
  source: [number, number];
  target: [number, number];
  onSelect: () => void;
  onTooltip: (event: React.PointerEvent<SVGPathElement>, visible: boolean) => void;
}) {
  const midX = (source[0] + target[0]) / 2;
  const midY = (source[1] + target[1]) / 2 - Math.min(54, Math.abs(target[0] - source[0]) * 0.08);
  const path = `M${source[0]},${source[1]} Q${midX},${midY} ${target[0]},${target[1]}`;
  const visual = getArchetypeVisual(archetype.code);
  return (
    <path
      className={`correlation-fiber fiber-${correlation.type}`}
      data-archetype-code={archetype.code}
      data-correlation-type={correlation.type}
      style={{ "--fiber-color": visual.color } as CSSProperties}
      d={path}
      tabIndex={0}
      role="button"
      aria-label={`${tradition.name} e ${archetype.code} — ${archetype.name}: ${correlation.originalText}`}
      onClick={onSelect}
      onPointerEnter={(event) => onTooltip(event, true)}
      onPointerMove={(event) => onTooltip(event, true)}
      onPointerLeave={(event) => onTooltip(event, false)}
      onFocus={(event) => onTooltip(event as unknown as React.PointerEvent<SVGPathElement>, true)}
      onBlur={(event) => onTooltip(event as unknown as React.PointerEvent<SVGPathElement>, false)}
    >
      <title>
        {tradition.name} · {archetype.code} — {archetype.name} · {correlation.originalText}
      </title>
    </path>
  );
}
