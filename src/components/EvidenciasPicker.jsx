import EvidenceGrid from "./EvidenceGrid";

export default function EvidenciasPicker({
  evidenciasRef,
  fotosPickRef,
  fotosSelecionadas,
  fotosPreviewUrls,
  fotosMeta,
  onPickFotos,
  onOpenCamera,
  onRemoveFoto,
  enderecoDetectado,
  title = "Envio de Evidências",
  emptyMessage = "Selecione até 3 fotos para continuar.",
  withEnderecoDetectado = true,
  maxFotos = 3,
  showTitle = true,
  showCounter = true,
  showContainer = true,
  containerClassName = "",
  acaoSecundaria = null,
}) {
  const hasFotos =
    Array.isArray(fotosPreviewUrls) && fotosPreviewUrls.length > 0;

  const linha1Endereco = [enderecoDetectado?.rua, enderecoDetectado?.bairro]
    .filter(Boolean)
    .join(" · ");

  const linha2Endereco = [enderecoDetectado?.cidade, enderecoDetectado?.estado]
    .filter(Boolean)
    .join(" · ");

  function getHelperText() {
    const n = fotosSelecionadas.length;

    if (n === 0) return emptyMessage;
    if (n >= 1 && n <= maxFotos) return `${n} foto(s) selecionada(s).`;

    return `Remova fotos para ficar no máximo de ${maxFotos}.`;
  }

  const containerClasses = [
    "rounded-2xl border p-5 transition",
    "bg-surfaceLight/15",
    fotosSelecionadas.length === 0
      ? "border-amber-500/40"
      : "border-borderSubtle",
    containerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <div
      className={[
        "flex flex-col gap-4",
        hasFotos ? "lg:flex-row lg:items-start lg:justify-between" : "",
      ].join(" ")}
    >
      <div
        className={[
          "w-full space-y-4",
          hasFotos ? "lg:max-w-[330px]" : "max-w-xl",
        ].join(" ")}
      >
        {(showTitle || showCounter) && (
          <div className="flex items-center justify-between gap-3">
            {showTitle ? (
              <h2 className="text-lg font-semibold">{title}</h2>
            ) : (
              <div />
            )}

            {showCounter ? (
              <span className="text-xs text-textmuted whitespace-nowrap">
                {fotosSelecionadas.length}/{maxFotos} selecionada(s)
              </span>
            ) : null}
          </div>
        )}

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
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onPickFotos}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onOpenCamera}
            className={[
              "inline-flex items-center justify-center gap-2",
              "px-4 py-2 rounded-lg border",
              "border-borderSubtle bg-overlay text-textmain",
              "hover:bg-overlayHover transition",
              "text-sm font-medium",
            ].join(" ")}
          >
            Capturar pela câmera
          </button>

          {acaoSecundaria}

          <div className="text-sm text-textmuted">{getHelperText()}</div>
        </div>

        {withEnderecoDetectado && enderecoDetectado && (
          <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm font-semibold text-textmain">
              Local detectado
            </p>

            <div className="mt-1 text-sm leading-relaxed text-textsoft space-y-0.5">
              {linha1Endereco && <p>{linha1Endereco}</p>}
              {linha2Endereco && <p>{linha2Endereco}</p>}
            </div>
          </div>
        )}
      </div>

      {hasFotos ? (
        <div className="w-full lg:flex-1 lg:max-w-[605px]">
          <EvidenceGrid
            fotos={fotosPreviewUrls}
            fotosMeta={fotosMeta}
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
        </div>
      ) : null}
    </div>
  );

  if (!showContainer) {
    return (
      <div ref={evidenciasRef}>
        {content}
      </div>
    );
  }

  return (
    <div ref={evidenciasRef} className={containerClasses}>
      {content}
    </div>
  );
}