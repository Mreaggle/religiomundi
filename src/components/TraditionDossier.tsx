import {
  CalendarRange,
  Compass,
  ExternalLink,
  GitCompareArrows,
  MapPin,
  Orbit,
  ScrollText,
} from "lucide-react";
import { useMemo } from "react";
import { useAtlas } from "../state/AtlasProvider";
import type { CorrelationType } from "../types/atlas";
import { CORRELATION_META, functionalSimilarity } from "../utils/atlas";
import { DrawerShell } from "./DrawerShell";
import { FunctionalSignature } from "./FunctionalSignature";

export function TraditionDossier() {
  const {
    data,
    selectedTradition: tradition,
    setSelectedTraditionId,
    setSelectedArchetypeCode,
    comparisonIds,
    toggleComparison,
    setComparisonOpen,
    setViewMode,
    clearSelection,
  } = useAtlas();
  const related = useMemo(() => {
    if (!tradition) return [];
    return data.traditions
      .filter((item) => item.id !== tradition.id)
      .map((item) => ({ tradition: item, similarity: functionalSimilarity(tradition, item) }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);
  }, [data.traditions, tradition]);
  if (!tradition) return null;

  const groups = (Object.keys(CORRELATION_META) as CorrelationType[]).map((type) => ({
    type,
    items: data.archetypes
      .map((archetype) => ({
        archetype,
        correlation: tradition.correlations[archetype.code],
      }))
      .filter((item) => item.correlation.type === type),
  }));
  const inComparison = comparisonIds.includes(tradition.id);

  return (
    <DrawerShell eyebrow="DOSSIÊ DA TRADIÇÃO" title={tradition.name} onClose={clearSelection}>
      <div className="dossier-identity">
        <span>{tradition.id}</span>
        <span>{tradition.family}</span>
        <span>{tradition.status}</span>
      </div>
      <FunctionalSignature tradition={tradition} archetypes={data.archetypes} />
      <div className="dossier-actions">
        <button
          onClick={() => toggleComparison(tradition.id)}
          className={inComparison ? "active" : ""}
        >
          <GitCompareArrows size={16} />
          {inComparison ? "Remover da comparação" : "Adicionar à comparação"}
        </button>
        {comparisonIds.length >= 2 && (
          <button onClick={() => setComparisonOpen(true)}>Abrir câmara</button>
        )}
      </div>

      <dl className="metadata-grid">
        <div>
          <dt>
            <MapPin size={13} /> Origem / formação
          </dt>
          <dd>
            {tradition.region}
            <small>
              Âncora regional ampla; não representa um ponto arqueológico ou fronteira precisa.
            </small>
          </dd>
        </div>
        <div>
          <dt>
            <Orbit size={13} /> Alcance registrado
          </dt>
          <dd>
            {tradition.distributionLabel}
            <small>
              {tradition.geographicReach === "global"
                ? "Presença global; a origem histórica continua indicada separadamente."
                : tradition.geographicReach === "diasporic"
                  ? "Presença diaspórica; não substitui a região de formação."
                  : tradition.geographicReach === "multi-regional"
                    ? "Formação ou presença catalogada em mais de uma região."
                    : "Distribuição regional catalogada."}
            </small>
          </dd>
        </div>
        <div>
          <dt>
            <CalendarRange size={13} /> Período / atestação
          </dt>
          <dd>
            {tradition.periodLabel}
            <small>
              {tradition.temporalPrecision} ·{" "}
              {tradition.parsingNotes || "Texto convertido sem ressalva adicional."}
            </small>
          </dd>
        </div>
        <div>
          <dt>
            <Orbit size={13} /> Tipo
          </dt>
          <dd>{tradition.type}</dd>
        </div>
        <div>
          <dt>
            <ScrollText size={13} /> Cobertura
          </dt>
          <dd>
            {tradition.coverage}
            <small>
              {tradition.mappingScope === "family"
                ? `Perfil de família: ${tradition.individualizedCells} de 44 células individualizadas.`
                : `${tradition.individualizedCells} de 44 células individualizadas.`}{" "}
              Cobertura documental não representa validade religiosa.
            </small>
          </dd>
        </div>
        <div>
          <dt>
            <Compass size={13} /> Base geográfica
          </dt>
          <dd>
            {tradition.originBasis === "editorial-broad-region"
              ? "Região formativa ampla, normalizada editorialmente"
              : "Região derivada diretamente do catálogo"}
            <small>
              A classificação evita transformar expansão mundial em um local de origem fictício.
            </small>
          </dd>
        </div>
      </dl>
      {tradition.mappingScope === "family" && (
        <section className="scope-note mapping-audit-note">
          <h3>Mapeamento provisório</h3>
          <p>
            As células ainda herdadas do perfil de família aparecem como hipóteses, não como
            equivalências próprias desta tradição. Somente as funções individualizadas recebem
            classificação mais forte.
          </p>
        </section>
      )}
      {tradition.scopeNote && (
        <section className="scope-note">
          <h3>Nota de escopo</h3>
          <p>{tradition.scopeNote}</p>
        </section>
      )}

      <section className="dossier-sources">
        <h3>Fontes associadas</h3>
        <div>
          {tradition.sourceCodes.map((code) => {
            const source = data.sources.find((item) => item.code === code);
            return (
              <button
                key={code}
                onClick={() => {
                  window.location.hash = `source-${code}`;
                  setViewMode("sources");
                  setSelectedTraditionId(undefined);
                }}
                title={source?.title}
              >
                {code} <ExternalLink size={12} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="correlation-groups">
        <h3>Distribuição das 44 funções</h3>
        {groups.map(({ type, items }) => (
          <details key={type} open={type === "direct"}>
            <summary>
              <span style={{ color: CORRELATION_META[type].color }}>
                {CORRELATION_META[type].symbol} {CORRELATION_META[type].label}
              </span>
              <b>{items.length}</b>
            </summary>
            <div>
              {items.map(({ archetype, correlation }) => (
                <button
                  key={archetype.code}
                  onClick={() => setSelectedArchetypeCode(archetype.code)}
                >
                  <span>
                    {archetype.code} — {archetype.name}
                  </span>
                  <p>{correlation.originalText}</p>
                </button>
              ))}
            </div>
          </details>
        ))}
      </section>

      <section className="related-traditions">
        <h3>Proximidade funcional neste índice</h3>
        {related.map(({ tradition: item, similarity }) => (
          <button key={item.id} onClick={() => setSelectedTraditionId(item.id)}>
            <span>
              <b>{item.name}</b>
              <small>
                {item.region} · {item.periodLabel}
              </small>
            </span>
            <em>{Math.round(similarity * 100)}%</em>
          </button>
        ))}
        <p>Função semelhante não significa entidade idêntica, origem comum ou influência direta.</p>
      </section>
    </DrawerShell>
  );
}
