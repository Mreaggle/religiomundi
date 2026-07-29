import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

export function DrawerShell({
  eyebrow,
  title,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        className="dossier-backdrop"
        aria-label="Fechar dossiê e limpar seleção"
        onClick={onClose}
      />
      <aside ref={ref} className="dossier-drawer" aria-labelledby="dossier-title">
        <div className="dossier-heading">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="dossier-title">{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label={`Fechar ${title}`}>
            <X size={19} />
          </button>
        </div>
        <div className="dossier-scroll">{children}</div>
      </aside>
    </>
  );
}
