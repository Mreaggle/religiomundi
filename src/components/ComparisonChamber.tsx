import { GitCompareArrows, MapPin, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useAtlas } from "../state/AtlasProvider";
import { CORRELATION_META } from "../utils/atlas";
import { formatYear } from "../utils/temporal";
import { FunctionalSignature } from "./FunctionalSignature";
import { ModalShell } from "./ModalShell";

export function ComparisonChamber() {
  const {
    data,
    comparisonIds,
    toggleComparison,
    comparisonOpen,
    setComparisonOpen,
    setSelectedTraditionId,
  } = useAtlas();
  const traditions = comparisonIds
    .map((id) => data.traditions.find((tradition) => tradition.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const shared = useMemo(
    () =>
      data.archetypes.filter((archetype) =>
        traditions.every((tradition) => tradition.correlations[archetype.code].type !== "absent"),
      ),
    [data.archetypes, traditions],
  );
  const exclusive = useMemo(
    () =>
      data.archetypes.filter(
        (archetype) =>
          traditions.filter((tradition) => tradition.correlations[archetype.code].type !== "absent")
            .length === 1,
      ),
    [data.archetypes, traditions],
  );
  if (!comparisonOpen) return null;

  return (
    <ModalShell
      title="CÂMARA DE COMPARAÇÃO"
      onClose={() => setComparisonOpen(false)}
      className="comparison-chamber"
    >
      <div className="comparison-warning">
        <GitCompareArrows size={18} />
        <strong>
          Função semelhante não significa entidade idêntica, origem comum ou influência direta.
        </strong>
      </div>
      {traditions.length < 2 ? (
        <div className="empty-comparison">
          <p>Selecione de duas a quatro tradições nos dossiês para abrir a comparação.</p>
        </div>
      ) : (
        <>
          <div className="comparison-signatures">
            {traditions.map((tradition) => (
              <article key={tradition.id}>
                <button
                  className="remove-comparison"
                  onClick={() => toggleComparison(tradition.id)}
                  aria-label={`Remover ${tradition.name}`}
                >
                  <Trash2 size={14} />
                </button>
                <FunctionalSignature
                  tradition={tradition}
                  archetypes={data.archetypes}
                  size={150}
                  labelled={false}
                />
                <button
                  className="comparison-name"
                  onClick={() => {
                    setSelectedTraditionId(tradition.id);
                    setComparisonOpen(false);
                  }}
                >
                  <span>{tradition.id}</span>
                  <strong>{tradition.name}</strong>
                </button>
                <p>
                  <MapPin size={12} /> {tradition.region}
                </p>
                <small>{tradition.periodLabel}</small>
                <dl>
                  <div>
                    <dt>Cobertura</dt>
                    <dd>{tradition.coverage}</dd>
                  </div>
                  <div>
                    <dt>Fontes</dt>
                    <dd>{tradition.sourceCodes.join(", ") || "não indicada"}</dd>
                  </div>
                  <div>
                    <dt>Impessoais</dt>
                    <dd>{tradition.counts.impersonal}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="comparison-summary">
            <span>
              <strong>{shared.length}</strong> funções compartilhadas
            </span>
            <span>
              <strong>{exclusive.length}</strong> funções exclusivas
            </span>
            <span>
              <strong>{new Set(traditions.map((item) => item.region)).size}</strong> regiões
            </span>
            <span>
              <strong>
                {traditions.every((item) => item.startYear !== undefined)
                  ? `${Math.max(...traditions.map((item) => item.startYear ?? 0)) - Math.min(...traditions.map((item) => item.startYear ?? 0))} anos`
                  : "indeterminada"}
              </strong>{" "}
              distância entre inícios de navegação
            </span>
          </div>

          <section className="shared-functions">
            <h3>Funções compartilhadas e textos originais</h3>
            {shared.map((archetype) => (
              <details key={archetype.code}>
                <summary>
                  <span>
                    {archetype.code} — {archetype.name}
                  </span>
                  <b>{traditions.length} ocorrências</b>
                </summary>
                <div
                  className="comparison-cells"
                  style={{
                    gridTemplateColumns: `repeat(${traditions.length}, minmax(210px, 1fr))`,
                  }}
                >
                  {traditions.map((tradition) => {
                    const correlation = tradition.correlations[archetype.code];
                    return (
                      <article key={tradition.id}>
                        <span>
                          <b style={{ color: CORRELATION_META[correlation.type].color }}>
                            {CORRELATION_META[correlation.type].symbol}
                          </b>
                          {tradition.name}
                        </span>
                        <p>{correlation.originalText}</p>
                        <small>
                          {tradition.region} · {tradition.periodLabel}
                        </small>
                      </article>
                    );
                  })}
                </div>
              </details>
            ))}
          </section>
          <p className="comparison-method">
            As tradições acima apresentam elementos classificados nas mesmas funções comparativas.
            Os períodos originais foram preservados; os inícios numéricos são apenas instrumentos
            conservadores de navegação (
            {traditions
              .map((item) => (item.startYear ? formatYear(item.startYear) : "indeterminado"))
              .join(" · ")}
            ).
          </p>
        </>
      )}
    </ModalShell>
  );
}
