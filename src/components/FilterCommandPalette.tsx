import { ArrowUpRight, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useAtlas } from "../state/AtlasProvider";
import type { AtlasFilters, CorrelationType, Tradition } from "../types/atlas";
import { CORRELATION_META, traditionSearchText } from "../utils/atlas";
import { foldText } from "../utils/text";
import { ModalShell } from "./ModalShell";

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function FilterCommandPalette({ onClose }: { onClose: () => void }) {
  const {
    data,
    filters,
    setFilters,
    clearFilters,
    setSelectedTraditionId,
    setSelectedArchetypeCode,
    setSelectedYear,
    setTemporalMode,
    setViewMode,
  } = useAtlas();
  const query = foldText(filters.query.trim());
  const results = useMemo(() => {
    if (!query) return [];
    return data.traditions
      .map((tradition) => {
        const directMeta = foldText(
          `${tradition.id} ${tradition.name} ${tradition.family} ${tradition.region}`,
        ).includes(query);
        const correlationMatch = data.archetypes.find((archetype) =>
          foldText(
            `${archetype.code} ${archetype.name} ${tradition.correlations[archetype.code].originalText}`,
          ).includes(query),
        );
        const match =
          directMeta ||
          correlationMatch ||
          traditionSearchText(tradition, data.archetypes).includes(query);
        return match ? { tradition, correlationMatch, directMeta } : null;
      })
      .filter(
        (
          item,
        ): item is {
          tradition: Tradition;
          correlationMatch: (typeof data.archetypes)[number] | undefined;
          directMeta: boolean;
        } => Boolean(item),
      )
      .sort((a, b) => Number(b.directMeta) - Number(a.directMeta))
      .slice(0, 60);
  }, [data.archetypes, data.traditions, query]);

  const options = useMemo(
    () => ({
      families: unique(data.traditions.map((item) => item.family)),
      regions: unique(data.traditions.map((item) => item.region)),
      types: unique(data.traditions.map((item) => item.type)),
      statuses: unique(data.traditions.map((item) => item.status)),
      coverages: unique(data.traditions.map((item) => item.coverage)),
    }),
    [data.traditions],
  );

  function set<K extends keyof AtlasFilters>(key: K, value: AtlasFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function selectResult(tradition: Tradition, archetype?: (typeof data.archetypes)[number]) {
    setSelectedTraditionId(tradition.id);
    if (archetype) setSelectedArchetypeCode(archetype.code);
    setTemporalMode("panorama");
    const targetYear =
      tradition.isStillActive && tradition.endYear === data.metadata.currentYear
        ? data.metadata.currentYear
        : (tradition.startYear ?? data.metadata.currentYear);
    setSelectedYear(targetYear);
    setViewMode("constellation");
    onClose();
  }

  return (
    <ModalShell title="INVESTIGAR O ARQUIVO" onClose={onClose} className="filter-palette">
      <div className="command-search">
        <Search size={19} />
        <label className="sr-only" htmlFor="global-search">
          Busca global
        </label>
        <input
          id="global-search"
          value={filters.query}
          onChange={(event) => set("query", event.target.value)}
          placeholder="Tradição, entidade, arquétipo, região, fonte…"
        />
        {filters.query && <span>{results.length} resultados examináveis</span>}
      </div>

      {query && (
        <div className="command-results" role="region" aria-label="Resultados da busca">
          {results.length ? (
            results.map(({ tradition, correlationMatch }) => (
              <button key={tradition.id} onClick={() => selectResult(tradition, correlationMatch)}>
                <span className="result-code">{tradition.id}</span>
                <span>
                  <strong>{tradition.name}</strong>
                  <small>
                    {tradition.region} · {tradition.periodLabel}
                  </small>
                  {correlationMatch && (
                    <em>
                      {correlationMatch.code} — {correlationMatch.name}:{" "}
                      {tradition.correlations[correlationMatch.code].originalText}
                    </em>
                  )}
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))
          ) : (
            <p className="empty-state">
              Nenhum termo foi encontrado no catálogo ou nas 20.240 células.
            </p>
          )}
        </div>
      )}

      <div className="filter-section">
        <div className="filter-title">
          <span>
            <SlidersHorizontal size={16} /> Filtros combináveis
          </span>
          <button onClick={clearFilters}>
            <RotateCcw size={14} /> Limpar
          </button>
        </div>
        <div className="filter-grid">
          <FilterSelect
            label="Família"
            value={filters.family}
            onChange={(value) => set("family", value)}
            options={options.families}
          />
          <FilterSelect
            label="Região"
            value={filters.region}
            onChange={(value) => set("region", value)}
            options={options.regions}
          />
          <FilterSelect
            label="Tipo"
            value={filters.type}
            onChange={(value) => set("type", value)}
            options={options.types}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) => set("status", value)}
            options={options.statuses}
          />
          <FilterSelect
            label="Cobertura"
            value={filters.coverage}
            onChange={(value) => set("coverage", value)}
            options={options.coverages}
          />
          <FilterSelect
            label="Macroperíodo"
            value={filters.macroPeriod}
            onChange={(value) => set("macroPeriod", value)}
            options={data.chronology.map((item) => item.id)}
            labels={Object.fromEntries(data.chronology.map((item) => [item.id, item.name]))}
          />
          <FilterSelect
            label="Arquétipo"
            value={filters.archetypeCode}
            onChange={(value) => set("archetypeCode", value)}
            options={data.archetypes.map((item) => item.code)}
            labels={Object.fromEntries(
              data.archetypes.map((item) => [item.code, `${item.code} — ${item.name}`]),
            )}
          />
          <FilterSelect
            label="Correlação"
            value={filters.correlationType}
            onChange={(value) => set("correlationType", value as CorrelationType | "")}
            options={Object.keys(CORRELATION_META)}
            labels={Object.fromEntries(
              Object.entries(CORRELATION_META).map(([key, item]) => [
                key,
                `${item.symbol} ${item.label}`,
              ]),
            )}
          />
          <FilterSelect
            label="Fonte"
            value={filters.sourceCode}
            onChange={(value) => set("sourceCode", value)}
            options={data.sources.map((item) => item.code)}
            labels={Object.fromEntries(
              data.sources.map((item) => [item.code, `${item.code} — ${item.scope}`]),
            )}
          />
          <FilterSelect
            label="Perfil especial"
            value={filters.statusFlag}
            onChange={(value) => set("statusFlag", value as AtlasFilters["statusFlag"])}
            options={["historical", "living", "revival", "archaeological", "fragmentary"]}
            labels={{
              historical: "Religião histórica",
              living: "Religião viva",
              revival: "Revival / revitalização",
              archaeological: "Evidência arqueológica",
              fragmentary: "Perfil fragmentário",
            }}
          />
        </div>
      </div>
      <p className="filter-note">
        A busca ignora acentos, mas preserva a grafia original nos resultados. Buscar uma entidade
        seleciona sua tradição, função, período e região.
      </p>
    </ModalShell>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  labels = {},
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
