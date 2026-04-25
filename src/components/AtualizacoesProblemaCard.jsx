//src/components/AtualizacoesProblemaCard.jsx

import { useEffect, useRef, useState } from "react";
import { useFotoPreviews } from "../hooks/useFotoPreviews";
import EvidenciasPicker from "./EvidenciasPicker";
import CameraCaptureModal from "./CameraCaptureModal";
import { handlePickFotos } from "../utils/handlePickFotos";
import { distanciaMetros } from "../utils/exifGps";
import { reverseGeocodeCity } from "../utils/reverseGeocode";
import AvisoResponsabilidade from "./AvisoResponsabilidade";
import EvidenceGrid from "./EvidenceGrid";

export default function AtualizacoesProblemaCard({
  isAutenticado = false,
  podeAtualizarProblema = false,
  totalAtualizacoes = 0,
  atualizacoes = [],
  localOriginal = { lat: null, lng: null },
  onAviso,
  onSalvarAtualizacao,
  onFluxoAtualizacaoChange,
  onAbrirFotoAtualizacao,
}) {
  const hasAtualizacoes = totalAtualizacoes > 0;
  const atualizacoesOrdenadas = Array.isArray(atualizacoes)
    ? [...atualizacoes].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
    : [];

  const [flowStep, setFlowStep] = useState(null);
  const [updateEvidenceReady, setUpdateEvidenceReady] = useState(false);
  const [updateDescricao, setUpdateDescricao] = useState("");
  const [updatePontoReferencia, setUpdatePontoReferencia] = useState("");
  const [updateAceiteResponsabilidade, setUpdateAceiteResponsabilidade] = useState(false);

  const [updateLocalRelato, setUpdateLocalRelato] = useState(null);

  const updateEvidenciasRef = useRef(null);
  const updateFotosPickRef = useRef(null);

  const LIMITE_DISTANCIA_ATUALIZACAO_METROS = 40;

  const [updateFotosSelecionadas, setUpdateFotosSelecionadas] = useState([]);
  const updateFotosPreviewUrls = useFotoPreviews(updateFotosSelecionadas);

  const [updateFotosMeta, setUpdateFotosMeta] = useState([]);
  const [updateEnderecoDetectado, setUpdateEnderecoDetectado] = useState(null);
  const [updateCameraModalOpen, setUpdateCameraModalOpen] = useState(false);

  useEffect(() => {
    return () => {
      onFluxoAtualizacaoChange?.(false);
    };
  }, [onFluxoAtualizacaoChange]);  

  function handleAbrirFluxo() {
    setFlowStep("evidencia");
    setUpdateCameraModalOpen(true);
    onFluxoAtualizacaoChange?.(true);
  }

  function handleCancelarFluxo() {
    setUpdateEvidenceReady(false);
    setUpdateDescricao("");
    setUpdatePontoReferencia("");
    setUpdateAceiteResponsabilidade(false);
    setUpdateFotosSelecionadas([]);
    setUpdateFotosMeta([]);
    setUpdateEnderecoDetectado(null);
    setUpdateLocalRelato(null);
    setUpdateCameraModalOpen(false);
    setFlowStep(null);
    onFluxoAtualizacaoChange?.(false);

    if (updateFotosPickRef.current) {
      const input = updateFotosPickRef.current.querySelector("input[type='file']");
      if (input) input.value = "";
    }
  }

  async function handlePickUpdateFotos(e) {
    const fotosAntes = updateFotosSelecionadas.length;

    await handlePickFotos({
      e,
      fotosSelecionadas: updateFotosSelecionadas,
      setFotosSelecionadas: setUpdateFotosSelecionadas,
      setFotosMeta: setUpdateFotosMeta,
      setLocalRelato: setUpdateLocalRelato,
      setEnderecoDetectado: setUpdateEnderecoDetectado,
      limiteDistanciaMetros: LIMITE_DISTANCIA_ATUALIZACAO_METROS,
      showToast: () => {},
      setAlertOverlay: (payload) => onAviso?.(payload),
      scrollTo: () => {},
      evidenciasRef: updateEvidenciasRef,
      fotosPickRef: updateFotosPickRef,
    });

    setTimeout(() => {
      const entrouPrimeiraFotoAgora =
        fotosAntes === 0 &&
        updateFotosSelecionadas.length > 0 &&
        typeof updateLocalRelato?.lat === "number" &&
        typeof updateLocalRelato?.lng === "number";

      if (!entrouPrimeiraFotoAgora) {
        setUpdateEvidenceReady(updateFotosSelecionadas.length > 0);
        return;
      }

      if (
        !validarPrimeiraEvidenciaContraOcorrenciaOriginal({
          lat: updateLocalRelato.lat,
          lng: updateLocalRelato.lng,
        })
      ) {
        setUpdateFotosSelecionadas([]);
        setUpdateFotosMeta([]);
        setUpdateLocalRelato(null);
        setUpdateEnderecoDetectado(null);
        setUpdateEvidenceReady(false);

        if (updateFotosPickRef.current) {
          const input =
            updateFotosPickRef.current.querySelector("input[type='file']");
          if (input) input.value = "";
        }

        return;
      }
      setUpdateEvidenceReady(true);
    }, 0);
  }

  function handleRemoverUpdateFoto(idx) {
    const novasFotos = updateFotosSelecionadas.filter((_, i) => i !== idx);
    const novasMetas = updateFotosMeta.filter((_, i) => i !== idx);

    setUpdateFotosSelecionadas(novasFotos);
    setUpdateFotosMeta(novasMetas);
    setUpdateEvidenceReady(novasFotos.length > 0);

    if (novasFotos.length === 0) {
      setUpdateEnderecoDetectado(null);

      if (updateFotosPickRef.current) {
        const input = updateFotosPickRef.current.querySelector("input[type='file']");
        if (input) input.value = "";
      }
    }
  }

  function handleOpenUpdateCamera() {
    setUpdateCameraModalOpen(true);
  }

  function handleCloseUpdateCamera() {
    setUpdateCameraModalOpen(false);

    const naoTemFotoSelecionada = updateFotosSelecionadas.length === 0;

    if (flowStep === "evidencia" && naoTemFotoSelecionada) {
      handleCancelarFluxo();
    }
  }

  async function handleUpdateCameraCapture({ file, meta }) {
    if (
      typeof meta?.lat !== "number" ||
      typeof meta?.lng !== "number" ||
      !Number.isFinite(meta.lat) ||
      !Number.isFinite(meta.lng)
    ) {
      onAviso?.({
        title: "Localização ausente",
        message:
          "Não foi possível validar a localização da nova evidência capturada.",
      });
      return;
    }

    const isPrimeiraFotoDaAtualizacao = updateFotosSelecionadas.length === 0;

    if (isPrimeiraFotoDaAtualizacao) {
      if (!validarPrimeiraEvidenciaContraOcorrenciaOriginal(meta)) {
        setUpdateCameraModalOpen(false);
        return;
      }

      setUpdateLocalRelato({
        lat: meta.lat,
        lng: meta.lng,
        source: meta.source || "browser_capture",
      });
    } else {
      if (
        typeof updateLocalRelato?.lat !== "number" ||
        typeof updateLocalRelato?.lng !== "number" ||
        !Number.isFinite(updateLocalRelato.lat) ||
        !Number.isFinite(updateLocalRelato.lng)
      ) {
        onAviso?.({
          title: "Referência da atualização indisponível",
          message:
            "Não foi possível validar a nova foto em relação à primeira evidência da atualização.",
        });
        return;
      }

      const distancia = distanciaMetros(
        updateLocalRelato.lat,
        updateLocalRelato.lng,
        meta.lat,
        meta.lng
      );

      if (distancia > LIMITE_DISTANCIA_ATUALIZACAO_METROS) {
        onAviso?.({
          title: "Fotos com locais diferentes",
          message:
            `A nova foto está a aproximadamente ${Math.round(
              distancia
            )}m da primeira evidência desta atualização.\n\n` +
            `Envie apenas fotos do mesmo local.`,
        });
        return;
      }
    }

    const novasFotos = [...updateFotosSelecionadas, file].slice(0, 3);
    const novasMetas = [...updateFotosMeta, meta].slice(0, 3);

    setUpdateFotosSelecionadas(novasFotos);
    setUpdateFotosMeta(novasMetas);
    setUpdateEvidenceReady(novasFotos.length > 0);

    try {
      const geo = await reverseGeocodeCity(meta.lat, meta.lng);

      setUpdateEnderecoDetectado({
        cidade: geo?.cidade || "",
        estado: geo?.estado || "",
        bairro: geo?.bairro || "",
        rua: geo?.rua || "",
      });
    } catch {
      setUpdateEnderecoDetectado(null);
    }
    
    setUpdateCameraModalOpen(false);
  }

  function validarPrimeiraEvidenciaContraOcorrenciaOriginal(meta) {
    const latOriginal = localOriginal?.lat;
    const lngOriginal = localOriginal?.lng;

    if (
      typeof latOriginal !== "number" ||
      typeof lngOriginal !== "number" ||
      !Number.isFinite(latOriginal) ||
      !Number.isFinite(lngOriginal)
    ) {
      onAviso?.({
        title: "Localização original indisponível",
        message:
          "Não foi possível validar esta atualização contra o local original da ocorrência.",
      });
      return false;
    }

    if (
      typeof meta?.lat !== "number" ||
      typeof meta?.lng !== "number" ||
      !Number.isFinite(meta.lat) ||
      !Number.isFinite(meta.lng)
    ) {
      onAviso?.({
        title: "Localização ausente",
        message:
          "Não foi possível obter a localização da nova evidência. Atualizações precisam ser feitas no local da ocorrência.",
      });
      return false;
    }

    const distancia = distanciaMetros(
      latOriginal,
      lngOriginal,
      meta.lat,
      meta.lng
    );

    if (distancia > LIMITE_DISTANCIA_ATUALIZACAO_METROS) {
      onAviso?.({
        title: "Evidência fora do local da ocorrência",
        message:
          `A nova evidência está a aproximadamente ${Math.round(
            distancia
          )}m do local original desta demanda.\n\n` +
          `Para atualizar este problema, é necessário estar no local da ocorrência.`,
      });
      return false;
    }

    return true;
  }

  async function handleEnviarAtualizacao() {
    if (!podeEnviarAtualizacao) return;
    if (typeof onSalvarAtualizacao !== "function") {
      onAviso?.({
        title: "Salvamento indisponível",
        message:
          "O salvamento da atualização ainda não foi conectado nesta tela.",
      });
      return;
    }

    const payload = {
      descricao: updateDescricao.trim(),
      pontoReferencia: updatePontoReferencia.trim(),
      aceiteResponsabilidade: updateAceiteResponsabilidade,
      fotos: updateFotosSelecionadas,
      fotosMeta: updateFotosMeta.map((meta) => ({
        ...meta,
        takenAt:
          meta?.takenAt instanceof Date
            ? meta.takenAt.toISOString()
            : meta?.takenAt || null,
      })),
      enderecoDetectado: updateEnderecoDetectado,
      localRelato: updateLocalRelato,
    };

    const result = await onSalvarAtualizacao(payload);

    if (!result?.ok) {
      onAviso?.({
        title: "Não foi possível salvar",
        message: result?.message || "Tente novamente.",
      });
      return;
    }

    setUpdateEvidenceReady(false);
    setUpdateDescricao("");
    setUpdatePontoReferencia("");
    setUpdateAceiteResponsabilidade(false);
    setUpdateFotosSelecionadas([]);
    setUpdateFotosMeta([]);
    setUpdateEnderecoDetectado(null);
    setUpdateLocalRelato(null);
    setUpdateCameraModalOpen(false);

    if (updateFotosPickRef.current) {
      const input =
        updateFotosPickRef.current.querySelector("input[type='file']");
      if (input) input.value = "";
    }

    onAviso?.({
      title: "Atualização registrada",
      message:
        "Sua atualização foi salva com sucesso nesta demanda.",
    });

    setFlowStep(null);
    onFluxoAtualizacaoChange?.(false);    
  }

  const podeEnviarAtualizacao =
    updateEvidenceReady &&
    updateAceiteResponsabilidade;

  return (
    <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">Atualizações do problema</h2>

        {podeAtualizarProblema && flowStep !== "evidencia" ? (
          <button
            type="button"
            onClick={handleAbrirFluxo}
            className="px-4 py-2 rounded-xl border border-borderSubtle bg-overlay text-sm text-textmain hover:bg-overlayHover transition"
          >
            Nova atualização
          </button>
        ) : null}
      </div>
      {!podeAtualizarProblema ? (
        <div className="rounded-xl border border-borderSubtle bg-overlay p-4 space-y-2">
        
          {!hasAtualizacoes ? (
            <>
              <p className="text-sm text-textmain">
                Nenhuma atualização registrada até o momento.
              </p>

              <p className="text-xs text-textmuted">
                Atualizações exigem nova evidência.
              </p>

              {!isAutenticado ? (
                <p className="text-xs text-textmuted">
                  Faça login para atualizar esta demanda.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-textmain">
                {totalAtualizacoes} atualização(ões) registrada(s).
              </p>

              <p className="text-xs text-textmuted">
                A listagem detalhada será conectada nas próximas etapas.
              </p>
            </>
          )}
        </div>
      ) : (

        <div className="rounded-xl border border-borderSubtle bg-overlay p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {!hasAtualizacoes ? (
                <p className="text-sm text-textmain">
                  Nenhuma atualização registrada até o momento.
                </p>
              ) : (
                <p className="text-sm text-textmain">
                  {totalAtualizacoes} atualização(ões) registrada(s).
                </p>
              )}
            </div>

            {updateFotosSelecionadas.length > 0 ? (
              <span className="text-xs text-textmuted whitespace-nowrap pt-1">
                {updateFotosSelecionadas.length}/3 selecionada(s)
              </span>
            ) : null}
          </div>

          {hasAtualizacoes ? (
            <div
              className={[
                "space-y-3 pr-1",
                atualizacoesOrdenadas.length > 3
                  ? "max-h-[420px] overflow-y-auto"
                  : "",
              ].join(" ")}
            >
              {atualizacoesOrdenadas.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-borderSubtle bg-surfaceLight/30 p-3"
                >
                  {(() => {
                    const fotosAtualizacao = Array.isArray(item.fotos)
                      ? item.fotos.map((foto) =>
                          typeof foto === "string" && foto.startsWith("local:")
                            ? foto.replace("local:", "")
                            : foto
                        )
                      : [];

                    const fotosMetaAtualizacao = Array.isArray(item.fotosMeta)
                      ? item.fotosMeta
                      : [];

                    return (
                      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-textmuted">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleString("pt-BR")
                                : "Data não informada"}
                            </span>

                            <span className="px-2 py-0.5 rounded-full border border-borderSubtle bg-overlay text-[11px] text-textmuted">
                              Atualização cidadã
                            </span>
                          </div>

                          <p className="text-sm text-textmain leading-relaxed">
                            {item.descricao || "Sem descrição informada."}
                          </p>

                          {item.pontoReferencia ? (
                            <p className="text-xs text-textmuted">
                              Ponto de referência:{" "}
                              <span className="text-textmain">
                                {item.pontoReferencia}
                              </span>
                            </p>
                          ) : null}

                          {fotosAtualizacao.length > 0 ? (
                            <p className="text-xs text-textmuted">
                              {fotosAtualizacao.length === 1
                                ? "1 evidência anexada"
                                : `${fotosAtualizacao.length} evidências anexadas`}
                            </p>
                          ) : (
                            <p className="text-xs text-textmuted">
                              Sem evidências anexadas.
                            </p>
                          )}
                        </div>

                        {fotosAtualizacao.length > 0 ? (
                          <div className="flex flex-wrap md:flex-nowrap gap-2 md:justify-end">
                            {fotosAtualizacao.map((foto, idx) => (
                              <button
                                key={`${item.id}-foto-${idx}`}
                                type="button"
                                onClick={
                                  onAbrirFotoAtualizacao
                                    ? () =>
                                        onAbrirFotoAtualizacao(
                                          fotosAtualizacao,
                                          fotosMetaAtualizacao,
                                          idx
                                        )
                                    : undefined
                                }
                                className="relative h-24 w-24 overflow-hidden rounded-lg border border-borderSubtle bg-overlay hover:opacity-90 transition"
                                title={`Abrir evidência ${idx + 1}`}
                              >
                                <img
                                  src={foto}
                                  alt={`Evidência ${idx + 1} da atualização`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  draggable={false}
                                />
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : null}
          {flowStep === "evidencia" ? (
            <div className="space-y-4">
              <EvidenciasPicker
                evidenciasRef={updateEvidenciasRef}
                fotosPickRef={updateFotosPickRef}
                fotosSelecionadas={updateFotosSelecionadas}
                fotosPreviewUrls={updateFotosPreviewUrls}
                fotosMeta={updateFotosMeta}
                onPickFotos={handlePickUpdateFotos}
                onOpenCamera={handleOpenUpdateCamera}
                onRemoveFoto={handleRemoverUpdateFoto}
                enderecoDetectado={updateEnderecoDetectado}
                title=""
                emptyMessage="Adicione de 1 a 3 fotos atuais para validar a atualização desta ocorrência."
                withEnderecoDetectado={true}
                maxFotos={3}
                showTitle={false}
                showCounter={false}
                showContainer={false}
                acaoSecundaria={
                  !updateEvidenceReady ? (
                    <button
                      type="button"
                      onClick={handleCancelarFluxo}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-borderSubtle bg-transparent text-sm font-medium text-textmuted hover:bg-overlay hover:text-textmain transition"
                    >
                      Cancelar
                    </button>
                  ) : null
                }
              />
            </div>
          ) : null}
          {flowStep === "evidencia" && updateEvidenceReady ? (
            <div className="rounded-xl border border-borderSubtle bg-overlay p-4 space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Descreva o que há de novo nesta ocorrência</h3>
              </div>

              <label className="space-y-1 block">
                <textarea
                  value={updateDescricao}
                  onChange={(e) => setUpdateDescricao(e.target.value)}
                  rows={4}
                  placeholder="Ex.: O problema continua no local, agora com agravamento..."
                  className={[
                    "w-full rounded-lg px-3 py-2 text-sm leading-relaxed",
                    "bg-surfaceLight text-textmain border border-borderSubtle",
                    "outline-none focus:ring-2 focus:ring-primary/40",
                    "hover:bg-surfaceLight/70 transition",
                    "placeholder:text-textmuted/70 resize-none",
                  ].join(" ")}
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-xs text-textmuted">Ponto de referência</span>
                <input
                  value={updatePontoReferencia}
                  onChange={(e) => setUpdatePontoReferencia(e.target.value)}
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
              <AvisoResponsabilidade
                checked={updateAceiteResponsabilidade}
                onChange={setUpdateAceiteResponsabilidade}
                contexto="atualizacao"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleEnviarAtualizacao}
                  disabled={!podeEnviarAtualizacao}
                  className={[
                    "px-6 py-2 rounded-xl border text-sm font-medium transition whitespace-nowrap",
                    podeEnviarAtualizacao
                      ? "border-borderSubtle bg-overlay text-textmain hover:bg-overlayHover"
                      : "border-borderSubtle bg-overlay text-textmuted opacity-50 cursor-not-allowed",
                  ].join(" ")}
                >
                  Enviar atualização
                </button>

                <button
                  type="button"
                  onClick={handleCancelarFluxo}
                  className="px-6 py-2 rounded-xl border border-borderSubtle bg-transparent text-sm text-textmuted hover:bg-overlay hover:text-textmain transition whitespace-nowrap"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : null}
        </div>        
      )}
      <CameraCaptureModal
        open={updateCameraModalOpen}
        onClose={handleCloseUpdateCamera}
        onCapture={handleUpdateCameraCapture}
      />
    </div>
  );
}