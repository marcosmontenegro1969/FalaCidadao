// src/components/DicaCidadaCard.jsx

import { useMemo, useState } from "react";
import { DICAS_CIDADA } from "../data/dicasCidada";

const DICA_CIDADA_FECHADA_EM_KEY = "falaCidadao:dicaCidadaFechadaEm";

function getHojeKey() {
  return new Date().toISOString().slice(0, 10);
}

function escolherDicaDoDia(dicas) {
  if (!Array.isArray(dicas) || dicas.length === 0) return null;

  const hoje = getHojeKey();
  const soma = hoje
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return dicas[soma % dicas.length];
}

export default function DicaCidadaCard() {
  const hoje = getHojeKey();

  const [fechadaHoje, setFechadaHoje] = useState(() => {
    return localStorage.getItem(DICA_CIDADA_FECHADA_EM_KEY) === hoje;
  });

  const [expandida, setExpandida] = useState(false);

  const dica = useMemo(() => escolherDicaDoDia(DICAS_CIDADA), []);

  if (fechadaHoje || !dica) return null;

  function handleFechar(e) {
    e.stopPropagation();
    localStorage.setItem(DICA_CIDADA_FECHADA_EM_KEY, hoje);
    setFechadaHoje(true);
  }

  function handleToggle() {
    setExpandida((prev) => !prev);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
      className="
        rounded-2xl border border-borderSubtle bg-surfaceLight/70
        backdrop-blur-sm p-4 text-sm cursor-pointer
        hover:border-accent/40 hover:bg-surfaceLight/85 transition
      "
      title={expandida ? "Recolher dica cidadã" : "Ver dica cidadã"}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
        <p className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-amber-300">
            <span aria-hidden="true">💡</span>
            Dica cidadã do dia
        </p>

        <h2 className="text-base font-semibold text-textmain">
            {dica.titulo}
        </h2>

        {!expandida && (
            <p className="text-[11px] text-textmuted">
            Um direito pouco conhecido que pode fazer diferença.
            </p>
        )}
        </div>

        <button
        type="button"
        onClick={handleFechar}
        className="
            px-2 py-1 rounded-lg border border-borderSubtle
            text-[11px] text-textmuted hover:bg-overlayHover transition
        "
        aria-label="Fechar dica cidadã"
        >
        Dispensar hoje
        </button>
      </div>

        {!expandida ? (
        <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-amber-300">
            <span>Ver dica</span>
            <span aria-hidden="true">→</span>
        </div>
        ) : (
        <div className="mt-3 space-y-3">
          <p className="text-textsoft leading-relaxed">
            {dica.texto}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-borderSubtle">
            <span className="text-[11px] text-textmuted">
              {dica.categoria} ·{" "}
              {dica.nivel === "essencial" ? "Essencial" : "Ampliada"}
            </span>

            <span className="text-[11px] text-textmuted">
              Fonte: {dica.fonte}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}