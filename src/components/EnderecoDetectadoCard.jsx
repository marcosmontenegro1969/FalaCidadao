export default function EnderecoDetectadoCard({ enderecoDetectado, localRelato }) {
  if (enderecoDetectado) {
    const ruaTxt = (enderecoDetectado?.rua || "").trim();
    const bairroTxt = (enderecoDetectado?.bairro || "").trim();
    const cidadeTxt = (enderecoDetectado?.cidade || "").trim();
    const estadoTxt = (enderecoDetectado?.estado || "").trim();

    const bairroValido =
      bairroTxt && (!cidadeTxt || bairroTxt.toLowerCase() !== cidadeTxt.toLowerCase());

    const cidadeEstado = [cidadeTxt, estadoTxt].filter(Boolean).join(" / ");

    const linha =
      [ruaTxt, bairroValido ? bairroTxt : "", cidadeEstado].filter(Boolean).join(" · ") || "—";

    return (
      <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/10 p-5 space-y-2">
        <h2 className="text-lg font-semibold">Endereço detectado</h2>
        <p className="text-sm text-textmuted">{linha}</p>
      </div>
    );
  }

  if (!enderecoDetectado && localRelato) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2">
        <h2 className="text-lg font-semibold">Endereço não identificado</h2>
        <p className="text-sm text-textmuted">
          O GPS foi validado nas fotos, mas não conseguimos obter o endereço (rua/bairro/cidade/UF) agora.
          Você pode continuar — vamos usar as coordenadas do local.
        </p>
      </div>
    );
  }

  return null;
}