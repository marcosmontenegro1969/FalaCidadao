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
  return (
    <div
      ref={descricaoRef}
      className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-3"
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
            className={[
              "w-full rounded-lg px-3 py-2 text-sm",
              "bg-surfaceLight text-textmain border border-borderSubtle",
              "outline-none focus:ring-2 focus:ring-primary/40",
              "hover:bg-surfaceLight/70 transition",
            ].join(" ")}
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
            className={[
              "w-full rounded-lg px-3 py-2 text-sm",
              "bg-surfaceLight text-textmain border border-borderSubtle",
              "outline-none focus:ring-2 focus:ring-primary/40",
              "hover:bg-surfaceLight/70 transition",
            ].join(" ")}
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
          className={[
            "w-full rounded-lg px-3 py-2 text-sm leading-relaxed",
            "bg-surfaceLight text-textmain border border-borderSubtle",
            "outline-none focus:ring-2 focus:ring-primary/40",
            "hover:bg-surfaceLight/70 transition",
            "placeholder:text-textmuted/70",
            "resize-none",
          ].join(" ")}
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs text-textmuted">Ponto de referência</span>
        <input
          value={pontoReferencia}
          onChange={(e) => setPontoReferencia(e.target.value)}
          placeholder="Ex.: em frente ao mercado X, ao lado da parada Y..."
          className={[
            "w-full rounded-lg px-3 py-2 text-sm",
            "bg-surfaceLight text-textmain border border-borderSubtle",
            "outline-none focus:ring-2 focus:ring-primary/40",
            "hover:bg-surfaceLight/70 transition",
            "placeholder:text-textmuted/70",
          ].join(" ")}
        />
      </label>
    </div>
  );
}