import { useAppearance } from "../context/AppearanceContext.jsx";

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
  const { appearance } = useAppearance();
  const isLight = appearance === "light";

  const texto = textosPorContexto[contexto] || textosPorContexto.demanda;

  const labelClass = isLight
    ? "flex items-start gap-3 rounded-xl border border-slate-300 bg-white/90 p-3 text-sm text-slate-700 shadow-sm shadow-slate-900/5"
    : "flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200";

  const checkboxClass = isLight
    ? "mt-1 h-4 w-4 shrink-0 rounded border-slate-400 bg-white accent-primary"
    : "mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-slate-900 accent-primary";

  const strongClass = isLight
    ? "font-semibold text-slate-900"
    : "font-semibold text-white";

  return (
    <label className={`${labelClass} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className={checkboxClass}
      />

      <span className="leading-6">
        <strong className={strongClass}>
          Aviso de responsabilidade:
        </strong>{" "}
        {texto}
      </span>
    </label>
  );
}