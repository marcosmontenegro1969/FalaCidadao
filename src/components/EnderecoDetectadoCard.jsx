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
        <h2 className="text-lg font-semibold">Local detectado</h2>
        <p className="text-sm text-textmuted">{linha}</p>
      </div>
    );
  }

  if (localRelato?.lat != null && localRelato?.lng != null) {
    const lat = Number(localRelato.lat).toFixed(6);
    const lng = Number(localRelato.lng).toFixed(6);

    return (
      <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/10 p-5 space-y-2">
        <h2 className="text-lg font-semibold">Local detectado</h2>
        <p className="text-sm text-textmuted">
          {lat}, {lng}
        </p>
      </div>
    );
  }

  return null;
}