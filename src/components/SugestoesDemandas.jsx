import EvidenceGrid from "./EvidenceGrid";
import SecondaryActionButton from "./SecondaryActionButton";

export default function SugestoesDemandas({
  sugestoes,
  demandaAlvoId,
  onVerDetalhes,
  onAbrirFotos,
  onReforcar,
  onRegistrarNovo,
}) {
  return (
    <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Possíveis demandas já registradas</h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-textsoft">
          Encontramos possíveis correspondências. Confira as fotos para reconhecer se é o mesmo problema.
        </p>

        {sugestoes.map(({ d, score }) => (
          <div
            key={d.id}
            className={[
              "rounded-2xl p-4 space-y-3 transition",
              d.id === demandaAlvoId
                ? "border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                : "border-white/10 bg-white/5",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/90">
                    {d.id}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-surfaceLight text-textmuted">
                    {d.categoria} · {(d.enderecoDetectado?.bairro || d.bairro || "—")}
                  </span>
                  <span className="text-textmuted">Similaridade: {Math.round(score * 100)}%</span>
                </div>

                <p className="text-sm text-slate-100">{d.descricao}</p>

                <p className="text-[11px] text-textmuted">
                  Confirmado por {d.impacto?.confirmacoes ?? 0} cidadão(s) · Última:{" "}
                  {d.impacto?.ultimaConfirmacao ?? "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onVerDetalhes(d.id)}
                className="px-4 py-2 rounded-lg border border-surfaceLight text-sm text-textmain hover:bg-surfaceLight/40 transition"
              >
                Ver detalhes
              </button>
            </div>

            {Array.isArray(d.fotos) && d.fotos.length ? (
              <EvidenceGrid fotos={d.fotos.slice(0, 3)} onClickFoto={(idx) => onAbrirFotos(d, idx)} />
            ) : (
              <p className="text-[12px] text-textmuted">Sem fotos neste mock.</p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <SecondaryActionButton onClick={() => onReforcar(d.id)}>
                É o mesmo: reforçar
              </SecondaryActionButton>

              <SecondaryActionButton onClick={onRegistrarNovo}>
                Não é o mesmo: registrar novo
              </SecondaryActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}