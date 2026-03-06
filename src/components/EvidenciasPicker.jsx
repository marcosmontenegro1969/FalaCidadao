import EvidenceGrid from "./EvidenceGrid";

export default function EvidenciasPicker({
  evidenciasRef,
  fotosPickRef,
  fotosSelecionadas,
  fotosPreviewUrls,
  onPickFotos,
  onRemoveFoto,
}) {
  return (
    <div
      ref={evidenciasRef}
      className={[
        "rounded-2xl border p-5 space-y-4 transition",
        "bg-surfaceLight/15",
        fotosSelecionadas.length === 0 ? "border-amber-500/40" : "border-borderSubtle",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Evidências (1 a 3 fotos)</h2>
        <span className="text-xs text-textmuted">
          {fotosSelecionadas.length}/3 selecionada(s)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label
          ref={fotosPickRef}
          className={[
            "inline-flex items-center justify-center gap-2",
            "px-4 py-2 rounded-lg border",
            "border-borderSubtle bg-overlay text-textmain",
            "hover:bg-overlayHover transition cursor-pointer",
            "text-sm font-medium",
          ].join(" ")}
        >
          Selecionar fotos
          <input type="file" accept="image/*" multiple onChange={onPickFotos} className="hidden" />
        </label>

        <div className="text-xs text-textmuted">
          {(() => {
            const n = fotosSelecionadas.length;
            if (n === 0) return "Selecione de 1 a 3 fotos para continuar.";
            if (n >= 1 && n <= 3) return `Perfeito: ${n} foto(s) selecionada(s).`;
            return "Remova fotos para ficar no máximo de 3.";
          })()}
        </div>
      </div>

      {fotosSelecionadas.length ? (
        <EvidenceGrid
          fotos={fotosPreviewUrls}
          renderFooter={(idx) => (
            <button
              type="button"
              onClick={() => onRemoveFoto(idx)}
              className="w-full text-xs py-2 text-textmain bg-overlay hover:bg-overlayHover transition"
            >
              Remover
            </button>
          )}
        />
      ) : (
        <p className="text-sm text-textmuted">
          Selecione entre 1 e 3 fotos. (MVP: ainda utiliza galeria; no futuro, será exigido câmera in loco.)
        </p>
      )}
    </div>
  );
}