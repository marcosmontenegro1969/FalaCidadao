// src/components/EvidenceGrid.jsx

function formatarTakenAt(takenAt) {
  if (!takenAt) return null;

  let date = null;

  if (takenAt instanceof Date) {
    date = takenAt;
  } else if (typeof takenAt === "number") {
    date = new Date(takenAt);
  } else if (typeof takenAt === "string") {
    // tenta ISO / formato nativo primeiro
    let tentativa = new Date(takenAt);

    // fallback para EXIF: "YYYY:MM:DD HH:mm:ss"
    if (Number.isNaN(tentativa.getTime())) {
      const exifMatch = takenAt.match(
        /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
      );

      if (exifMatch) {
        const [, ano, mes, dia, hora, minuto, segundo = "00"] = exifMatch;
        tentativa = new Date(
          Number(ano),
          Number(mes) - 1,
          Number(dia),
          Number(hora),
          Number(minuto),
          Number(segundo)
        );
      }
    }

    if (!Number.isNaN(tentativa.getTime())) {
      date = tentativa;
    }
  }

  if (!date || Number.isNaN(date.getTime())) return null;

  const data = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${data} • ${hora}`;
}

export default function EvidenceGrid({
  fotos,
  fotosMeta,
  onClickFoto,
  renderFooter,
}) {
  const listaFotos = Array.isArray(fotos) ? fotos : [];
  const listaMetas = Array.isArray(fotosMeta) ? fotosMeta : [];

  if (!listaFotos.length) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {listaFotos.map((src, idx) => {
        const takenAtFormatado = formatarTakenAt(listaMetas[idx]?.takenAt);

        return (
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

            {takenAtFormatado && (
              <div className="absolute inset-x-0 top-0 z-10 px-2 py-1.5 bg-black/65 backdrop-blur-[1px]">
                <p className="text-[11px] leading-none text-white font-medium text-center">
                  {takenAtFormatado}
                </p>
              </div>
            )}

            {renderFooter && (
              <div className="absolute inset-x-0 bottom-0 z-10">
                {renderFooter(idx)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}