import PrimaryButton  from "./PrimaryButton";
import SecondaryActionButton from "./SecondaryActionButton";

export default function BotoesAcaoRegistro({
  acaoEscolhida,
  confirmarReforco,
  confirmarAtualizacao,
  confirmarNovo,
  resetTotal,
  voltarParaOpcoes,
  podeReforcar,
  podeAdicionarAtualizacao,
  podeRegistrarNovo,
  isProcessing,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {acaoEscolhida === "reforcar" && (
        <PrimaryButton
          onClick={confirmarReforco}
          disabled={!podeReforcar}
          intense={podeReforcar}
          className="inline-flex items-center gap-2"
        >
          Confirmar reforço
        </PrimaryButton>
      )}

      {acaoEscolhida === "atualizar" && (
        <PrimaryButton
          onClick={confirmarAtualizacao}
          disabled={!podeAdicionarAtualizacao || isProcessing}
          intense={!isProcessing && podeAdicionarAtualizacao}
          className="inline-flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border border-current border-t-transparent animate-spin" />
              Registrando atualização...
            </>
          ) : (
            "Confirmar atualização"
          )}
        </PrimaryButton>
      )}

      {acaoEscolhida === "novo" && (
        <PrimaryButton
          onClick={confirmarNovo}
          disabled={!podeRegistrarNovo || isProcessing}
          intense={!isProcessing && podeRegistrarNovo}
          className="inline-flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <span className="h-3.5 w-3.5 rounded-full border border-current border-t-transparent animate-spin" />
              Processando fotos...
            </>
          ) : (
            "Registrar novo problema"
          )}
        </PrimaryButton>
      )}

      <SecondaryActionButton
        onClick={acaoEscolhida === "reforcar" ? voltarParaOpcoes : resetTotal}
      >
        {acaoEscolhida === "reforcar" ? "Voltar às opções" : "Cancelar registro"}
      </SecondaryActionButton>
    </div>
  );
}