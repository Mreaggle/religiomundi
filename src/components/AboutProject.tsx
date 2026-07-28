import { FileDown, ShieldCheck } from "lucide-react";
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
      <section className="integrity-block">
        <ShieldCheck size={22} />
        <div>
          <h3>Integridade dos dados</h3>
          <p>
            A aplicação é gerada de <code>{data.metadata.workbook}</code>. Textos das células,
            símbolos, diacríticos e ressalvas são preservados.
          </p>
          <small>SHA-256 · {data.metadata.workbookSha256}</small>
        </div>
      </section>
      <div className="about-actions">
        <a href="/data/UNO_reformulado.xlsx" download>
          <FileDown size={15} /> Baixar planilha canônica
        </a>
      </div>
    </ModalShell>
  );
}
