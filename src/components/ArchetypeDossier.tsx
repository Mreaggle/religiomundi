import { Eye, Route } from "lucide-react";
import { type CSSProperties, useMemo } from "react";
import { useAtlas } from "../state/AtlasProvider";
import type { CorrelationType } from "../types/atlas";
import { CORRELATION_META, countByCorrelation } from "../utils/atlas";
import { getArchetypeVisual } from "./archetypeVisuals";
import { DrawerShell } from "./DrawerShell";

export function ArchetypeDossier() {
  const {
    selectedArchetype: archetype,
    setSelectedArchetypeCode,
    visibleTraditions,
    setSelectedTraditionId,
    setRevealPatterns,
    setTraceRecurrences,
  } = useAtlas();
  const counts = useMemo(
    () =>
      archetype
        ? countByCorrelation(visibleTraditions, archetype.code)
        : ({
            direct: 0,
            partial: 0,
            impersonal: 0,
            uncertain: 0,
            absent: 0,
          } as Record<CorrelationType, number>),
    [archetype, visibleTraditions],
  );
  if (!archetype) return null;
  const visual = getArchetypeVisual(archetype.code);
  const ArchetypeIcon = visual.icon;
  const related = visibleTraditions
    .filter((tradition) => tradition.correlations[archetype.code].type !== "absent")
    .sort(
      (a, b) =>
        ["direct", "partial", "impersonal", "uncertain"].indexOf(
          a.correlations[archetype.code].type,
        ) -
        ["direct", "partial", "impersonal", "uncertain"].indexOf(
          b.correlations[archetype.code].type,
        ),
    );

  return (
    <DrawerShell
      eyebrow="DOSSIÊ DO ARQUÉTIPO"
      title={`${archetype.code} — ${archetype.name}`}
      onClose={() => setSelectedArchetypeCode(undefined)}
    >
      <div
        className="archetype-seal"
        style={{ "--archetype-color": visual.color } as CSSProperties}
        role="img"
        aria-label={`${archetype.code}: glifo de interface ${visual.iconLabel}; família cromática ${visual.colorFamily}`}
      >
        <ArchetypeIcon aria-hidden="true" />
        <span>{archetype.code}</span>
        <i />
        <i />
      </div>
      <p className="archetype-visual-note">
        Glifo de interface: {visual.iconLabel} · Família cromática: {visual.colorFamily}. Não é um
        símbolo sagrado atribuído à tradição.
      </p>
      <section className="definition-block">
        <h3>Critério de inclusão</h3>
        <p>{archetype.inclusionCriteria}</p>
        <h3>Evitar / não confundir</h3>
        <p>{archetype.avoidConfusion}</p>
      </section>
      <div className="archetype-counts">
        {(Object.keys(CORRELATION_META) as CorrelationType[]).map((type) => (
          <span key={type}>
            <b style={{ color: CORRELATION_META[type].color }}>{CORRELATION_META[type].symbol}</b>
            <strong>{counts[type]}</strong>
            <small>{CORRELATION_META[type].label}</small>
          </span>
        ))}
      </div>
      <div className="dossier-actions">
        <button
          onClick={() => {
            setTraceRecurrences(false);
            setRevealPatterns(true);
          }}
        >
          <Eye size={15} /> Revelar padrões
        </button>
        <button
          onClick={() => {
            setTraceRecurrences(true);
            setRevealPatterns(true);
          }}
        >
          <Route size={15} /> Traçar recorrências
        </button>
      </div>
      <section className="archetype-relations">
        <h3>Tradições relacionadas neste recorte</h3>
        <div>
          {related.map((tradition) => {
            const correlation = tradition.correlations[archetype.code];
            return (
              <button key={tradition.id} onClick={() => setSelectedTraditionId(tradition.id)}>
                <span>
                  <b>{tradition.name}</b>
                  <small>
                    {tradition.region} · {tradition.periodLabel}
                  </small>
                </span>
                <em className={`relation-${correlation.type}`}>
                  {CORRELATION_META[correlation.type].symbol}
                </em>
                <p>{correlation.originalText}</p>
              </button>
            );
          })}
        </div>
      </section>
      <p className="mirror-caveat">
        A posição deste nó é fixa e sua intensidade deriva apenas das correlações classificadas no
        período atual.
      </p>
    </DrawerShell>
  );
}
