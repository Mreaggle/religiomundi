import { ArrowRight, MapPinned, Route, Sparkles, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useAtlas } from "../state/AtlasProvider";
import { CORRELATION_META, countByCorrelation } from "../utils/atlas";
import { formatYear } from "../utils/temporal";

export function PatternRevelation() {
  const {
    data,
    visibleTraditions,
    selectedArchetype,
    selectedArchetypeCode,
    setSelectedArchetypeCode,
    setSelectedTraditionId,
    setRevealPatterns,
    traceRecurrences,
    setTraceRecurrences,
  } = useAtlas();

  const topCode = useMemo(
    () =>
      [...data.archetypes]
        .map((archetype) => ({
          code: archetype.code,
          count: Object.values(countByCorrelation(visibleTraditions, archetype.code))
            .slice(0, 4)
            .reduce((sum, value) => sum + value, 0),
        }))
        .sort((a, b) => b.count - a.count)[0]?.code,
    [data.archetypes, visibleTraditions],
  );

  useEffect(() => {
    if (!selectedArchetypeCode && topCode) setSelectedArchetypeCode(topCode);
  }, [selectedArchetypeCode, setSelectedArchetypeCode, topCode]);

  if (!selectedArchetype) return null;
  const results = visibleTraditions
    .filter((tradition) => tradition.correlations[selectedArchetype.code].type !== "absent")
    .sort((a, b) =>
      traceRecurrences
        ? (a.startYear ?? data.metadata.currentYear) - (b.startYear ?? data.metadata.currentYear)
        : a.name.localeCompare(b.name, "pt-BR"),
    );

  return (
    <section className="pattern-revelation" aria-labelledby="revelation-title">
      <header>
        <div>
          <p className="eyebrow">MOMENTO DE REVELAÇÃO</p>
          <h2 id="revelation-title">Veja os nomes. Compare as funções. Preserve as diferenças.</h2>
          <p>
            Uma função recorrente não torna entidades distintas idênticas. Ela revela diferentes
            respostas humanas a questões comparáveis.
          </p>
        </div>
        <button
          className="icon-button"
          onClick={() => setRevealPatterns(false)}
          aria-label="Fechar revelação"
        >
          <X size={19} />
        </button>
      </header>

      <div className="revelation-controls">
        <label>
          Função comparativa
          <select
            value={selectedArchetype.code}
            onChange={(event) => setSelectedArchetypeCode(event.target.value)}
          >
            {data.archetypes.map((archetype) => (
              <option key={archetype.code} value={archetype.code}>
                {archetype.code} — {archetype.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className={traceRecurrences ? "active" : ""}
          onClick={() => setTraceRecurrences(!traceRecurrences)}
        >
          <Route size={16} /> Traçar recorrências
        </button>
        <span>{results.length} nomes relacionados no recorte</span>
      </div>

      <div className="revelation-stage">
        <div className="revelation-core">
          <div className="revelation-orbits" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <Sparkles size={23} />
          <strong>{selectedArchetype.code}</strong>
          <span>{selectedArchetype.name}</span>
          <p>{selectedArchetype.inclusionCriteria}</p>
        </div>

        <div className={`revelation-results ${traceRecurrences ? "tracing" : ""}`}>
          {results.map((tradition, index) => {
            const correlation = tradition.correlations[selectedArchetype.code];
            return (
              <article key={tradition.id}>
                {traceRecurrences && (
                  <span className="trace-index">{String(index + 1).padStart(2, "0")}</span>
                )}
                <div className="revelation-link" aria-hidden="true">
                  <i style={{ background: CORRELATION_META[correlation.type].color }} />
                  <ArrowRight size={13} />
                </div>
                <button onClick={() => setSelectedTraditionId(tradition.id)}>
                  <span className={`relation-${correlation.type}`}>
                    {CORRELATION_META[correlation.type].symbol}{" "}
                    {CORRELATION_META[correlation.type].label}
                  </span>
                  <h3>{correlation.displayLabel}</h3>
                  <strong>{tradition.name}</strong>
                  <p>{correlation.originalText}</p>
                  <dl>
                    <div>
                      <dt>
                        <MapPinned size={12} /> Região
                      </dt>
                      <dd>{tradition.region}</dd>
                    </div>
                    <div>
                      <dt>Período / atestação</dt>
                      <dd>{tradition.periodLabel}</dd>
                    </div>
                    <div>
                      <dt>Fontes</dt>
                      <dd>{tradition.sourceCodes.join(", ") || "não indicada"}</dd>
                    </div>
                    <div>
                      <dt>Cobertura</dt>
                      <dd>{tradition.coverage}</dd>
                    </div>
                  </dl>
                </button>
                {traceRecurrences && (
                  <footer>
                    <span>
                      âncora de navegação:{" "}
                      {tradition.startYear !== undefined
                        ? formatYear(tradition.startYear)
                        : "indeterminada"}
                    </span>
                    <b>Sem relação histórica direta demonstrada nos dados.</b>
                  </footer>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <footer className="revelation-caveat">
        Semelhança classificatória, não equivalência teológica. Os nomes permanecem ligados às suas
        tradições, regiões, períodos, classificações e fontes.
      </footer>
    </section>
  );
}
