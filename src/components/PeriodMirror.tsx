import { Activity, BookMarked, Compass, Layers3 } from "lucide-react";
import { useMemo } from "react";
import { useAtlas } from "../state/AtlasProvider";
import type { CorrelationType } from "../types/atlas";
import { CORRELATION_META, countByCorrelation } from "../utils/atlas";
import { chronologyForYear, formatYear } from "../utils/temporal";
import { formatCount } from "../utils/text";

export function PeriodMirror() {
  const { data, visibleTraditions, selectedYear, temporalMode } = useAtlas();
  const period = chronologyForYear(data.chronology, selectedYear);
  const stats = useMemo(() => {
    const relationTotals: Record<CorrelationType, number> = {
      direct: 0,
      partial: 0,
      impersonal: 0,
      uncertain: 0,
      absent: 0,
    };
    const archetypeTotals = data.archetypes.map((archetype) => {
      const counts = countByCorrelation(visibleTraditions, archetype.code);
      for (const type of Object.keys(counts) as CorrelationType[]) {
        relationTotals[type] += counts[type];
      }
      return {
        ...archetype,
        count: counts.direct + counts.partial + counts.impersonal + counts.uncertain,
        counts,
      };
    });
    const families = new Map<string, number>();
    const coverages = new Map<string, number>();
    const sourceCodes = new Set<string>();
    for (const tradition of visibleTraditions) {
      families.set(tradition.family, (families.get(tradition.family) ?? 0) + 1);
      coverages.set(tradition.coverage, (coverages.get(tradition.coverage) ?? 0) + 1);
      tradition.sourceCodes.forEach((code) => {
        sourceCodes.add(code);
      });
    }
    return {
      relationTotals,
      top: archetypeTotals.sort((a, b) => b.count - a.count).slice(0, 3),
      regions: new Set(visibleTraditions.map((item) => item.region)).size,
      families: [...families.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
      coverages: [...coverages.entries()].sort((a, b) => b[1] - a[1]),
      sources: sourceCodes.size,
      documentaryFloor: visibleTraditions.filter(
        (tradition) => tradition.visibilityBasis === "living-documentary-floor",
      ).length,
    };
  }, [data.archetypes, visibleTraditions]);
  const classified =
    stats.relationTotals.direct +
    stats.relationTotals.partial +
    stats.relationTotals.impersonal +
    stats.relationTotals.uncertain;

  return (
    <aside className="period-mirror" aria-labelledby="mirror-title">
      <div className="mirror-heading">
        <p className="eyebrow">LEITURA DETERMINÍSTICA</p>
        <h2 id="mirror-title">O Espelho do Período</h2>
        <span>
          {formatYear(selectedYear)} ·{" "}
          {temporalMode === "panorama"
            ? "Panorama"
            : temporalMode === "emergences"
              ? "Emergências"
              : "Catálogo completo"}
        </span>
      </div>
      <div className="mirror-primary">
        <strong>{formatCount(visibleTraditions.length)}</strong>
        <span>tradições no recorte</span>
      </div>
      <div className="mirror-grid">
        <span>
          <Compass size={14} />
          <b>{stats.regions}</b> regiões catalogadas
        </span>
        <span>
          <Layers3 size={14} />
          <b>{stats.families.length ? stats.families[0][1] : 0}</b> na família líder
        </span>
        <span>
          <BookMarked size={14} />
          <b>{stats.sources}</b> códigos de fonte
        </span>
        <span>
          <Activity size={14} />
          <b>{formatCount(classified)}</b> relações ativas
        </span>
      </div>

      <div className="mirror-statement">
        {stats.top[0] ? (
          <p>
            Neste recorte, <strong>{stats.top[0].name}</strong> aparece documentada em{" "}
            {stats.top[0].count} tradições visíveis.
          </p>
        ) : (
          <p>Nenhuma tradição corresponde aos filtros neste recorte.</p>
        )}
        {stats.top[1] && (
          <p>
            {stats.top[1].name} possui {stats.top[1].counts.direct} correlações diretas e{" "}
            {stats.top[1].counts.partial} parciais.
          </p>
        )}
        {temporalMode === "panorama" && stats.documentaryFloor > 0 && (
          <p>
            <strong>{stats.documentaryFloor} tradições vivas com início não convertível</strong>{" "}
            permanecem neste panorama por um piso documental conservador. O marco técnico não
            representa origem, fundação ou primeira atestação.
          </p>
        )}
      </div>

      <div
        className="relation-meter"
        role="group"
        aria-label="Distribuição dos tipos de correlação"
      >
        {(Object.keys(CORRELATION_META) as CorrelationType[])
          .filter((type) => type !== "absent")
          .map((type) => {
            const value = stats.relationTotals[type];
            const percent = classified ? (value / classified) * 100 : 0;
            return (
              <div key={type}>
                <span>
                  {CORRELATION_META[type].symbol} {CORRELATION_META[type].label}
                  <b>{percent.toFixed(1)}%</b>
                </span>
                <i>
                  <em style={{ width: `${percent}%`, background: CORRELATION_META[type].color }} />
                </i>
              </div>
            );
          })}
      </div>

      <div className="mirror-list">
        <h3>Famílias mais representadas</h3>
        {stats.families.map(([name, count]) => (
          <span key={name}>
            {name} <b>{count}</b>
          </span>
        ))}
      </div>
      <p className="mirror-caveat">
        As semelhanças exibidas são funcionais; os dados não demonstram origem histórica comum.
        Ausência na matriz não significa ausência absoluta na tradição.
      </p>
      <div className="period-context">
        <h3>{period.name}</h3>
        <p>{period.documentedChanges}</p>
        <small>{period.limitations}</small>
      </div>
    </aside>
  );
}
