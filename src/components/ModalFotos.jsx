// src/components/ModalFotos.jsx
export default function ModalFotos({ open, fotos, index, onClose, onPrev, onNext, title }) {
  if (!open) return null;

  const hasFotos = Array.isArray(fotos) && fotos.length > 0;
  const src = hasFotos ? fotos[index] : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização de foto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur p-3 md:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-xs text-white/80">
            {title ? <span className="text-white/90">{title} · </span> : null}
            Evidência {hasFotos ? index + 1 : 0} de {hasFotos ? fotos.length : 0}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/90 hover:bg-white/10 transition"
          >
            Fechar
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center min-h-[240px]">
          {src ? (
            <img
              src={src}
              alt={`Evidência ${index + 1}`}
              className="w-full h-full object-contain"
              loading="eager"
            />
          ) : (
            <div className="text-sm text-white/70 p-6">
              Nenhuma evidência fotográfica disponível.
            </div>
          )}
        </div>

        {hasFotos && fotos.length > 1 && (
          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              type="button"
              onClick={onPrev}
              className="px-3 py-2 rounded-lg border border-white/10 text-xs text-white/90 hover:bg-white/10 transition"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-3 py-2 rounded-lg border border-white/10 text-xs text-white/90 hover:bg-white/10 transition"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}