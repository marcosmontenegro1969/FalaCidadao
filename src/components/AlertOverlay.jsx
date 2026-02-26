// src/components/AlertOverlay.jsx
export default function AlertOverlay({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Alerta"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/85 backdrop-blur p-5 space-y-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <div className="text-base text-white/95 font-semibold">
            {title || "Atenção"}
          </div>
          <div className="text-sm text-white/75 leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/90 hover:bg-white/10 transition"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}