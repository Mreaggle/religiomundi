import { useState } from "react";
import { AboutProject } from "./components/AboutProject";
import { AccessibleTraditionList } from "./components/AccessibleTraditionList";
import { AeonOverlay } from "./components/AeonOverlay";
import { ArchetypeConstellation } from "./components/ArchetypeConstellation";
import { ArchetypeDossier } from "./components/ArchetypeDossier";
import { ComparisonChamber } from "./components/ComparisonChamber";
import { EpistemicLegend } from "./components/EpistemicLegend";
import { FilterCommandPalette } from "./components/FilterCommandPalette";
import { HeaderNav } from "./components/HeaderNav";
import { IntroSequence } from "./components/IntroSequence";
import { LoadingArchive } from "./components/LoadingArchive";
import { PatternRevelation } from "./components/PatternRevelation";
import { PeriodMirror } from "./components/PeriodMirror";
import { SignatureGallery } from "./components/SignatureGallery";
import { SourceLibrary } from "./components/SourceLibrary";
import { TemporalGlide } from "./components/TemporalGlide";
import { TraditionDossier } from "./components/TraditionDossier";
import { VirtualMatrix } from "./components/VirtualMatrix";
import { WorldBeliefMap } from "./components/WorldBeliefMap";
import { useAtlasData } from "./data/useAtlasData";
import { AtlasProvider, useAtlas } from "./state/AtlasProvider";

export default function App() {
  const { data, error } = useAtlasData();
  const [introOpen, setIntroOpen] = useState(
    () => localStorage.getItem("religiomundi:intro-dismissed") !== "true",
  );
  if (!data) return <LoadingArchive error={error} />;

  return (
    <AtlasProvider data={data}>
      <AtlasExperience />
      {introOpen && <IntroSequence onEnter={() => setIntroOpen(false)} />}
    </AtlasProvider>
  );
}

function AtlasExperience() {
  const {
    viewMode,
    visibleTraditions,
    selectedTradition,
    selectedArchetype,
    revealPatterns,
    effectsEnabled,
    filters,
  } = useAtlas();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div className={`app-shell ${effectsEnabled ? "" : "effects-disabled"}`}>
      <div className="cosmic-noise" aria-hidden="true" />
      <HeaderNav
        onOpenFilters={() => setFiltersOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
      />
      <TemporalGlide />
      <AeonOverlay />
      <main id="atlas-main">
        {revealPatterns ? (
          <PatternRevelation />
        ) : (
          <div className={`atlas-workspace ${viewMode === "sources" ? "wide" : ""}`}>
            <div className="workspace-visual">
              <div className="workspace-readout">
                <span>
                  RECORTE ATUAL <b>{visibleTraditions.length}</b>
                </span>
                {activeFilters > 0 && (
                  <button onClick={() => setFiltersOpen(true)}>
                    {activeFilters} filtros ativos
                  </button>
                )}
              </div>
              {viewMode === "constellation" && <ArchetypeConstellation />}
              {viewMode === "map" && <WorldBeliefMap />}
              {viewMode === "matrix" && <VirtualMatrix />}
              {viewMode === "signatures" && <SignatureGallery />}
              {viewMode === "sources" && <SourceLibrary />}
            </div>
            {viewMode !== "sources" && <PeriodMirror />}
          </div>
        )}
      </main>
      <AccessibleTraditionList />
      <EpistemicLegend />
      {selectedTradition ? <TraditionDossier /> : selectedArchetype ? <ArchetypeDossier /> : null}
      <ComparisonChamber />
      {filtersOpen && <FilterCommandPalette onClose={() => setFiltersOpen(false)} />}
      {aboutOpen && <AboutProject onClose={() => setAboutOpen(false)} />}
    </div>
  );
}
