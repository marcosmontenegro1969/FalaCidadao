import PulseButton from "./PulseButton";
import SecondaryActionButton from "./SecondaryActionButton";

export default function BotoesAcaoRegistro({
  acaoEscolhida,
  confirmarReforco,
  confirmarAtualizacao,
  confirmarNovo,
  resetTotal,
  podeReforcar,
  podeAdicionarAtualizacao,
  podeRegistrarNovo,
  isProcessing,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {acaoEscolhida === "reforcar" && (
        <PulseButton
          onClick={confirmarReforco}
          disabled={!podeReforcar}
          intense={podeReforcar}
          className="inline-flex items-center gap-2"
        >
          Confirmar reforço
        </PulseButton>
      )}

      {acaoEscolhida === "atualizar" && (
        <PulseButton
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
        </PulseButton>
      )}

      {acaoEscolhida === "novo" && (
        <PulseButton
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
        </PulseButton>
      )}

      <SecondaryActionButton onClick={resetTotal}>
        Cancelar registro
      </SecondaryActionButton>
    </div>
  );
}