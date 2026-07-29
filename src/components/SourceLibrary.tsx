import { ExternalLink, Library } from "lucide-react";
import { useAtlas } from "../state/AtlasProvider";

export function SourceLibrary() {
  const { data, filters } = useAtlas();
  const sourceUsage = new Map(
    data.sources.map((source) => [
      source.code,
      data.traditions.filter((tradition) => tradition.sourceCodes.includes(source.code)).length,
    ]),
  );
  const sources = filters.sourceCode
    ? data.sources.filter((source) => source.code === filters.sourceCode)
    : data.sources;

  return (
    <section className="sources-view instrument-panel" aria-labelledby="sources-title">
      <div className="instrument-heading">
        <div>
          <p className="eyebrow">CORPORA E TRILHAS DE VERIFICAÇÃO</p>
          <h2 id="sources-title">Biblioteca de fontes</h2>
        </div>
      </div>
      <p className="source-intro">
        Mistura deliberada de corpora primários, referências acadêmicas e fontes confessionais
        identificadas. Uma fonte oficial descreve autocompreensão; não substitui história crítica.
      </p>
      <div className="source-library">
        {sources.map((source) => (
          <article key={source.code} id={`source-${source.code}`}>
            <div className="source-code">
              <Library size={15} />
              <strong>{source.code}</strong>
              <span>{source.scope}</span>
            </div>
            <h3>{source.title}</h3>
            <p>{source.institution}</p>
            <small>{source.usage}</small>
            <footer>
              <span>associada a {sourceUsage.get(source.code) ?? 0} tradições</span>
              {source.url && (
                <a href={source.url} target="_blank" rel="noreferrer">
                  Abrir recurso <ExternalLink size={13} />
                </a>
              )}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
