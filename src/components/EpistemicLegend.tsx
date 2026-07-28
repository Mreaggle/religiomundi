import { ChevronUp, Info } from "lucide-react";
import { useState } from "react";
import { useAtlas } from "../state/AtlasProvider";
import { CORRELATION_META } from "../utils/atlas";

export function EpistemicLegend() {
  const { showAbsences, setShowAbsences, effectsEnabled, setEffectsEnabled } = useAtlas();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`epistemic-legend ${expanded ? "expanded" : ""}`}
      aria-label="Legenda epistemológica"
    >
      <button className="legend-handle" onClick={() => setExpanded(!expanded)}>
        <Info size={14} /> Legenda metodológica <ChevronUp size={14} />
      </button>
      <div className="legend-content">
        <div className="legend-symbols">
          {Object.entries(CORRELATION_META).map(([type, item]) => (
            <span key={type} className={`legend-${type}`}>
              <b>{item.symbol}</b> {item.label}
            </span>
          ))}
        </div>
        <p>
          A força visual indica apenas a classificação desta matriz, não verdade teológica,
          superioridade, antiguidade ou relevância espiritual.
        </p>
        <div className="legend-toggles">
          <label>
            <input
              type="checkbox"
              checked={showAbsences}
              onChange={(event) => setShowAbsences(event.target.checked)}
            />
            Exibir ausências documentadas
          </label>
          <label>
            <input
              type="checkbox"
              checked={effectsEnabled}
              onChange={(event) => setEffectsEnabled(event.target.checked)}
            />
            Efeitos visuais
          </label>
        </div>
      </div>
    </aside>
  );
}
