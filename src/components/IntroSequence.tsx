import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function IntroSequence({ onEnter }: { onEnter: () => void }) {
  const [neverAgain, setNeverAgain] = useState(false);

  function close() {
    if (neverAgain) localStorage.setItem("religiomundi:intro-dismissed", "true");
    onEnter();
  }

  return (
    <div className="intro-sequence" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <button className="intro-skip" onClick={close} aria-label="Pular introdução">
        <X size={16} /> Pular
      </button>
      <div className="intro-geometry" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="intro-copy">
        <p className="eyebrow">ATLAS TEMPORAL DAS RELIGIÕES</p>
        <h1 id="intro-title">Antes de comparar deuses, compare funções.</h1>
        <p className="intro-thesis">
          Este atlas não afirma que entidades diferentes sejam a mesma entidade. Ele mostra como
          culturas distintas organizaram perguntas recorrentes sobre origem, morte, ordem, desejo,
          natureza, destino e transcendência.
        </p>
        <div className="intro-numbers" role="group" aria-label="Dimensões do acervo">
          <span>
            <strong>460</strong> tradições
          </span>
          <span>
            <strong>44</strong> funções comparativas
          </span>
          <span>
            <strong>20.240</strong> relações examináveis
          </span>
        </div>
        <p className="intro-invitation">
          Arraste o tempo. Observe o que muda. Observe o que retorna.
        </p>
        <button className="ritual-button" onClick={close}>
          Entrar no atlas <ArrowRight size={18} />
        </button>
        <label className="intro-checkbox">
          <input
            type="checkbox"
            checked={neverAgain}
            onChange={(event) => setNeverAgain(event.target.checked)}
          />
          Não mostrar novamente
        </label>
      </div>
    </div>
  );
}
