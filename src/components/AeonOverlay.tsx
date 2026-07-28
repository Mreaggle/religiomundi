import { useAtlas } from "../state/AtlasProvider";
import { chronologyForYear } from "../utils/temporal";

export function AeonOverlay() {
  const { data, selectedYear, aeonEnabled } = useAtlas();
  if (!aeonEnabled) return null;
  const period = chronologyForYear(data.chronology, selectedYear);
  const entries = data.aeons.filter((aeon) => aeon.macroPeriodId === period.id);

  return (
    <aside className="aeon-overlay" aria-label="Interpretação autoral e esotérica">
      <div>
        <span>INTERPRETAÇÃO AUTORAL / ESOTÉRICA</span>
        <strong>
          {entries.map((entry) => entry.thelemicAeon).join(" · ") ||
            "Sem correspondência nesta faixa"}
        </strong>
      </div>
      {entries.slice(0, 2).map((entry) => (
        <p key={`${entry.aeon}-${entry.era}`} title={entry.correspondences}>
          <b>{entry.aeon}</b> · {entry.astrologicalAeon} · {entry.era}
        </p>
      ))}
    </aside>
  );
}
