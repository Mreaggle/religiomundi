import { ShieldCheck } from "lucide-react";
import { useAtlas } from "../state/AtlasProvider";
import { formatCount } from "../utils/text";
import { ModalShell } from "./ModalShell";

export function AboutProject({ onClose }: { onClose: () => void }) {
  const { data } = useAtlas();
  return (
    <ModalShell title="SOBRE O PROJETO" onClose={onClose} className="about-project">
      <div className="about-hero">
        <p className="eyebrow">ATLAS COMPARATIVO · MATRIZ HEURÍSTICA</p>
        <h3>Os nomes mudam. As funções reaparecem. As diferenças continuam importando.</h3>
        <p>
          RELIGIO MUNDI é um atlas comparativo de religiões, cosmovisões e funções arquetípicas. Seu
          objetivo não é dissolver tradições distintas em uma religião universal, nem provar que
          todos os deuses são um único deus. O atlas permite observar recorrências, diferenças,
          ausências, transformações e limites documentais ao longo da história humana.
        </p>
      </div>
      <div className="about-statistics">
        <span>
          <strong>{formatCount(data.metadata.traditionCount)}</strong> tradições
        </span>
        <span>
          <strong>{data.metadata.archetypeCount}</strong> funções
        </span>
        <span>
          <strong>{formatCount(data.metadata.correlationCount)}</strong> relações
        </span>
        <span>
          <strong>{data.metadata.sourceCount}</strong> fontes
        </span>
      </div>
      <section>
        <h3>O que “arquétipo” significa aqui</h3>
        <p>
          Aqui, “arquétipo” é uma ferramenta de indexação comparativa. Não representa
          automaticamente um universal psicológico, uma origem comum, uma entidade metafísica única
          ou uma equivalência teológica.
        </p>
      </section>
      <section>
        <h3>Amplitude e limite</h3>
        <p>
          A planilha é ampla, mas não exaustiva. Milhares de tradições locais, linhagens,
          denominações e variações não possuem corpus público, nomenclatura estável ou documentação
          suficiente para um mapeamento responsável.
        </p>
      </section>
      <section>
        <h3>Cartografia política temporal</h3>
        <p>
          O mapa político usa recortes históricos descontínuos e nunca interpola fronteiras. Cada
          ano mostra o último snapshot disponível que não seja posterior ao período observado.
          Polígonos antigos podem representar Estados, culturas ou áreas de influência aproximadas;
          não demonstram soberania uniforme, ocupação exclusiva ou consenso historiográfico.
        </p>
        <p>
          Geometria histórica:{" "}
          <a
            href="https://github.com/aourednik/historical-basemaps"
            target="_blank"
            rel="noreferrer"
          >
            historical-basemaps
          </a>
          . Referência contemporânea:{" "}
          <a
            href="https://www.naturalearthdata.com/downloads/110m-cultural-vectors/"
            target="_blank"
            rel="noreferrer"
          >
            Natural Earth
          </a>
          .
        </p>
      </section>
      <section>
        <h3>Árvore e rankings</h3>
        <p>
          A Árvore mantém todas as tradições do recorte em faixas regionais que não implicam
          parentesco. Linhas sólidas indicam vínculos históricos documentados; tracejadas indicam
          hipótese ou debate com fonte explícita.
        </p>
        <p>
          CHARTS calcula rankings internos a partir da matriz. A demografia mundial é uma série
          externa e agregada do{" "}
          <a
            href="https://www.pewresearch.org/religion/2025/06/09/how-the-global-religious-landscape-changed-from-2010-to-2020/"
            target="_blank"
            rel="noreferrer"
          >
            Pew Research Center
          </a>
          , com estimativas para 2020. Ranking documental ou populacional não mede verdade nem valor
          espiritual.
        </p>
      </section>
      <section className="integrity-block">
        <ShieldCheck size={22} />
        <div>
          <h3>Integridade dos dados</h3>
          <p>
            Os dados publicados passam por validações de estrutura e consistência. Textos das
            células, símbolos, diacríticos e ressalvas são preservados.
          </p>
        </div>
      </section>
    </ModalShell>
  );
}
