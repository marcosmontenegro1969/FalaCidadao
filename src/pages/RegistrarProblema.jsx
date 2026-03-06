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
import EnderecoDetectadoCard from "../components/EnderecoDetectadoCard";
import EvidenciasPicker from "../components/EvidenciasPicker";
import ModalFotos from "../components/ModalFotos";
import ProcessingOverlay from "../components/ProcessingOverlay";
import PulseButton from "../components/PulseButton";
import SecondaryActionButton from "../components/SecondaryActionButton";
import SugestoesDemandas from "../components/SugestoesDemandas";

// Utils
import { handlePickFotos } from "../utils/handlePickFotos";
import { normalizeCityKey } from "../utils/normalizeCity";
import { scrollTo } from "../utils/scrollTo";
import { computeDupScore } from "../utils/triagem";

export default function RegistrarProblema() {
  const navigate = useNavigate();

  const { city } = useContext(ThemeContext);
  const cityTheme = CITY_THEMES[city] ?? CITY_THEMES.default;

  const descricaoRef = useRef(null);
  const descricaoInputRef = useRef(null);
  const evidenciasRef = useRef(null);
  const avisoRef = useRef(null);
  const fotosPickRef = useRef(null);
  const LIMITE_DISTANCIA_FOTOS_METROS = 30;

  const [categoria, setCategoria] = useState("Iluminação");
  const [pontoReferencia, setPontoReferencia] = useState("");

  const [descricaoNovo, setDescricaoNovo] = useState("");
  const [descricaoReforco, setDescricaoReforco] = useState("");

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

  useEffect(() => {
    setAceiteResponsabilidade(false);
  }, [acaoEscolhida]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFotos, setModalFotos] = useState([]);
  const [modalIdx, setModalIdx] = useState(0);
  const [modalTitle, setModalTitle] = useState("");

  const [demandasBase, setDemandasBase] = useState([]);
  const [aceiteResponsabilidade, setAceiteResponsabilidade] = useState(false);
  const triagemHabilitada = categoria.trim().length > 0;

  useEffect(() => {
    setTriagemAtiva(false);
    setAcaoEscolhida(null);
    setDemandaAlvoId(null);
  }, [categoria, pontoReferencia]);

  useEffect(() => {
    const load = () => setDemandasBase(getDemandas());
    load();

    window.addEventListener("falaCidadao:demandas_updated", load);
    return () => window.removeEventListener("falaCidadao:demandas_updated", load);
  }, []);

  const sugestoes = useMemo(() => {
    if (!triagemAtiva) return [];

    const input = {
      cidade: cidadeRelatoKey,
      categoria,
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
  }, [triagemAtiva, categoria, cidadeRelatoKey, enderecoDetectado?.bairro, enderecoDetectado?.rua, demandasBase, localRelato?.lat, localRelato?.lng,]);

  useEffect(() => {
    if (!triagemAtiva) return;
    if (acaoEscolhida) return;

    // Só decide "novo" depois que houver evidências mínimas (1+ fotos).
    // Antes disso, a triagem ainda não tem lat/lng e vai dar falso "0 sugestões".
    if (fotosSelecionadas.length < 1) return;

    if (sugestoes.length === 0) {
      setAcaoEscolhida("novo");
      setDemandaAlvoId(null);
    }
  }, [triagemAtiva, sugestoes, acaoEscolhida, fotosSelecionadas.length]);

  function iniciarTriagem() {
    if (!triagemHabilitada) return;
    setTriagemAtiva(true);
  }

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

  function removeFotoAt(idx) {
    setFotosSelecionadas((arr) => arr.filter((_, i) => i !== idx));
  }

  function validarAntesDeEnviar(tipo) {
    // tipo: "novo" | "anexar" | "reforcar"

    if (tipo === "novo") {
      if (!descricaoNovo.trim()) {
        showToast("error", "Descreva o problema para continuar.");
        scrollTo(descricaoRef, descricaoInputRef);
        return false;
      }
    }

    if (tipo === "reforcar") {
      if (!descricaoReforco.trim()) {
        showToast("error", "Escreva uma frase curta para registrar o reforço.");
        scrollTo(descricaoRef, descricaoInputRef);
        return false;
      }
    }

    // evidências só em novo registro (num proximo mvp poderemos permitir o envio de fotos também no reforço)
   if (tipo === "novo") {
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
    setFotosSelecionadas([]);
  }

  function escolherNovo() {
    setAcaoEscolhida("novo");
    setDemandaAlvoId(null);
  }

  function confirmarReforco() {
    if (!demandaAlvoId) return;
    if (!validarAntesDeEnviar("reforcar")) return;

    reforcarDemanda({ demandaAlvoId });

    alert(`MVP: reforço registrado para ${demandaAlvoId}.`);
    navigate(`/painel/${demandaAlvoId}`);
  }

  function showToast(type, message, ms = 2600) {
    setToast({ type, message });

    if (showToast._t) window.clearTimeout(showToast._t);

    showToast._t = window.setTimeout(() => {
      setToast(null);
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

        showToast("error", "Não foi possível processar as fotos. Tente novamente com imagens menores.");
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
    setPontoReferencia("");

    setTriagemAtiva(false);
    setAcaoEscolhida(null);
    setDemandaAlvoId(null);

    setDescricaoNovo("");
    setDescricaoReforco("");
    setFotosSelecionadas([]);
    setAceiteResponsabilidade(false);

    setIsProcessing(false);
    setProgress({ done: 0, total: 0, fileName: "" });
    setToast(null);

    setModalOpen(false);
    setModalFotos([]);
    setModalIdx(0);
    setModalTitle("");
  }

  const podeEnviarEvidencias = aceiteResponsabilidade && fotosSelecionadas.length >= 1 && fotosSelecionadas.length <= 3;

  const podeReforcar = aceiteResponsabilidade && descricaoReforco.trim().length > 0;

  const podeRegistrarNovo = podeEnviarEvidencias && descricaoNovo.trim().length > 0;

  const mostrarPainelSugestoes = triagemAtiva && sugestoes.length > 0 && (acaoEscolhida === null || acaoEscolhida === "reforcar");

  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
        {toast && (
          <div className="fixed z-50 top-4 right-4 left-4 md:left-auto md:w-[420px]">
            <div
              className={`rounded-xl border backdrop-blur px-4 py-3 text-sm shadow-lg ${toastClass(
                toast.type
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="leading-snug">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="text-xs opacity-80 hover:opacity-100"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Registrar um problema
            </h1>
            <p className="text-textsoft text-sm leading-relaxed">
              Cidade em foco:{" "}
              <span className="text-textmain">
                {cityTheme.cidadeShort ?? cityTheme.name}
              </span>
              . Primeiro, vamos checar se já existe algo parecido (para você decidir o melhor caminho).
            </p>
          </div>
          <BackButton to="/" />

        </div>

        {acaoEscolhida === null && (
          <>
            <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Local e categoria do problema</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <label className="space-y-1 md:col-span-4">
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

                <label className="space-y-1 md:col-span-8">
                  <span className="text-xs text-textmuted">
                    Ponto de referência
                  </span>
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

                <div className="md:col-span-4 flex items-end">
                  <PulseButton
                    onClick={iniciarTriagem}
                    disabled={!triagemHabilitada}
                    title={
                      triagemHabilitada
                        ? "Continuar para registrar o problema"
                        : "Selecione uma categoria para continuar"
                    }
                    intense={triagemHabilitada}
                    className={`w-full justify-center ${triagemHabilitada ? "shadow-[0_0_0_1px_rgba(16,185,129,0.15)]" : ""
                      }`}
                  >
                    Continuar
                  </PulseButton>
                </div>
              </div>

              {!triagemAtiva ? (
                <p className="text-sm text-textmuted">
                  Selecione a <span className="text-textmain">categoria, informe um ponto de referência</span> e clique em{" "}
                  <span className="text-textmain">“Continuar”</span>. Em seguida, anexe as fotos com{" "}
                  <span className="text-textmain">GPS</span> para detectarmos o endereço automaticamente.
                  O sistema vai checar se já existe algo parecido e, se encontrar, você decide:{" "}
                  <span className="text-textmain">reforçar o já registrado</span>,{" "}
                  <span className="text-textmain">registrar</span> como novo problema.
                </p>
              ) : null}
            </div>

            {triagemAtiva && fotosSelecionadas.length >= 1 && sugestoes.length === 0 && (
              <p className="text-sm text-textmuted">
                Não encontramos demandas parecidas. Pode seguir com a descrição e as evidências.
              </p>
            )}
          </>
        )}

        {mostrarPainelSugestoes && (
          <SugestoesDemandas
            sugestoes={sugestoes}
            demandaAlvoId={demandaAlvoId}
            onVerDetalhes={(id) => navigate(`/painel/${id}`)}
            onAbrirFotos={(demanda, idx) => openFotosExistentes(demanda, idx)}
            onReforcar={(id) => escolherReforcar(id)}
            onRegistrarNovo={() => escolherNovo()}
          />
        )}

        {triagemAtiva && (
          <>
            {!mostrarPainelSugestoes && 
              (acaoEscolhida === null || acaoEscolhida === "novo") && (             
                <EvidenciasPicker
                  evidenciasRef={evidenciasRef}
                  fotosPickRef={fotosPickRef}
                  fotosSelecionadas={fotosSelecionadas}
                  fotosPreviewUrls={fotosPreviewUrls}
                  onPickFotos={onPickFotos}
                  onRemoveFoto={removeFotoAt}
                />
            )}

            <EnderecoDetectadoCard enderecoDetectado={enderecoDetectado} localRelato={localRelato} />

            {acaoEscolhida && (
              <div
                ref={descricaoRef}
                className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-3"
              >
                <h2 className="text-lg font-semibold">
                  {acaoEscolhida === "reforcar" ? "Confirmação rápida" : "Descrição do problema"}
                </h2>
                <textarea
                  ref={descricaoInputRef}
                  value={acaoEscolhida === "reforcar" ? descricaoReforco : descricaoNovo}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (acaoEscolhida === "reforcar") setDescricaoReforco(v);
                    else setDescricaoNovo(v);
                  }}
                  rows={acaoEscolhida === "reforcar" ? 2 : 4}
                  placeholder={
                    acaoEscolhida === "reforcar"
                      ? "Ex.: Confirmo que o problema continua e está afetando o local."
                      : "Ex.: Buraco grande na via, próximo ao cruzamento com a Rua X, causando risco a pedestres e veículos."
                  }
                  className={[
                    "w-full rounded-lg px-3 py-2 text-sm leading-relaxed",
                    "bg-surfaceLight text-textmain border border-borderSubtle",
                    "outline-none focus:ring-2 focus:ring-primary/40",
                    "hover:bg-surfaceLight/70 transition",
                    "placeholder:text-textmuted/70",
                    "resize-none",
                  ].join(" ")}
                />
              </div>
            )}
            <div
              ref={avisoRef}
              className="rounded-2xl border border-surfaceLight bg-surfaceLight/10 p-5 space-y-3"
            >
              <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <input
                  type="checkbox"
                  checked={aceiteResponsabilidade}
                  onChange={(e) => setAceiteResponsabilidade(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-[12px] text-textsoft leading-relaxed">
                  <span className="text-textmain font-semibold">
                    Aviso de responsabilidade:
                  </span>{" "}
                  ao enviar conteúdo, você declara que as informações e imagens são reais e relacionadas ao problema descrito.
                  O uso indevido pode resultar em bloqueio de acesso e medidas cabíveis conforme a legislação.
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
