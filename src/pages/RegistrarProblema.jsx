// src/pages/RegistrarProblema.jsx

// Libs externas
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Context/tema
import { ThemeContext } from "../context/ThemeContext";
import { CITY_THEMES } from "../theme/cities";

// Constants
import { CATEGORIAS_DEMANDAS } from "../constants/categoriasDemandas";

// Services
import { criarDemanda, reforcarDemanda } from "../services/demandasActions";

// Storage
import { getDemandas } from "../storage/demandasStorage";

// Hooks
import { useFotoPreviews } from "../hooks/useFotoPreviews";

// Components
import AlertOverlay from "../components/AlertOverlay";
import BackButton from "../components/BackButton";
import EvidenciasPicker from "../components/EvidenciasPicker";
import ModalFotos from "../components/ModalFotos";
import ProcessingOverlay from "../components/ProcessingOverlay";
import PulseButton from "../components/PulseButton";
import SecondaryActionButton from "../components/SecondaryActionButton";
import SugestoesDemandas from "../components/SugestoesDemandas";
import CameraCaptureModal from "../components/CameraCaptureModal";

// Utils
import { handlePickFotos } from "../utils/handlePickFotos";
import { distanciaMetros } from "../utils/exifGps";
import { normalizeCityKey } from "../utils/normalizeCity";
import { scrollTo } from "../utils/scrollTo";
import { computeDupScore } from "../utils/triagem";
import { reverseGeocodeCity } from "../utils/reverseGeocode";

const OPCOES_TEMPO_PERCEBIDO = [
  { value: "hoje", label: "Hoje" },
  { value: "alguns_dias", label: "Há alguns dias" },
  { value: "uma_semana", label: "Há cerca de 1 semana" },
  { value: "quinze_dias", label: "Há cerca de 15 dias" },
  { value: "um_mes", label: "Há cerca de 1 mês" },
  { value: "mais_de_um_mes", label: "Há mais de 1 mês" },
];

