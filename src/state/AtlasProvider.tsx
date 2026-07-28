import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  Archetype,
  AtlasData,
  AtlasFilters,
  TemporalMode,
  Tradition,
  ViewMode,
} from "../types/atlas";
import { EMPTY_FILTERS, matchesFilters } from "../utils/atlas";
import { traditionIsVisible } from "../utils/temporal";

interface AtlasContextValue {
  data: AtlasData;
  selectedYear: number;
  setSelectedYear: Dispatch<SetStateAction<number>>;
  temporalMode: TemporalMode;
  setTemporalMode: Dispatch<SetStateAction<TemporalMode>>;
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  filters: AtlasFilters;
  setFilters: Dispatch<SetStateAction<AtlasFilters>>;
  clearFilters: () => void;
  visibleTraditions: Tradition[];
  selectedTradition?: Tradition;
  selectedTraditionId?: string;
  setSelectedTraditionId: Dispatch<SetStateAction<string | undefined>>;
  selectedArchetype?: Archetype;
  selectedArchetypeCode?: string;
  setSelectedArchetypeCode: Dispatch<SetStateAction<string | undefined>>;
  comparisonIds: string[];
  toggleComparison: (id: string) => void;
  comparisonOpen: boolean;
  setComparisonOpen: Dispatch<SetStateAction<boolean>>;
  showAbsences: boolean;
  setShowAbsences: Dispatch<SetStateAction<boolean>>;
  effectsEnabled: boolean;
  setEffectsEnabled: Dispatch<SetStateAction<boolean>>;
  aeonEnabled: boolean;
  setAeonEnabled: Dispatch<SetStateAction<boolean>>;
  revealPatterns: boolean;
  setRevealPatterns: Dispatch<SetStateAction<boolean>>;
  traceRecurrences: boolean;
  setTraceRecurrences: Dispatch<SetStateAction<boolean>>;
}

const AtlasContext = createContext<AtlasContextValue | null>(null);

export function AtlasProvider({ data, children }: { data: AtlasData; children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState(data.metadata.currentYear);
  const [temporalMode, setTemporalMode] = useState<TemporalMode>("panorama");
  const [viewMode, setViewMode] = useState<ViewMode>("constellation");
  const [filters, setFilters] = useState<AtlasFilters>(EMPTY_FILTERS);
  const [selectedTraditionId, setSelectedTraditionId] = useState<string>();
  const [selectedArchetypeCode, setSelectedArchetypeCode] = useState<string>();
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [showAbsences, setShowAbsences] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [aeonEnabled, setAeonEnabled] = useState(false);
  const [revealPatterns, setRevealPatterns] = useState(false);
  const [traceRecurrences, setTraceRecurrences] = useState(false);
  const searchCache = useRef(new Map<string, string>());

  const visibleTraditions = useMemo(
    () =>
      data.traditions.filter(
        (tradition) =>
          traditionIsVisible(tradition, selectedYear, temporalMode) &&
          matchesFilters(tradition, filters, data.archetypes, searchCache.current),
      ),
    [data, filters, selectedYear, temporalMode],
  );
  const selectedTradition = data.traditions.find(
    (tradition) => tradition.id === selectedTraditionId,
  );
  const selectedArchetype = data.archetypes.find(
    (archetype) => archetype.code === selectedArchetypeCode,
  );

  function toggleComparison(id: string) {
    setComparisonIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return [...current.slice(1), id];
      return [...current, id];
    });
  }

  const value: AtlasContextValue = {
    data,
    selectedYear,
    setSelectedYear,
    temporalMode,
    setTemporalMode,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    clearFilters: () => setFilters(EMPTY_FILTERS),
    visibleTraditions,
    selectedTradition,
    selectedTraditionId,
    setSelectedTraditionId,
    selectedArchetype,
    selectedArchetypeCode,
    setSelectedArchetypeCode,
    comparisonIds,
    toggleComparison,
    comparisonOpen,
    setComparisonOpen,
    showAbsences,
    setShowAbsences,
    effectsEnabled,
    setEffectsEnabled,
    aeonEnabled,
    setAeonEnabled,
    revealPatterns,
    setRevealPatterns,
    traceRecurrences,
    setTraceRecurrences,
  };

  return <AtlasContext.Provider value={value}>{children}</AtlasContext.Provider>;
}

export function useAtlas(): AtlasContextValue {
  const context = useContext(AtlasContext);
  if (!context) throw new Error("useAtlas deve ser usado dentro de AtlasProvider");
  return context;
}
