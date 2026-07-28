import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAtlas } from "../state/AtlasProvider";
import { chronologyForYear, formatYear, positionToYear, yearToPosition } from "../utils/temporal";
import { ModalShell } from "./ModalShell";

const SPEED_STEPS = [1, 2, 4];

export function TemporalGlide() {
  const {
    data,
    selectedYear,
    setSelectedYear,
    temporalMode,
    setTemporalMode,
    visibleTraditions,
    aeonEnabled,
    setAeonEnabled,
  } = useAtlas();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [confirmAeon, setConfirmAeon] = useState(false);
  const period = useMemo(
    () => chronologyForYear(data.chronology, selectedYear),
    [data.chronology, selectedYear],
  );
  const position = yearToPosition(selectedYear);

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      setSelectedYear((year) => {
        const nextPosition = yearToPosition(year) + 2.5 * speed;
        if (nextPosition >= 1000) {
          setPlaying(false);
          return data.metadata.currentYear;
        }
        return positionToYear(nextPosition);
      });
    }, 90);
    return () => window.clearInterval(interval);
  }, [data.metadata.currentYear, playing, setSelectedYear, speed]);

  function jumpPeriod(direction: -1 | 1) {
    setTemporalMode("panorama");
    const index = data.chronology.findIndex((item) => item.id === period.id);
    const target =
      data.chronology[Math.max(0, Math.min(data.chronology.length - 1, index + direction))];
    setSelectedYear(target.startYear);
  }

  function handleAeon() {
    if (aeonEnabled) {
      setAeonEnabled(false);
    } else {
      setConfirmAeon(true);
    }
  }

  return (
    <>
      <section className="temporal-glide" aria-labelledby="timeline-title">
        <div className="timeline-primary">
          <div className="timeline-title-block">
            <p id="timeline-title" className="eyebrow">
              RECORTE TEMPORAL
            </p>
            <strong>{formatYear(selectedYear)}</strong>
            <span>{period.name}</span>
            <small className="timeline-count">
              {visibleTraditions.length} de {data.metadata.traditionCount} tradições
            </small>
          </div>

          <div className="timeline-instrument">
            <div className="timeline-ticks" aria-hidden="true">
              {data.chronology.map((item) => (
                <span key={item.id} style={{ left: `${yearToPosition(item.startYear) / 10}%` }}>
                  {item.name.split("/")[0]}
                </span>
              ))}
            </div>
            <label className="sr-only" htmlFor="temporal-range">
              Ano ou período selecionado
            </label>
            <input
              id="temporal-range"
              type="range"
              min={0}
              max={1000}
              step={1}
              value={position}
              onChange={(event) => {
                setTemporalMode("panorama");
                setSelectedYear(positionToYear(Number(event.target.value)));
              }}
              aria-valuetext={`${formatYear(selectedYear)}, ${period.name}`}
            />
            <div className="timeline-compression">
              <Gauge size={12} />
              escala híbrida — cada faixa cronológica possui expansão própria
            </div>
          </div>

          <div className="timeline-controls">
            <button onClick={() => jumpPeriod(-1)} aria-label="Período anterior">
              <ChevronLeft size={17} />
            </button>
            <button
              className="play-history"
              onClick={() => {
                if (!playing) setTemporalMode("panorama");
                setPlaying(!playing);
              }}
              aria-label={playing ? "Pausar história" : "Observar a história"}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}
              <span>{playing ? "Pausar" : "Observar a história"}</span>
            </button>
            <button onClick={() => jumpPeriod(1)} aria-label="Próximo período">
              <ChevronRight size={17} />
            </button>
            <button
              onClick={() =>
                setSpeed(SPEED_STEPS[(SPEED_STEPS.indexOf(speed) + 1) % SPEED_STEPS.length])
              }
              aria-label={`Velocidade ${speed} vezes`}
            >
              {speed}×
            </button>
            <button
              onClick={() => {
                setPlaying(false);
                setTemporalMode("panorama");
                setSelectedYear(data.metadata.currentYear);
              }}
            >
              <RotateCcw size={15} /> Hoje
            </button>
          </div>
        </div>

        <div className="timeline-secondary">
          <div
            className="temporal-mode-switch"
            role="group"
            aria-label="Modo de interpretação temporal"
          >
            <button
              className={temporalMode === "panorama" ? "active" : ""}
              onClick={() => setTemporalMode("panorama")}
              aria-pressed={temporalMode === "panorama"}
            >
              Panorama
            </button>
            <button
              className={temporalMode === "emergences" ? "active" : ""}
              onClick={() => setTemporalMode("emergences")}
              aria-pressed={temporalMode === "emergences"}
            >
              Emergências
            </button>
            <button
              className={temporalMode === "catalog" ? "active" : ""}
              onClick={() => {
                setPlaying(false);
                setTemporalMode("catalog");
              }}
              aria-pressed={temporalMode === "catalog"}
              title="Exibe todas as tradições do catálogo, preservando suas datas documentadas"
            >
              Catálogo · {data.metadata.traditionCount}
            </button>
          </div>
          <p>
            <CalendarClock size={13} />
            <span>
              {temporalMode === "catalog" ? (
                <>
                  <strong>Visão transversal do catálogo completo.</strong> A posição temporal
                  continua registrada, mas não filtra as tradições neste modo.
                </>
              ) : (
                <>
                  <strong>{period.context}</strong> {period.limitations}
                </>
              )}
            </span>
          </p>
          <button className={aeonEnabled ? "aeon active" : "aeon"} onClick={handleAeon}>
            Camada esotérica — Aeons
          </button>
        </div>
      </section>

      {confirmAeon && (
        <ModalShell title="CAMADA ESOTÉRICA — AEONS" onClose={() => setConfirmAeon(false)}>
          <div className="confirmation-copy">
            <p>
              Esta camada apresenta uma interpretação esotérica moderna baseada em correspondências
              astrológicas e thelêmicas. Ela não representa consenso arqueológico, historiográfico
              ou científico.
            </p>
            <div className="modal-actions">
              <button onClick={() => setConfirmAeon(false)}>Cancelar</button>
              <button
                className="ritual-button"
                onClick={() => {
                  setAeonEnabled(true);
                  setConfirmAeon(false);
                }}
              >
                Ativar interpretação autoral
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </>
  );
}
