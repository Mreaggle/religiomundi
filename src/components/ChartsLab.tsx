import { AlertTriangle, BarChart3, ExternalLink, Scale, Sparkles } from "lucide-react";
import { useMemo } from "react";
import {
  RELIGIOUS_POPULATION_GROUPS,
  RELIGIOUS_POPULATION_SOURCE,
} from "../data/religiousPopulation";
import { useAtlas } from "../state/AtlasProvider";
import type { CorrelationType, Tradition } from "../types/atlas";
import { formatYear } from "../utils/temporal";

const ACTIVE_TYPES: CorrelationType[] = ["direct", "partial", "impersonal", "uncertain"];

interface RankedValue {
  id: string;
  label: string;
  value: number;
  detail: string;
}

function supportedCount(tradition: Tradition): number {
  return tradition.counts.direct + tradition.counts.partial + tradition.counts.impersonal;
}

function Ranking({
  title,
  eyebrow,
  items,
  unit,
}: {
  title: string;
  eyebrow: string;
  items: RankedValue[];
  unit: string;
}) {
  const ceiling = Math.max(...items.map((item) => item.value), 1);
  return (
    <article className="charts-card ranking-card">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </header>
      <ol>
        {items.map((item, index) => (
          <li key={item.id}>
            <span className="ranking-position">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <span>
                <strong>{item.label}</strong>
                <b>
                  {item.value.toLocaleString("pt-BR")} {unit}
                </b>
              </span>
              <i>
                <em style={{ width: `${Math.max(1.5, (item.value / ceiling) * 100)}%` }} />
              </i>
              <small>{item.detail}</small>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function ChartsLab() {
  const { data, visibleTraditions, selectedYear, temporalMode } = useAtlas();
  const stats = useMemo(() => {
    const dense = visibleTraditions
      .map((tradition) => ({
        id: tradition.id,
        label: tradition.name,
        value: supportedCount(tradition),
        detail: `${tradition.coverage} · ${tradition.family}`,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"))
      .slice(0, 10);

    const uncertain = visibleTraditions
      .filter(
        (tradition) =>
          tradition.counts.uncertain > 0 &&
          tradition.individualizedCells > 0 &&
          tradition.coverage.toLocaleLowerCase("pt-BR").includes("detalhado"),
      )
      .map((tradition) => ({
        id: tradition.id,
        label: tradition.name,
        value: tradition.counts.uncertain,
        detail: `${tradition.individualizedCells} células individualizadas · ${tradition.coverage}`,
      }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"))
      .slice(0, 10);

    const archetypes = data.archetypes
      .map((archetype) => {
        const counts: Record<CorrelationType, number> = {
          direct: 0,
          partial: 0,
          impersonal: 0,
          uncertain: 0,
          absent: 0,
        };
        for (const tradition of visibleTraditions) {
          const type = tradition.correlations[archetype.code]?.type;
          if (type) counts[type] += 1;
        }
        return {
          ...archetype,
          counts,
          total: ACTIVE_TYPES.reduce((sum, type) => sum + counts[type], 0),
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    const families = new Map<string, { traditions: number; regions: Set<string> }>();
    for (const tradition of visibleTraditions) {
      const current = families.get(tradition.family) ?? { traditions: 0, regions: new Set() };
      current.traditions += 1;
      current.regions.add(tradition.region);
      families.set(tradition.family, current);
    }
    const reach = [...families.entries()]
      .map(([label, item]) => ({
        id: label,
        label,
        value: item.regions.size,
        detail: `${item.traditions} tradições catalogadas no recorte`,
      }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"))
      .slice(0, 10);

    return { dense, uncertain, archetypes, reach };
  }, [data.archetypes, visibleTraditions]);

  const archetypeCeiling = Math.max(...stats.archetypes.map((item) => item.total), 1);

  return (
    <section className="charts-lab instrument-panel" aria-labelledby="charts-title">
      <div className="instrument-heading charts-heading">
        <div>
          <p className="eyebrow">LEITURAS INCÔMODAS · RESULTADOS REPRODUZÍVEIS</p>
          <h2 id="charts-title">CHARTS — Anatomia comparada do sagrado</h2>
        </div>
        <p>
          Rankings calculados sem IA generativa. O recorte do atlas responde à linha do tempo; a
          demografia mundial é uma série externa, agregada e datada.
        </p>
      </div>

      <div className="charts-context" role="status">
        <BarChart3 aria-hidden="true" />
        <span>
          {visibleTraditions.length} tradições · {formatYear(selectedYear)} ·{" "}
          {temporalMode === "catalog" ? "catálogo integral" : "recorte temporal"}
        </span>
        <strong>Ranking não mede verdade, valor ou influência espiritual.</strong>
      </div>

      <div className="charts-grid">
        <article className="charts-card population-ranking">
          <header>
            <p className="eyebrow">DEMOGRAFIA GLOBAL · ESTIMATIVA 2020</p>
            <h3>Quem reúne mais pessoas?</h3>
            <span>Grupos religiosos mundiais — não países</span>
          </header>
          <ol>
            {RELIGIOUS_POPULATION_GROUPS.map((group, index) => (
              <li key={group.id} className={group.isReligion ? "" : "nonreligious"}>
                <span className="ranking-position">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <span>
                    <strong>{group.name}</strong>
                    <b>{group.share.toFixed(1).replace(".", ",")}%</b>
                  </span>
                  <i>
                    <em style={{ width: `${(group.share / 28.8) * 100}%` }} />
                  </i>
                  <small>
                    {group.populationLabel} · {group.note}
                  </small>
                </div>
              </li>
            ))}
          </ol>
          <footer>
            <p>
              <AlertTriangle aria-hidden="true" />
              “Sem filiação” não é religião. “Outras religiões” reúne tradições muito diferentes e
              oculta sua diversidade interna.
            </p>
            <a href={RELIGIOUS_POPULATION_SOURCE.url} target="_blank" rel="noreferrer">
              {RELIGIOUS_POPULATION_SOURCE.institution}, publicado em{" "}
              {RELIGIOUS_POPULATION_SOURCE.publishedYear}
              <ExternalLink aria-hidden="true" />
            </a>
          </footer>
        </article>

        <article className="charts-card archetype-ranking">
          <header>
            <p className="eyebrow">RECORRÊNCIA NO RECORTE</p>
            <h3>As perguntas que mais retornam</h3>
          </header>
          <ol>
            {stats.archetypes.map((archetype, index) => (
              <li key={archetype.code}>
                <span>{archetype.code}</span>
                <div>
                  <strong>
                    {index + 1}. {archetype.name}
                  </strong>
                  <i role="img" aria-label={`${archetype.total} tradições classificadas`}>
                    {ACTIVE_TYPES.map((type) => (
                      <em
                        key={type}
                        className={`chart-segment chart-${type}`}
                        style={{
                          width: `${(archetype.counts[type] / archetypeCeiling) * 100}%`,
                        }}
                      />
                    ))}
                  </i>
                  <small>
                    {archetype.total} ocorrências · {archetype.counts.direct} diretas ·{" "}
                    {archetype.counts.partial} parciais
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <Ranking
          eyebrow="DENSIDADE DA MATRIZ"
          title="Mais funções sustentadas — ou mais favorecidas pelas fontes?"
          items={stats.dense}
          unit="funções"
        />
        <Ranking
          eyebrow="FRONTEIRA DOCUMENTAL"
          title="Mesmo perfis detalhados ainda admitem dúvida"
          items={stats.uncertain}
          unit="?"
        />
        <Ranking
          eyebrow="DISPERSÃO CATALOGADA"
          title="Famílias que atravessam mais regiões"
          items={stats.reach}
          unit="regiões"
        />

        <article className="charts-card chart-manifesto">
          <Scale aria-hidden="true" />
          <h3>O placar não é o território</h3>
          <p>
            Uma posição alta pode refletir corpus abundante, maior detalhamento editorial ou
            categorias agregadas. Uma posição baixa pode refletir documentação fragmentária — não
            menor complexidade religiosa.
          </p>
          <span>
            <Sparkles aria-hidden="true" />
            Compare padrões. Preserve nomes, história e assimetrias.
          </span>
        </article>
      </div>
    </section>
  );
}
