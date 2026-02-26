// src/components/ProcessingOverlay.jsx
export default function ProcessingOverlay({ open, progress }) {
  if (!open) return null;

  const { done, total, fileName } = progress || {};
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur p-5 space-y-3">
        <div className="text-sm text-white/90 font-medium">
          Processando fotos...
        </div>

        <div className="text-xs text-white/70">
          {total ? `Convertendo ${done}/${total}` : "Preparando..."}
          {fileName ? (
            <span className="block mt-1 truncate">Arquivo: {fileName}</span>
          ) : null}
        </div>

        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="text-[11px] text-white/60">
          Isso pode levar alguns segundos dependendo do tamanho das imagens.
        </div>
      </div>
    </div>
  );
}