import { AlertTriangle, BarChart3, ExternalLink, Scale, Sparkles } from "lucide-react";
import { useMemo } from "react";
import {
  RELIGIOUS_POPULATION_GROUPS,
  RELIGIOUS_POPULATION_SOURCE,
} from "../data/religiousPopulation";
import { useAtlas } from "../state/AtlasProvider";
import type { CorrelationType } from "../types/atlas";
import { buildChartStats, type RankedDatum } from "../utils/charts";
import { formatYear } from "../utils/temporal";

const ACTIVE_TYPES: CorrelationType[] = ["direct", "partial", "impersonal", "uncertain"];

function Ranking({
  title,
  eyebrow,
  items,
  unit,
  caveat,
  onSelect,
}: {
  title: string;
  eyebrow: string;
  items: RankedDatum[];
  unit: string;
  caveat: string;
  onSelect: (item: RankedDatum) => void;
}) {
  const ceiling = Math.max(...items.map((item) => item.value), 1);
  return (
    <article className="charts-card ranking-card">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </header>
      <ol>
        {items.map((item, index) => {
          const content = (
            <>
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
            </>
          );
          return (
            <li key={item.id}>
              <span className="ranking-position">{String(index + 1).padStart(2, "0")}</span>
              {item.target ? (
                <button
                  className="chart-rank-target"
                  type="button"
                  onClick={() => onSelect(item)}
                  aria-label={`Abrir ${item.label}`}
                >
                  {content}
                </button>
              ) : (
                <div>{content}</div>
              )}
            </li>
          );
        })}
      </ol>
      {!items.length && <p className="chart-empty">Sem amostra suficiente neste recorte.</p>}
      <footer className="ranking-caveat">{caveat}</footer>
    </article>
  );
}

export function ChartsLab() {
  const {
    data,
    visibleTraditions,
    selectedYear,
    temporalMode,
    setSelectedTraditionId,
    setSelectedArchetypeCode,
  } = useAtlas();
  const stats = useMemo(
    () => buildChartStats(visibleTraditions, data.archetypes),
    [data.archetypes, visibleTraditions],
  );

  const archetypeCeiling = Math.max(...stats.archetypes.map((item) => item.total), 1);
  function selectRank(item: RankedDatum) {
    if (item.target?.type === "tradition") {
      setSelectedArchetypeCode(undefined);
      setSelectedTraditionId(item.target.id);
    } else if (item.target?.type === "archetype") {
      setSelectedTraditionId(undefined);
      setSelectedArchetypeCode(item.target.id);
    }
  }

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
          caveat="Densidade mede células classificadas; corpus abundante e detalhamento editorial pesam no resultado."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="O SAGRADO SEM ROSTO"
          title="Onde princípios impessoais vencem personagens"
          items={stats.impersonalTraditions}
          unit="◇"
          caveat="Impessoal não significa ateu: marca funções éticas, cósmicas ou não personificadas nesta classificação."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="SEM TRONO NO CÉU"
          title="Matrizes densas sem soberania celeste classificada"
          items={stats.nonSovereignDense}
          unit="funções"
          caveat="A ausência de A03 na matriz não prova inexistência de deuses, transcendência ou autoridade sagrada."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="FRONTEIRA DOCUMENTAL"
          title="Mesmo perfis detalhados ainda admitem dúvida"
          items={stats.uncertainTraditions}
          unit="?"
          caveat="Dúvida explícita é um resultado editorial, não defeito ou fragilidade da tradição."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="FUNÇÕES EM DISPUTA"
          title="Arquétipos que mais atraem hipóteses"
          items={stats.contestedArchetypes}
          unit="?"
          caveat="O ranking mede classificações incertas, incluindo documentação insuficiente e debate interpretativo."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="GÊMEAS IMPROVÁVEIS"
          title="Pares de famílias distintas com assinaturas próximas"
          items={stats.surprisingPairs}
          unit="%"
          caveat="Semelhança funcional ponderada não significa identidade, origem comum, transmissão ou influência histórica."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="QUEM GANHOU MAIS LINHAS?"
          title="As maiores famílias são também escolhas editoriais"
          items={stats.familySize}
          unit="registros"
          caveat="Quantidade de linhas mede granularidade do catálogo; não mede população, antiguidade ou importância."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="ALÉM DAS FRONTEIRAS"
          title="Funções presentes em mais famílias distintas"
          items={stats.crossFamilyArchetypes}
          unit="famílias"
          caveat="Recorrência entre famílias continua sendo classificatória; ela não demonstra um universal psicológico."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="PANTEÃO DAS AUSÊNCIAS"
          title="Funções que mais desaparecem desta matriz"
          items={stats.absentArchetypes}
          unit="—"
          caveat="Ausência significa sem correlato suficientemente documentado neste atlas, nunca ausência absoluta."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="PERIFERIA DA MANDALA"
          title="As funções menos recorrentes do recorte"
          items={stats.rareArchetypes}
          unit="ocorrências"
          caveat="Raridade pode refletir a taxonomia adotada, a documentação disponível ou o período selecionado."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="DÍVIDA EDITORIAL"
          title="Onde o atlas ainda deve respostas específicas"
          items={stats.editorialDebt}
          unit="células"
          caveat="Perfis familiares preservam cobertura ampla, mas suas células provisórias exigem pesquisa tradição por tradição."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="ATENÇÃO BIBLIOGRÁFICA"
          title="Quem recebeu mais portas de entrada documentais?"
          items={stats.sourceRichTraditions}
          unit="fontes"
          caveat="Mais códigos de fonte não significam maior verdade ou melhor documentação interna."
          onSelect={selectRank}
        />
        <Ranking
          eyebrow="DISPERSÃO CATALOGADA"
          title="Famílias que atravessam mais regiões"
          items={stats.familyReach}
          unit="regiões"
          caveat="Região é âncora aproximada de formação/atestação, separada do alcance diaspórico ou mundial."
          onSelect={selectRank}
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
