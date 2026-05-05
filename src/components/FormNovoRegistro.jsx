import { useAppearance } from "../context/AppearanceContext.jsx";
import { CATEGORIAS_DEMANDAS } from "../constants/categoriasDemandas";
import { OPCOES_TEMPO_PERCEBIDO } from "../constants/registroProblema";

export default function FormNovoRegistro({
  descricaoRef,
  descricaoInputRef,
  categoria,
  setCategoria,
  tempoPercebido,
  setTempoPercebido,
  descricaoNovo,
  setDescricaoNovo,
  pontoReferencia,
  setPontoReferencia,
}) {
  const { appearance } = useAppearance();
  const isLight = appearance === "light";

  const formCardClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-5 space-y-3 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/15 bg-surfaceLight/30 p-5 space-y-3 shadow-sm shadow-black/20";

  const fieldClass = isLight
    ? "bg-white text-textmain border border-slate-300 hover:bg-white"
    : "bg-surface text-textmain border border-white/10 hover:bg-white/5";

  const baseFieldClass =
    "w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition";

  const textAreaClass =
    "w-full rounded-lg px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/40 transition placeholder:text-textmuted/70 resize-none";
    
  return (
    <div
      ref={descricaoRef}
      className={formCardClass}
    >
      <h2 className="text-lg font-semibold">
        Complete as informações do novo registro
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-1 block">
          <span className="text-xs text-textmuted">Categoria</span>
          <select
            title="Selecione a categoria do problema"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={`${baseFieldClass} ${fieldClass}`}
          >
            {CATEGORIAS_DEMANDAS.map((c) => (
              <option key={c} value={c} className="text-black">
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 block">
          <span className="text-xs text-textmuted">
            Há quanto tempo você percebe esse problema?
          </span>
          <select
            title="Selecione há quanto tempo você percebe esse problema"
            value={tempoPercebido}
            onChange={(e) => setTempoPercebido(e.target.value)}
            className={`${baseFieldClass} ${fieldClass}`}
          >
            {OPCOES_TEMPO_PERCEBIDO.map((opcao) => (
              <option
                key={opcao.value}
                value={opcao.value}
                className="text-black"
              >
                {opcao.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs text-textmuted">Descrição do problema</span>
        <textarea
          ref={descricaoInputRef}
          value={descricaoNovo}
          onChange={(e) => setDescricaoNovo(e.target.value)}
          rows={4}
          placeholder="Ex.: Buraco grande na via, próximo ao cruzamento com a Rua X, causando risco a pedestres e veículos."
          className={`${textAreaClass} ${fieldClass}`}
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-textmuted">Ponto de referência</span>
        <input
          value={pontoReferencia}
          onChange={(e) => setPontoReferencia(e.target.value)}
          placeholder="Ex.: em frente ao mercado X, ao lado da parada Y..."
          className={`${baseFieldClass} ${fieldClass} placeholder:text-textmuted/70`}
        />
      </label>
    </div>
  );
}