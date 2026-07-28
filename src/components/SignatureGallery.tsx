import { useAtlas } from "../state/AtlasProvider";
import { FunctionalSignature } from "./FunctionalSignature";

export function SignatureGallery() {
  const { data, visibleTraditions, comparisonIds, setSelectedTraditionId, toggleComparison } =
    useAtlas();
  const selected = comparisonIds
    .map((id) => data.traditions.find((item) => item.id === id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const traditions = selected.length ? selected : visibleTraditions.slice(0, 24);

  return (
    <section className="signatures-view instrument-panel" aria-labelledby="signatures-title">
      <div className="instrument-heading">
        <div>
          <p className="eyebrow">44 SEGMENTOS, POSIÇÕES CONSTANTES</p>
          <h2 id="signatures-title">Assinaturas funcionais</h2>
        </div>
        <p>
          {selected.length
            ? "Tradições selecionadas para comparação."
            : `Amostra inicial de ${Math.min(24, visibleTraditions.length)} entre ${visibleTraditions.length} tradições do recorte.`}
        </p>
      </div>
      <div className="signature-gallery">
        {traditions.map((tradition) => (
          <article key={tradition.id}>
            <button className="signature-open" onClick={() => setSelectedTraditionId(tradition.id)}>
              <FunctionalSignature
                tradition={tradition}
                archetypes={data.archetypes}
                size={170}
                labelled={false}
              />
              <span>{tradition.id}</span>
              <strong>{tradition.name}</strong>
              <small>
                {tradition.region} · {tradition.periodLabel}
              </small>
            </button>
            <button
              className={
                comparisonIds.includes(tradition.id) ? "compare-chip active" : "compare-chip"
              }
              onClick={() => toggleComparison(tradition.id)}
            >
              {comparisonIds.includes(tradition.id) ? "Selecionada" : "Comparar"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
