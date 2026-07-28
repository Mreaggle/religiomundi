import { arc } from "d3";
import type { Archetype, Tradition } from "../types/atlas";
import { CORRELATION_META } from "../utils/atlas";

export function FunctionalSignature({
  tradition,
  archetypes,
  size = 190,
  labelled = true,
}: {
  tradition: Tradition;
  archetypes: Archetype[];
  size?: number;
  labelled?: boolean;
}) {
  const center = size / 2;
  const inner = size * 0.31;
  const outer = size * 0.45;
  const gap = 0.018;

  return (
    <figure className="functional-signature">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label={`Assinatura funcional de ${tradition.name}, 44 segmentos`}
      >
        <circle cx={center} cy={center} r={inner - 6} className="signature-core" />
        <g transform={`translate(${center} ${center})`}>
          {archetypes.map((archetype, index) => {
            const correlation = tradition.correlations[archetype.code];
            const startAngle = (index / archetypes.length) * Math.PI * 2 + gap;
            const endAngle = ((index + 1) / archetypes.length) * Math.PI * 2 - gap;
            const shape =
              arc()({
                innerRadius: inner,
                outerRadius:
                  correlation.type === "direct"
                    ? outer
                    : correlation.type === "absent"
                      ? inner + 4
                      : outer - 5,
                startAngle,
                endAngle,
              }) ?? "";
            return (
              <path
                key={archetype.code}
                d={shape}
                fill={CORRELATION_META[correlation.type].color}
                className={`signature-segment signature-${correlation.type}`}
                tabIndex={0}
                aria-label={`${archetype.code}, ${archetype.name}: ${correlation.originalText}`}
              >
                <title>
                  {archetype.code} — {archetype.name}: {correlation.originalText}
                </title>
              </path>
            );
          })}
          <text className="signature-id" textAnchor="middle" y="-3">
            {tradition.id}
          </text>
          <text className="signature-count" textAnchor="middle" y="14">
            {Object.values(tradition.correlations).filter((item) => item.type !== "absent").length}
            /44
          </text>
        </g>
      </svg>
      {labelled && (
        <figcaption>
          <strong>Assinatura funcional</strong>
          <span>44 posições fixas; cobertura documental não é validade religiosa.</span>
        </figcaption>
      )}
    </figure>
  );
}
