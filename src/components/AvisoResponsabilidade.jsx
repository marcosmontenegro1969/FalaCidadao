const textosPorContexto = {
  demanda:
    "Ao registrar esta ocorrência, você confirma que as informações e imagens enviadas correspondem de boa-fé ao problema observado no local.",
  atualizacao:
    "Ao atualizar esta ocorrência, você confirma que as novas informações e imagens correspondem de boa-fé ao estado atual do problema no local.",
};

export default function AvisoResponsabilidade({
  checked,
  onChange,
  contexto = "demanda",
  className = "",
}) {
  const texto = textosPorContexto[contexto] || textosPorContexto.demanda;

  return (
    <label
      className={`flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200 ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-slate-900"
      />

      <span className="leading-6">
        <strong className="font-semibold text-white">
          Aviso de responsabilidade:
        </strong>{" "}
        {texto}
      </span>
    </label>
  );
}