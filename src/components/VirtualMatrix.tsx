import { useMemo, useState } from "react";
import { useAtlas } from "../state/AtlasProvider";
import { CORRELATION_META } from "../utils/atlas";

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 58;
const OVERSCAN = 7;

export function VirtualMatrix() {
  const {
    data,
    visibleTraditions,
    setSelectedTraditionId,
    setSelectedArchetypeCode,
    showAbsences,
  } = useAtlas();
  const [scrollTop, setScrollTop] = useState(0);
  const viewportHeight = 620;
  const range = useMemo(() => {
    const start = Math.max(0, Math.floor((scrollTop - HEADER_HEIGHT) / ROW_HEIGHT) - OVERSCAN);
    const count = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
    return { start, end: Math.min(visibleTraditions.length, start + count) };
  }, [scrollTop, visibleTraditions.length]);
  const rows = visibleTraditions.slice(range.start, range.end);
  const width = 280 + data.archetypes.length * 42;

  return (
    <section className="matrix-view instrument-panel" aria-labelledby="matrix-title">
      <div className="instrument-heading">
        <div>
          <p className="eyebrow">20.240 CÉLULAS COMPARATIVAS</p>
          <h2 id="matrix-title">Matriz navegável</h2>
        </div>
        <p>
          Renderização virtualizada: somente as linhas visíveis são desenhadas. Passe o cursor ou
          focalize uma célula para ler o texto integral.
        </p>
      </div>
      <div
        className="matrix-scroll"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        style={{ height: viewportHeight }}
        role="region"
        aria-label={`Matriz com ${visibleTraditions.length} tradições e 44 arquétipos`}
      >
        <div
          className="matrix-inner"
          style={{ height: HEADER_HEIGHT + visibleTraditions.length * ROW_HEIGHT, width }}
        >
          <div className="matrix-header" style={{ height: HEADER_HEIGHT, width }}>
            <span className="matrix-tradition-header">Tradição / cosmovisão</span>
            {data.archetypes.map((archetype, index) => (
              <button
                key={archetype.code}
                style={{ left: 280 + index * 42 }}
                onClick={() => setSelectedArchetypeCode(archetype.code)}
                title={`${archetype.code} — ${archetype.name}`}
              >
                {archetype.code}
              </button>
            ))}
          </div>
          {rows.map((tradition, localIndex) => {
            const absoluteIndex = range.start + localIndex;
            return (
              <div
                key={tradition.id}
                className="matrix-row"
                style={{
                  top: HEADER_HEIGHT + absoluteIndex * ROW_HEIGHT,
                  height: ROW_HEIGHT,
                  width,
                }}
              >
                <button
                  className="matrix-tradition"
                  onClick={() => setSelectedTraditionId(tradition.id)}
                  title={`${tradition.name} · ${tradition.region} · ${tradition.periodLabel}`}
                >
                  <span>{tradition.id}</span>
                  {tradition.name}
                </button>
                {data.archetypes.map((archetype, index) => {
                  const correlation = tradition.correlations[archetype.code];
                  const hidden = correlation.type === "absent" && !showAbsences;
                  return (
                    <button
                      key={archetype.code}
                      className={`matrix-cell cell-${correlation.type} ${hidden ? "cell-hidden" : ""}`}
                      style={{ left: 280 + index * 42 }}
                      onClick={() => {
                        setSelectedTraditionId(tradition.id);
                        setSelectedArchetypeCode(archetype.code);
                      }}
                      aria-label={`${tradition.name}, ${archetype.code}: ${correlation.originalText}`}
                    >
                      <span>{hidden ? "" : CORRELATION_META[correlation.type].symbol}</span>
                      <title>{correlation.originalText}</title>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="matrix-footnote">
        {visibleTraditions.length} tradições no recorte · 44 posições fixas ·{" "}
        {visibleTraditions.length * 44} células filtradas
      </div>
    </section>
  );
}
