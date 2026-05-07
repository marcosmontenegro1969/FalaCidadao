import { useAppearance } from "../context/AppearanceContext.jsx";
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
  modoConsulta = false,
}) {
  const { appearance } = useAppearance();
  const isLight = appearance === "light";  
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

    if (modoConsulta) {
      return "Imagem mantida apenas para conferência desta etapa.";
    }

    if (n === 0) return emptyMessage;
    if (n >= 1 && n <= maxFotos) return `${n} foto(s) selecionada(s).`;

    return `Remova fotos para ficar no máximo de ${maxFotos}.`;
  }

  const tituloEfetivo = modoConsulta
    ? "Evidência usada para localização"
    : title;

  const mostrarContadorEfetivo = modoConsulta ? false : showCounter;

  const containerClasses = [
    "rounded-2xl border p-5 transition shadow-sm",
    isLight
      ? "bg-white/80 border-slate-300/80 shadow-slate-900/5"
      : "bg-surfaceLight/30 border-white/15 shadow-black/20",
    containerClassName,
  ]
    .filter(Boolean)
    .join(" ");

  const captureButtonClass = isLight
    ? "border-slate-300 bg-white/80 text-textmain hover:bg-white hover:border-primary/30"
    : "border-white/10 bg-white/5 text-textmain hover:bg-white/10 hover:border-primary/30";

  const detectedLocationClass = isLight
    ? "rounded-xl border border-emerald-400 bg-emerald-50 px-4 py-3"
    : "rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3";

  const removeButtonClass = isLight
    ? "w-full text-xs py-2 text-slate-700 bg-white/80 hover:bg-white transition"
    : "w-full text-xs py-2 text-textmain bg-white/5 hover:bg-white/10 transition";    

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
        {(showTitle || mostrarContadorEfetivo) && (
          <div className="flex items-center justify-between gap-3">
            {showTitle ? (
              <h2 className="text-lg font-semibold">{tituloEfetivo}</h2>
            ) : (
              <div />
            )}

            {mostrarContadorEfetivo ? (
              <span className="text-xs text-textmuted whitespace-nowrap">
                {fotosSelecionadas.length}/{maxFotos} selecionada(s)
              </span>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!modoConsulta && (
            <button
              ref={fotosPickRef}
              type="button"
              onClick={onOpenCamera}
              className={[
                "inline-flex items-center justify-center gap-2",
                "px-4 py-2 rounded-lg border",
                "transition text-sm font-medium",
                captureButtonClass,
              ].join(" ")}
            >
              Capturar evidência
            </button>
          )}

          {!modoConsulta && acaoSecundaria}

          <div className="text-sm text-textmuted">{getHelperText()}</div>
        </div>

        {withEnderecoDetectado && enderecoDetectado && (
          <div className={detectedLocationClass}>
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
            renderFooter={
              modoConsulta
                ? undefined
                : (idx) => (
                    <button
                      type="button"
                      onClick={() => onRemoveFoto(idx)}
                      className={removeButtonClass}
                    >
                      Remover
                    </button>
                  )
            }
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