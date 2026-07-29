import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChartNoAxesCombined,
  CircleDotDashed,
  Columns3,
  GitCompareArrows,
  Library,
  Map as MapIcon,
  Radar,
  Search,
  Sparkles,
  Trees,
} from "lucide-react";
import { useAtlas } from "../state/AtlasProvider";
import type { ViewMode } from "../types/atlas";
import { formatCount } from "../utils/text";

const VIEWS: Array<{ id: ViewMode; label: string; icon: LucideIcon }> = [
  { id: "constellation", label: "Constelação", icon: CircleDotDashed },
  { id: "map", label: "Mapa", icon: MapIcon },
  { id: "tree", label: "Árvore", icon: Trees },
  { id: "charts", label: "Charts", icon: ChartNoAxesCombined },
  { id: "matrix", label: "Matriz", icon: Columns3 },
  { id: "signatures", label: "Assinaturas", icon: Radar },
  { id: "sources", label: "Fontes", icon: Library },
];

export function HeaderNav({
  onOpenFilters,
  onOpenAbout,
}: {
  onOpenFilters: () => void;
  onOpenAbout: () => void;
}) {
  const {
    data,
    viewMode,
    setViewMode,
    comparisonIds,
    setComparisonOpen,
    revealPatterns,
    setRevealPatterns,
    clearSelection,
  } = useAtlas();

  return (
    <header className="atlas-header">
      <button
        className="brand-lockup"
        onClick={() => setViewMode("constellation")}
        aria-label="RELIGIO MUNDI — ir à constelação"
      >
        <span className="brand-sigil" aria-hidden="true">
          <i />
          <i />
        </span>
        <span>
          <strong>RELIGIO MUNDI</strong>
          <small>ATLAS TEMPORAL</small>
        </span>
      </button>

      <nav className="view-navigation" aria-label="Modos de visualização">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={viewMode === id ? "active" : ""}
            onClick={() => setViewMode(id)}
            aria-current={viewMode === id ? "page" : undefined}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <button onClick={onOpenFilters} aria-label="Abrir busca e filtros">
          <Search size={16} />
          <span>Investigar</span>
        </button>
        <button
          className={revealPatterns ? "active" : ""}
          aria-label={revealPatterns ? "Fechar Revelar padrões" : "Revelar padrões"}
          onClick={() => {
            if (revealPatterns) clearSelection();
            setRevealPatterns(!revealPatterns);
          }}
        >
          <Sparkles size={16} />
          <span>Revelar padrões</span>
        </button>
        <button
          onClick={() => setComparisonOpen(true)}
          disabled={comparisonIds.length < 2}
          title={
            comparisonIds.length < 2
              ? "Selecione de duas a quatro tradições nos dossiês"
              : "Abrir Câmara de Comparação"
          }
        >
          <GitCompareArrows size={16} />
          <span>Comparar</span>
          {comparisonIds.length > 0 && <b>{comparisonIds.length}</b>}
        </button>
        <button onClick={onOpenAbout} aria-label="Sobre o projeto">
          <BookOpen size={16} />
        </button>
      </div>

      <div className="header-readout" role="status" aria-label="Escala do acervo">
        {formatCount(data.metadata.traditionCount)} × {data.metadata.archetypeCount}
      </div>
    </header>
  );
}