export default function RegistrarProblema() {
  const navigate = useNavigate();

  const { city } = useContext(ThemeContext);
  const cityTheme = CITY_THEMES[city] ?? CITY_THEMES.default;

  const descricaoRef = useRef(null);
  const descricaoInputRef = useRef(null);
  const evidenciasRef = useRef(null);
  const avisoRef = useRef(null);
  const fotosPickRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const LIMITE_DISTANCIA_FOTOS_METROS = 30;

  const [categoria, setCategoria] = useState("Iluminação");
  const [tempoPercebido, setTempoPercebido] = useState("hoje");
  const [pontoReferencia, setPontoReferencia] = useState("");

  const [descricaoNovo, setDescricaoNovo] = useState("");

  const [fotosSelecionadas, setFotosSelecionadas] = useState([]);
  const fotosPreviewUrls = useFotoPreviews(fotosSelecionadas);
  const [fotosMeta, setFotosMeta] = useState([]);
  const [localRelato, setLocalRelato] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0, fileName: "" });
  const [alertOverlay, setAlertOverlay] = useState(null);

  const [triagemAtiva, setTriagemAtiva] = useState(false);

  const [acaoEscolhida, setAcaoEscolhida] = useState(null);
  const [demandaAlvoId, setDemandaAlvoId] = useState(null);
  const [enderecoDetectado, setEnderecoDetectado] = useState(null);

  const cidadeRelatoKey = useMemo(() => {
    return normalizeCityKey(enderecoDetectado?.cidade || "", city);
  }, [enderecoDetectado?.cidade, city]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFotos, setModalFotos] = useState([]);
  const [modalIdx, setModalIdx] = useState(0);
  const [modalTitle, setModalTitle] = useState("");

  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  const [demandasBase, setDemandasBase] = useState([]);
  const [aceiteResponsabilidade, setAceiteResponsabilidade] = useState(false);
  const [sugestoesIgnoradas, setSugestoesIgnoradas] = useState([]);
  
  const sugestoes = useMemo(() => {
    if (!triagemAtiva) return [];

    const input = {
      cidade: cidadeRelatoKey,
      bairro: enderecoDetectado?.bairro || "",
      rua: enderecoDetectado?.rua || "",
      descricao: "",
      lat: localRelato?.lat ?? null,
      lng: localRelato?.lng ?? null,
    };

    const ranked = demandasBase
      .map((d) => ({ d, score: computeDupScore(input, d) }))
      .sort((a, b) => b.score - a.score);

    return ranked.filter((x) => x.score >= 0.55).slice(0, 3);
  }, [triagemAtiva, cidadeRelatoKey, enderecoDetectado?.bairro, enderecoDetectado?.rua, demandasBase, localRelato?.lat, localRelato?.lng,]);

  const sugestoesVisiveis = useMemo(() => {
    return sugestoes.filter(({ d }) => !sugestoesIgnoradas.includes(d.id));
  }, [sugestoes, sugestoesIgnoradas]);

  useEffect(() => {
    setAceiteResponsabilidade(false);
  }, [acaoEscolhida]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const load = () => setDemandasBase(getDemandas());
    load();

    window.addEventListener("falaCidadao:demandas_updated", load);
    return () => window.removeEventListener("falaCidadao:demandas_updated", load);
  }, []);

  useEffect(() => {
    const temFoto = fotosSelecionadas.length >= 1;
    const latValida =
      typeof localRelato?.lat === "number" && Number.isFinite(localRelato.lat);
    const lngValida =
      typeof localRelato?.lng === "number" && Number.isFinite(localRelato.lng);

    setTriagemAtiva(temFoto && latValida && lngValida);
  }, [fotosSelecionadas.length, localRelato?.lat, localRelato?.lng]);

  useEffect(() => {
    if (triagemAtiva) return;

    setAcaoEscolhida(null);
    setDemandaAlvoId(null);
  }, [triagemAtiva]);

  useEffect(() => {
    if (!triagemAtiva) return;
    if (acaoEscolhida) return;
    if (fotosSelecionadas.length < 1) return;

    if (sugestoes.length === 0) {
      setAcaoEscolhida("novo");
      setDemandaAlvoId(null);
    }
  }, [triagemAtiva, sugestoes, acaoEscolhida, fotosSelecionadas.length]);

  function openFotosExistentes(demanda, idx = 0) {
    const fotos = Array.isArray(demanda.fotos) ? demanda.fotos : [];
    setModalFotos(fotos);
    setModalIdx(idx);
    setModalTitle(demanda.id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function prevModal() {
    if (!modalFotos.length) return;
    setModalIdx((i) => (i - 1 + modalFotos.length) % modalFotos.length);
  }

  function nextModal() {
    if (!modalFotos.length) return;
    setModalIdx((i) => (i + 1) % modalFotos.length);
  }

  async function onPickFotos(e) {
    await handlePickFotos({
      e,
      fotosSelecionadas,
      setFotosSelecionadas,
      setFotosMeta,
      setLocalRelato,
      setEnderecoDetectado,
      limiteDistanciaMetros: LIMITE_DISTANCIA_FOTOS_METROS,
      showToast,
      setAlertOverlay,
      scrollTo,
      evidenciasRef,
      fotosPickRef,
    });
  }

  async function onCameraCapture({ file, meta }) {
    const mergedFotos = [...fotosSelecionadas, file].slice(0, 3);

    if (mergedFotos.length < 1 || mergedFotos.length > 3) {
      showToast("error", "Envie entre 1 e 3 fotos para continuar.");
      scrollTo(evidenciasRef, fotosPickRef);
      return;
    }

    const novasMetasBrutas = [...fotosMeta, meta].slice(0, 3);
    const novasMetas = novasMetasBrutas.map((m, idx) => ({
      key: m.key || `${m.name}__${m.size}__${m.lastModified}`,
      name: m.name,
      size: m.size,
      lastModified: m.lastModified,
      lat: m.lat,
      lng: m.lng,
      takenAt: m.takenAt,
      source: m.source || "browser_capture",
      accuracy: m.accuracy ?? null,
    }));

    const metaRef = novasMetas[0];

    for (let i = 0; i < novasMetas.length; i++) {
      const metaAtual = novasMetas[i];
      const dist = distanciaMetros(
        metaRef.lat,
        metaRef.lng,
        metaAtual.lat,
        metaAtual.lng
      );

      if (dist > LIMITE_DISTANCIA_FOTOS_METROS) {
        setAlertOverlay({
          title: "Fotos com locais diferentes",
          message:
            `A foto ${i + 1} (${metaAtual.name}) está longe demais da primeira foto.\n\n` +
            `Distância estimada: ${Math.round(dist)}m.\n` +
            `Limite permitido: ${LIMITE_DISTANCIA_FOTOS_METROS}m.\n\n` +
            `Para garantir veracidade, envie fotos do mesmo local.`,
        });
        return;
      }
    }

    setFotosSelecionadas(mergedFotos);
    setFotosMeta(novasMetas);

    setLocalRelato({
      lat: metaRef.lat,
      lng: metaRef.lng,
      source: metaRef.source || "browser_capture",
    });

    setEnderecoDetectado(null);

    try {
      const geo = await reverseGeocodeCity(metaRef.lat, metaRef.lng);
      setEnderecoDetectado({
        cidade: geo?.cidade || "",
        estado: geo?.estado || "",
        bairro: geo?.bairro || "",
        rua: geo?.rua || "",
      });
    } catch {
      setEnderecoDetectado(null);
    }

    setCameraModalOpen(false);
    showToast("success", "Foto capturada com sucesso.");
  }

  async function removeFotoAt(idx) {
    const novasFotos = fotosSelecionadas.filter((_, i) => i !== idx);
    const novasMetas = fotosMeta.filter((_, i) => i !== idx);

    setFotosSelecionadas(novasFotos);
    setFotosMeta(novasMetas);

    if (novasMetas.length > 0) {
      const metaRef = novasMetas[0];

      setLocalRelato({
        lat: metaRef.lat,
        lng: metaRef.lng,
        source: "exif",
      });

      setEnderecoDetectado(null);

      try {
        const geo = await reverseGeocodeCity(metaRef.lat, metaRef.lng);

        setEnderecoDetectado({
          cidade: geo?.cidade || "",
          estado: geo?.estado || "",
          bairro: geo?.bairro || "",
          rua: geo?.rua || "",
        });
      } catch {
        setEnderecoDetectado(null);
      }
    } else {
      setLocalRelato(null);
      setEnderecoDetectado(null);
    }
  }

  function validarAntesDeEnviar(tipo) {
    // No MVP atual, fotos são permitidas apenas no primeiro registro.
    // Reforços não recebem novas evidências.
    if (tipo === "novo") {

      if (!categoria.trim()) {
        showToast("error", "Selecione a categoria do problema.");
        return false;
      }

      if (!tempoPercebido.trim()) {
        showToast("error", "Informe há quanto tempo você percebe esse problema.");
        return false;
      }      

      if (!pontoReferencia.trim()) {
        showToast("error", "Informe um ponto de referência para continuar.");
        return false;
      }

      if (!descricaoNovo.trim()) {
        showToast("error", "Descreva o problema para continuar.");
        scrollTo(descricaoRef, descricaoInputRef);
        return false;
      }

      if (fotosSelecionadas.length < 1 || fotosSelecionadas.length > 3) {
        showToast("error", "Envie entre 1 e 3 fotos para continuar.");
        scrollTo(evidenciasRef, fotosPickRef);
        return false;
      }
    }

    // aceite obrigatório em todos os modos
    if (!aceiteResponsabilidade) {
      showToast("error", "Confirme o aviso de responsabilidade para continuar.");
      scrollTo(avisoRef);
      return false;
    }

    return true;
  }

  function escolherReforcar(demandaId) {
    setAcaoEscolhida("reforcar");
    setDemandaAlvoId(demandaId);
    /*setFotosSelecionadas([]);
    setFotosMeta([]);
    setLocalRelato(null);
    setEnderecoDetectado(null);*/
  }

  function escolherNovo() {
    setAcaoEscolhida("novo");
    setDemandaAlvoId(null);
  }

  function confirmarReforco() {
    if (!demandaAlvoId) return;
    if (!validarAntesDeEnviar("reforcar")) return;

    reforcarDemanda({ demandaAlvoId });

    showToast("success", "Reforço registrado com sucesso.");

    window.setTimeout(() => {
      navigate(`/painel/${demandaAlvoId}`);
    }, 2400);
  }

  function ignorarSugestao(demandaId) {
    setSugestoesIgnoradas((prev) =>
      prev.includes(demandaId) ? prev : [...prev, demandaId]
    );
  }

  function showToast(type, message, ms = 2600) {
    setToast({ type, message });

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, ms);
  }

  function toastClass(type) {
    switch (type) {
      case "success":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
      case "error":
        return "border-rose-500/40 bg-rose-500/10 text-rose-200";
      default:
        return "border-sky-500/40 bg-sky-500/10 text-sky-200";
    }
  }

  function validarIntegridadeGps() {
    if (
      !localRelato ||
      typeof localRelato.lat !== "number" ||
      typeof localRelato.lng !== "number" ||
      !Number.isFinite(localRelato.lat) ||
      !Number.isFinite(localRelato.lng)
    ) {
      setAlertOverlay({
        title: "Localização ausente",
        message:
          "Não foi possível confirmar a localização (GPS) do relato. " +
          "Selecione as fotos novamente (arquivos originais da câmera).",
      });
      scrollTo(evidenciasRef, fotosPickRef);
      return false;
    }

    if (!Array.isArray(fotosMeta) || fotosMeta.length !== fotosSelecionadas.length) {
      setAlertOverlay({
        title: "Falha de integridade (GPS)",
        message:
          "Não foi possível confirmar a localização de todas as fotos. " +
          "Por segurança, selecione as fotos novamente.",
      });
      scrollTo(evidenciasRef, fotosPickRef);
      return false;
    }

    return true;
  }

  async function confirmarNovo() {
    if (!validarAntesDeEnviar("novo")) return;
    if (!validarIntegridadeGps()) return;

    setIsProcessing(true);
    setProgress({ done: 0, total: fotosSelecionadas.length, fileName: "" });

    await new Promise((r) => setTimeout(r, 0));

    try {
      showToast("info", "Processando fotos (compressão + conversão)...");

      const res = await criarDemanda({
        cityEmFoco: city,
        cidadeRelatoKey,
        enderecoDetectado,
        categoria,
        tempoPercebido,
        localRelato,
        fotosSelecionadas,
        fotosMeta,
        pontoReferencia,
        descricao: descricaoNovo,
        onProgress: setProgress,
      });

      if (!res.ok) {
        if (res.reason === "PESO") {
          showToast("error", res.message || "As fotos ficaram muito pesadas.");
          scrollTo(evidenciasRef, fotosPickRef);
          return;
        }

        if (res.reason === "CONVERSAO" || res.reason === "QTD_FOTOS") {
          showToast(
            "error",
            res.message || "Não foi possível validar as fotos após o processamento."
          );
          scrollTo(evidenciasRef, fotosPickRef);
          return;
        }

        showToast(
          "error",
          "Não foi possível processar as fotos. Tente novamente com imagens menores."
        );
        return;
      }

      showToast("success", "Demanda registrada com sucesso.");
      navigate(`/painel/${res.criada.id}`);
    } catch (err) {
      console.error(err);
      showToast("error", "Não foi possível processar as fotos. Tente novamente com imagens menores.");
    } finally {
      setIsProcessing(false);
      setProgress({ done: 0, total: 0, fileName: "" });
    }
  }

  function resetTotal() {
    setCategoria("Iluminação");
    setTempoPercebido("hoje");
    setPontoReferencia("");

    setTriagemAtiva(false);
    setAcaoEscolhida(null);
    setDemandaAlvoId(null);

    setDescricaoNovo("");
    setFotosSelecionadas([]);
    setFotosMeta([]);
    setLocalRelato(null);
    setEnderecoDetectado(null);
    setAceiteResponsabilidade(false);

    setIsProcessing(false);
    setProgress({ done: 0, total: 0, fileName: "" });
    setToast(null);
    setAlertOverlay(null);

    setModalOpen(false);
    setModalFotos([]);
    setModalIdx(0);
    setModalTitle("");
  }

  const evidenciasValidas =
    fotosSelecionadas.length >= 1 && fotosSelecionadas.length <= 3;

  const aceiteValido = aceiteResponsabilidade;

  const podeReforcar = !!demandaAlvoId && aceiteValido;

  const podeRegistrarNovo =
    evidenciasValidas &&
    aceiteValido &&
    categoria.trim().length > 0 &&
    tempoPercebido.trim().length > 0 &&
    pontoReferencia.trim().length > 0 &&
    descricaoNovo.trim().length > 0;
    
  const mostrarPainelSugestoes =
  triagemAtiva &&
  sugestoesVisiveis.length > 0 &&
  (acaoEscolhida === null || acaoEscolhida === "reforcar");

  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
        {toast && (
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-[420px]">
            <div
              className={`rounded-xl border backdrop-blur px-4 py-3 text-sm shadow-lg text-center ${toastClass(
                toast.type
              )}`}
            >
              <p className="leading-snug">{toast.message}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Registrar um problema
            </h1>
            <p className="text-textsoft text-sm leading-relaxed max-w-2xl">
              Envie até 3 fotos tiradas no local do problema para validar a ocorrência.
            </p>
          </div>
          <BackButton to="/" />

        </div>

        {(acaoEscolhida === null || acaoEscolhida === "novo") && (
          <>

            <EvidenciasPicker
              evidenciasRef={evidenciasRef}
              fotosPickRef={fotosPickRef}
              fotosSelecionadas={fotosSelecionadas}
              fotosPreviewUrls={fotosPreviewUrls}
              fotosMeta={fotosMeta}
              onPickFotos={onPickFotos}
              onOpenCamera={() => setCameraModalOpen(true)}
              onRemoveFoto={removeFotoAt}
              enderecoDetectado={enderecoDetectado}
            />
          </>
        )}

        {mostrarPainelSugestoes && (
          <SugestoesDemandas
            sugestoes={sugestoesVisiveis}
            demandaAlvoId={demandaAlvoId}
            onVerDetalhes={(id) => navigate(`/painel/${id}`)}
            onAbrirFotos={(demanda, idx) => openFotosExistentes(demanda, idx)}
            onReforcar={(id) => escolherReforcar(id)}
            onRegistrarNovo={(id) => ignorarSugestao(id)}
          />
        )}

        {triagemAtiva && acaoEscolhida && (
          <>

            {acaoEscolhida === "novo" && (
              <div
                ref={descricaoRef}
                className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-3"
              >
                <h2 className="text-lg font-semibold">Complete as informações do novo registro</h2>

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
                        <option key={opcao.value} value={opcao.value} className="text-black">
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
            )}

            <div
              ref={avisoRef}
              className="rounded-2xl border border-surfaceLight bg-surfaceLight/10 p-4 space-y-2"
            >
              <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-2.5">
                <input
                  type="checkbox"
                  checked={aceiteResponsabilidade}
                  onChange={(e) => setAceiteResponsabilidade(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-[12px] text-textsoft leading-5">
                  <span className="text-textmain font-semibold">
                    Aviso de responsabilidade:
                  </span>{" "}
                    ao enviar uma ocorrência, você confirma que as informações e imagens são verdadeiras e 
                    correspondem ao problema relatado. O envio de conteúdo falso, manipulado ou usado para 
                    brincadeiras, fraude ou denúncia indevida pode resultar em bloqueio de acesso, exclusão
                     de registros e adoção das medidas cabíveis conforme a legislação.
                </span>
              </label>

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
            </div>
          </>
        )}
      </div>

      <ModalFotos
        open={modalOpen}
        fotos={modalFotos}
        index={modalIdx}
        onClose={closeModal}
        onPrev={prevModal}
        onNext={nextModal}
        title={modalTitle}
      />

      <CameraCaptureModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={onCameraCapture}
        showToast={showToast}
      />
      
      <AlertOverlay
        open={!!alertOverlay}
        title={alertOverlay?.title}
        message={alertOverlay?.message}
        onClose={() => setAlertOverlay(null)}
      />

      <ProcessingOverlay open={isProcessing} progress={progress} />
    </section>
  );
}
