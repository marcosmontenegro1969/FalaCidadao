export default function FormAtualizacaoDemanda({
  descricaoRef,
  descricaoInputRef,
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
        Adicionar atualização à demanda existente
      </h2>

      <p className="text-sm text-textsoft">
        Descreva o que há de novo nesta ocorrência. As fotos já anexadas serão
        usadas como evidência da atualização.
      </p>

      <label className="space-y-1 block">
        <span className="text-xs text-textmuted">
          Descrição da atualização
        </span>
        <textarea
          ref={descricaoInputRef}
          value={descricaoNovo}
          onChange={(e) => setDescricaoNovo(e.target.value)}
          rows={4}
          placeholder="Ex.: O problema continua no local e agora apresenta agravamento..."
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