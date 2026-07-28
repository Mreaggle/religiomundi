import { List, X } from "lucide-react";
import { useState } from "react";
import { useAtlas } from "../state/AtlasProvider";

export function AccessibleTraditionList() {
  const { visibleTraditions, setSelectedTraditionId } = useAtlas();
  const [open, setOpen] = useState(false);
  return (
    <div className={`accessible-list ${open ? "open" : ""}`}>
      <button className="accessible-list-toggle" onClick={() => setOpen(!open)}>
        {open ? <X size={15} /> : <List size={15} />}
        {open ? "Fechar lista" : "Visualização em lista"}
      </button>
      {open && (
        <div>
          <p>{visibleTraditions.length} tradições no recorte atual</p>
          <ul>
            {visibleTraditions.map((tradition) => (
              <li key={tradition.id}>
                <button onClick={() => setSelectedTraditionId(tradition.id)}>
                  <span>{tradition.id}</span>
                  <strong>{tradition.name}</strong>
                  <small>
                    {tradition.region} · {tradition.periodLabel}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
