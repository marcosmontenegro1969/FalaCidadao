import EvidenceGrid from "./EvidenceGrid";
import SecondaryActionButton from "./SecondaryActionButton";

function formatDateBR(iso) {
  if (!iso || typeof iso !== "string") return "—";

  const dateOnly = iso.slice(0, 10);
  const [y, m, d] = dateOnly.split("-");

  if (!y || !m || !d) return iso;

  return `${d}/${m}/${y}`;
}

export default function SugestoesDemandas({
  sugestoes,
  demandaAlvoId,
  onVerDetalhes,
  onAbrirFotos,
  onReforcar,
  onAdicionarAtualizacao,
  onRegistrarNovo,
  onCancelar,
}) {
  return (
    <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Possíveis demandas já registradas</h2>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-textsoft">
          Encontramos uma demanda parecida já registrada. Confira as fotos e escolha como deseja continuar.
        </p>

        {sugestoes.map(({ d, score }) => {
          const totalReforcos =
            typeof d.totalReforcos === "number"
              ? d.totalReforcos
              : Array.isArray(d.reforcos)
              ? d.reforcos.length
              : 0;

          const ultimoReforco = formatDateBR(d.ultimoReforcoEm);

          const resumoReforcos =
            totalReforcos === 0
              ? "Ainda sem reforços cidadãos"
              : totalReforcos === 1
              ? "1 reforço cidadão"
              : `${totalReforcos} reforços cidadãos`;

          return (
            <div
              key={d.id}
              className={[
                "rounded-2xl border p-4 space-y-3 transition",
                d.id === demandaAlvoId
                  ? "border-emerald-400/70 bg-emerald-500/12 ring-2 ring-emerald-400/35 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]"
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
                      {d.categoria} ·{" "}
                      {d.enderecoDetectado?.bairro || d.bairro || "—"}
                    </span>

                    <span className="text-textmuted">
                      Similaridade: {Math.round(score * 100)}%
                    </span>
                  </div>

                  <p className="text-sm text-slate-100">{d.descricao}</p>

                  <p className="text-[11px] text-textmuted">
                    {resumoReforcos}
                    {totalReforcos > 0 ? ` · Último reforço: ${ultimoReforco}` : ""}
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
                <EvidenceGrid
                  fotos={d.fotos.slice(0, 3)}
                  onClickFoto={(idx) => onAbrirFotos(d, idx)}
                />
              ) : (
                <p className="text-[12px] text-textmuted">Sem fotos neste mock.</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  <SecondaryActionButton onClick={() => onReforcar(d.id)}>
                    Reforçar demanda
                  </SecondaryActionButton>

                  <SecondaryActionButton onClick={() => onAdicionarAtualizacao?.(d.id)}>
                    Adicionar atualização
                  </SecondaryActionButton>

                  <SecondaryActionButton onClick={() => onRegistrarNovo(d.id)}>
                    Registrar nova demanda
                  </SecondaryActionButton>
                </div>

                <button
                  type="button"
                  onClick={() => onCancelar?.()}
                  className="px-4 py-2 rounded-xl border border-borderSubtle bg-transparent text-sm text-textmuted hover:bg-overlay hover:text-textmain transition"
                >
                  Cancelar
                </button>
              </div>

              {d.id === demandaAlvoId && (
                <div className="rounded-xl border border-emerald-400/30 bg-surfaceLight/40 p-3 space-y-1">
                  <h3 className="text-base font-semibold text-textmain">
                    Confirmação rápida
                  </h3>

                  <p className="text-sm text-textsoft leading-relaxed">
                    Escolha uma das opções acima para continuar com este registro
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}