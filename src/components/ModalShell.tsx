import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";

export function ModalShell({
  title,
  children,
  onClose,
  className = "",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop">
      <div
        ref={dialogRef}
        className={`modal-shell ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-shell-title"
        tabIndex={-1}
      >
        <div className="modal-heading">
          <h2 id="modal-shell-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label={`Fechar ${title}`}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
