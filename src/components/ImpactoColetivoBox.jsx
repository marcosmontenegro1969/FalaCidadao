// src/components/ImpactoColetivoBox.jsx

function getImpactoInfo(confirmacoes = 0) {
  if (confirmacoes >= 20) {
    return {
      nivel: "Alto",
      faixa: "20+ confirmações",
      resumo: "Problema crítico, amplamente reconhecido pela população.",
      acoes: [
        "Recebe destaque máximo no sistema.",
        "Entra como prioridade crítica para encaminhamento.",
        "Ganha mais força institucional para cobrança e acompanhamento.",
      ],
    };
  }

  if (confirmacoes >= 6) {
    return {
      nivel: "Médio",
      faixa: "6 a 20 confirmações",
      resumo: "Problema recorrente, com impacto relevante na rotina da comunidade.",
      acoes: [
        "Recebe maior destaque visual no painel.",
        "É priorizada para organização e possível agrupamento.",
        "Entra na fila de encaminhamento institucional.",
      ],
    };
  }

  return {
    nivel: "Baixo",
    faixa: "1 a 5 confirmações",
    resumo: "Problema localizado, com impacto restrito a poucas pessoas até o momento.",
    acoes: [
      "Permanece visível e aberta a novas confirmações e evidências.",
      "É monitorada para reclassificação automática conforme ganhar confirmações.",
      "Pode ser agrupada no futuro com demandas semelhantes.",
    ],
  };
}

function nivelBadgeClass(nivel) {
  switch (nivel) {
    case "Alto":
      return "bg-rose-500/10 text-rose-200 border border-rose-500/40";
    case "Médio":
      return "bg-amber-500/10 text-amber-200 border border-amber-500/40";
    default:
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
  }
}

export default function ImpactoColetivoBox({
  confirmacoes = 0,
  ultimaConfirmacao = null,
}) {
  const info = getImpactoInfo(confirmacoes);

  return (
    <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Impacto Coletivo</h2>
          <p className="text-sm text-textmuted">
            Indica quantas pessoas confirmaram que este problema também afeta sua rotina.
          </p>
        </div>

        <span className={`px-2 py-1 rounded-full text-xs ${nivelBadgeClass(info.nivel)}`}>
          Nível: <span className="font-semibold">{info.nivel}</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="px-3 py-2 rounded-xl border border-borderSubtle bg-overlay">
          Confirmado por{" "}
          <span className="text-textmain font-semibold">{confirmacoes}</span>{" "}
          cidadão(s)
          <span className="text-textmuted"> · {info.faixa}</span>
        </div>

        <div className="px-3 py-2 rounded-xl border border-borderSubtle bg-overlay text-textsoft">
          Última confirmação:{" "}
          <span className="text-textmain">{ultimaConfirmacao ?? "—"}</span>
        </div>
      </div>

      <div className="rounded-xl border border-borderSubtle bg-overlay p-4 space-y-2">
        <p className="text-sm text-textmain">{info.resumo}</p>

        <p className="text-sm text-textsoft leading-relaxed">
          <span className="font-medium text-textmain">
            Confirmar uma demanda não é um like.
          </span>{" "}
          É uma declaração pública de que o problema também existe para você.
        </p>
      </div>
    </div>
  );
}
