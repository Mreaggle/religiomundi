export function LoadingArchive({ error }: { error?: string }) {
  return (
    <main className="loading-archive" aria-live="polite">
      <div className="loading-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="eyebrow">ARQUIVO EM ABERTURA</p>
      <h1>RELIGIO MUNDI</h1>
      <p>{error ?? "Decifrando as relações documentadas…"}</p>
      {error && <button onClick={() => window.location.reload()}>Tentar novamente</button>}
    </main>
  );
}
