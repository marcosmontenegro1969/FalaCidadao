// src/components/EvidenceGrid.jsx

export default function EvidenceGrid({
  fotos = [],
  onClickFoto,
  renderFooter, // opcional (ex: botão Remover)
}) {
  if (!fotos.length) return null;

  return (
    <div className="grid grid-cols-5 gap-3">
      {fotos.map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          className="relative aspect-square rounded-xl overflow-hidden border border-borderSubtle bg-overlay hover:bg-overlayHover transition"
        >
          <button
            type="button"
            onClick={onClickFoto ? () => onClickFoto(idx) : undefined}
            className="w-full h-full focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label={`Abrir evidência ${idx + 1}`}
          >
            <img
              src={src}
              alt={`Evidência ${idx + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>

          {renderFooter && (
            <div className="absolute inset-x-0 bottom-0 z-10">
              {renderFooter(idx)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
