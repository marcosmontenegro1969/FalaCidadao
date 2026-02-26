// src/pages/RegistrarProblema.jsx

// Libs externas
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Context/tema
import { ThemeContext } from "../context/ThemeContext";
import { CITY_THEMES } from "../theme/cities";

//Storage
import { addDemanda, getDemandas, setDemandas } from "../storage/demandasStorage";

// Constants
import { CATEGORIAS_DEMANDAS } from "../constants/categoriasDemandas";

// Components
import AlertOverlay from "../components/AlertOverlay";
import BackButton from "../components/BackButton";
import EvidenceGrid from "../components/EvidenceGrid";
import ModalFotos from "../components/ModalFotos";
import ProcessingOverlay from "../components/ProcessingOverlay";
import PulseButton from "../components/PulseButton";
import SecondaryActionButton from "../components/SecondaryActionButton";

// Utils
import { MAX_FOTOS_TOTAL_BYTES, estimateBase64Bytes, filesToBase64, formatBytes } from "../utils/photosPipeline";
import { distanciaMetros, fileKey, lerGpsExif } from "../utils/exifGps";
import { reverseGeocodeCity } from "../utils/reverseGeocode";
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

  function scrollTo(sectionRef, focusRef) {
    const el = sectionRef?.current;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    const target = focusRef?.current;
    if (target && typeof target.focus === "function") {
      window.setTimeout(() => target.focus(), 250);
    }
  }

  const [categoria, setCategoria] = useState("Iluminação");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");

  const [descricaoNovo, setDescricaoNovo] = useState("");
  const [descricaoAnexo, setDescricaoAnexo] = useState("");
  const [descricaoReforco, setDescricaoReforco] = useState("");

  const [fotosSelecionadas, setFotosSelecionadas] = useState([]); 
  const [fotosMeta, setFotosMeta] = useState([]); 
  const [localRelato, setLocalRelato] = useState(null); 
  const [aceiteResponsabilidade, setAceiteResponsabilidade] = useState(false);
  const [fotosPreviewUrls, setFotosPreviewUrls] = useState([]); 

  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null); 
  const [progress, setProgress] = useState({ done: 0, total: 0, fileName: "" });
  const [alertOverlay, setAlertOverlay] = useState(null); 

  const [triagemAtiva, setTriagemAtiva] = useState(false);

  const [acaoEscolhida, setAcaoEscolhida] = useState(null);
  const [demandaAlvoId, setDemandaAlvoId] = useState(null);

  useEffect(() => {
    setAceiteResponsabilidade(false);
  }, [acaoEscolhida]);

  useEffect(() => {
    const urls = fotosSelecionadas.map((file) => URL.createObjectURL(file));
    setFotosPreviewUrls(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [fotosSelecionadas]);  

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFotos, setModalFotos] = useState([]);
  const [modalIdx, setModalIdx] = useState(0);
  const [modalTitle, setModalTitle] = useState("");

  const [demandasBase, setDemandasBase] = useState([]);

  const triagemHabilitada =
    categoria.trim().length > 0 &&
    bairro.trim().length > 0 &&
    rua.trim().length > 0;

  useEffect(() => {
    setTriagemAtiva(false);
    setAcaoEscolhida(null);
    setDemandaAlvoId(null);
  }, [categoria, bairro, rua, pontoReferencia]);

  useEffect(() => {
    const load = () => setDemandasBase(getDemandas());
    load();

    window.addEventListener("falaCidadao:demandas_updated", load);
    return () => window.removeEventListener("falaCidadao:demandas_updated", load);
  }, []);

  const sugestoes = useMemo(() => {
    if (!triagemAtiva) return [];

    const input = {
      cidade: city,
      categoria,
      bairro,
      rua,
      descricao: "", 
    };

    return demandasBase
      .map((d) => ({ d, score: computeDupScore(input, d) }))
      .filter((x) => x.score >= 0.55)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [triagemAtiva, city, categoria, bairro, rua, demandasBase]);

  useEffect(() => {
    if (triagemAtiva && sugestoes.length === 0 && !acaoEscolhida) {
      setAcaoEscolhida("novo");
      setDemandaAlvoId(null);
    }
  }, [triagemAtiva, sugestoes, acaoEscolhida]);

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
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Sempre zerar o input para permitir re-selecionar o mesmo arquivo
    e.target.value = "";

    // Junta com as já selecionadas e corta em 5
    const merged = [...fotosSelecionadas, ...files].slice(0, 5);

    if (merged.length < 2 || merged.length > 5) {
      showToast("error", "Envie entre 2 e 5 fotos para continuar.");
      scrollTo(evidenciasRef, fotosPickRef);
      return;
    }

    try {

      const metas = [];
      for (let i = 0; i < merged.length; i++) {
        const f = merged[i];
        const gps = await lerGpsExif(f);

        if (!gps.ok) {
          setAlertOverlay({
            title: `Foto ${i + 1} sem GPS (EXIF)`,
            message:
              `Arquivo: ${f.name}\n\n` +
              `Essa foto está sem dados de localização. ` +
              `Tire a foto com a câmera do celular com a localização ativada e anexe o arquivo original. ` +
              `Evite WhatsApp/Instagram, pois geralmente removem os dados.`,
          });

          scrollTo(evidenciasRef, fotosPickRef);
          return; // BLOQUEIA: não atualiza estado
        }
        
        metas.push({
          key: fileKey(f),
          name: f.name,
          size: f.size,
          lastModified: f.lastModified,
          lat: gps.lat,
          lng: gps.lng,
          takenAt: gps.takenAt,
        });
      }

      const ref = metas[0]; 

      for (let i = 0; i < metas.length; i++) {
        const m = metas[i];
        const dist = distanciaMetros(ref.lat, ref.lng, m.lat, m.lng);

        if (dist > LIMITE_DISTANCIA_FOTOS_METROS) {
          setAlertOverlay({
            title: "Fotos com locais diferentes",
            message:
              `A foto ${i + 1} (${m.name}) está longe demais da primeira foto.\n\n` +
              `Distância estimada: ${Math.round(dist)}m.\n` +
              `Limite permitido: ${LIMITE_DISTANCIA_FOTOS_METROS}m.\n\n` +
              `Para garantir veracidade, envie fotos do mesmo local.`,
          });

          scrollTo(evidenciasRef, fotosPickRef);
          return; 
        }
      }

      setFotosSelecionadas(merged);
      setFotosMeta(metas);

      setLocalRelato({
        lat: metas[0].lat,
        lng: metas[0].lng,
        source: "exif",
      });

    } catch (err) {
      console.error(err);
      showToast(
        "error",
        "Não foi possível ler o EXIF das fotos. Tente novamente com imagens originais da câmera."
      );
      scrollTo(evidenciasRef, fotosPickRef);
    }
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

    if (tipo === "anexar") {
      if (!descricaoAnexo.trim()) {
        showToast("error", "Explique rapidamente por que estas novas fotos ajudam (o que mudou).");
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

    // evidências só em novo/anexar
    if (tipo === "novo" || tipo === "anexar") {
      if (fotosSelecionadas.length < 2 || fotosSelecionadas.length > 5) {
        showToast("error", "Envie entre 2 e 5 fotos para continuar.");
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

  function escolherAnexar(demandaId) {
    setAcaoEscolhida("anexar");
    setDemandaAlvoId(demandaId);
  }

  function escolherNovo() {
    setAcaoEscolhida("novo");
    setDemandaAlvoId(null);
  }

  function confirmarReforco() {
    if (!demandaAlvoId) return;
    if (!validarAntesDeEnviar("reforcar")) return;

    const all = getDemandas();
    const today = new Date().toISOString().slice(0, 10);

    const next = all.map((d) => {
      if (d.id !== demandaAlvoId) return d;

      const prev = d.impacto?.confirmacoes ?? 0;
      return {
        ...d,
        impacto: {
          confirmacoes: prev + 1,
          ultimaConfirmacao: today,
        },
      };
    });

    setDemandas(next);

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
  
  async function confirmarAnexo() {
    if (!demandaAlvoId) return;
    if (!validarAntesDeEnviar("anexar")) return;
    if (!validarIntegridadeGps()) return;

    const allAntes = getDemandas();
    const demandaAlvo = allAntes.find((d) => d.id === demandaAlvoId);

    if (demandaAlvo?.localRelato?.lat && demandaAlvo?.localRelato?.lng) {
      const dist = distanciaMetros(
        demandaAlvo.localRelato.lat,
        demandaAlvo.localRelato.lng,
        localRelato.lat,
        localRelato.lng
      );

      if (dist > LIMITE_DISTANCIA_FOTOS_METROS) {
        setAlertOverlay({
          title: "Local diferente do registro original",
          message:
            `As novas fotos parecem ser de outro lugar.\n\n` +
            `Distância estimada: ${Math.round(dist)}m.\n` +
            `Limite permitido: ${LIMITE_DISTANCIA_FOTOS_METROS}m.\n\n` +
            `Anexe fotos do mesmo local do problema registrado.`,
        });
        return;
      }
    }

    setIsProcessing(true);
    setProgress({ done: 0, total: fotosSelecionadas.length, fileName: "" });

    await new Promise((r) => setTimeout(r, 0));

    try {
      showToast("info", "Processando fotos (compressão + conversão)...");

      const novasFotosBase64 = await filesToBase64(fotosSelecionadas, {
        maxW: 1280,
        maxH: 1280,
        quality: 0.72,
        mime: "image/jpeg",
        onProgress: setProgress,
      });

      const totalBytes = novasFotosBase64.reduce(
        (acc, x) => acc + estimateBase64Bytes(x),
        0
      );

      if (totalBytes > MAX_FOTOS_TOTAL_BYTES) {
        showToast(
          "error",
          `As fotos ficaram muito pesadas (${formatBytes(totalBytes)}). Tente menos fotos ou imagens menores.`
        );
        setIsProcessing(false);
        setProgress({ done: 0, total: 0, fileName: "" });
        scrollTo(evidenciasRef, fotosPickRef);
        return;
      }

      const all = getDemandas();

      const next = all.map((d) => {
        if (d.id !== demandaAlvoId) return d;

        const fotosAtuais = Array.isArray(d.fotos) ? d.fotos : [];
        const metasAtuais = Array.isArray(d.fotosMeta) ? d.fotosMeta : [];

        return {
          ...d,
          fotos: [...fotosAtuais, ...novasFotosBase64],
          fotosMeta: [...metasAtuais, ...fotosMeta],
        };
      });
           
      setDemandas(next);

      showToast("success", `Evidências anexadas à demanda ${demandaAlvoId}.`);
      navigate(`/painel/${demandaAlvoId}`);
    } catch (err) {
      console.error(err);
      showToast("error", "Falha ao anexar evidências. Tente fotos menores.");
    } finally {
      setIsProcessing(false);
      setProgress({ done: 0, total: 0, fileName: "" });
    }
  }

  async function confirmarNovo() {
    if (!validarAntesDeEnviar("novo")) return;
    if (!validarIntegridadeGps()) return;

    setIsProcessing(true);
    setProgress({ done: 0, total: fotosSelecionadas.length, fileName: "" });

    await new Promise((r) => setTimeout(r, 0));

    try {
      showToast("info", "Processando fotos (compressão + conversão)...");

      const today = new Date().toISOString().slice(0, 10);

      const fotosBase64 = await filesToBase64(fotosSelecionadas, {
        maxW: 1280,
        maxH: 1280,
        quality: 0.72,
        mime: "image/jpeg",
        onProgress: setProgress,
      });

      const totalBytes = fotosBase64.reduce(
        (acc, x) => acc + estimateBase64Bytes(x),
        0
      );

      if (totalBytes > MAX_FOTOS_TOTAL_BYTES) {
        showToast(
          "error",
          `As fotos ficaram muito pesadas (${formatBytes(totalBytes)}). Tente menos fotos ou imagens menores.`
        );
        setIsProcessing(false);
        setProgress({ done: 0, total: 0, fileName: "" });
        scrollTo(evidenciasRef, fotosPickRef);
        return;
      }
 
      let cidadeRelatoDetectada = city;
      let estadoRelatoDetectado = "";

      try {
        if (localRelato?.lat && localRelato?.lng) {
          const r = await reverseGeocodeCity(localRelato.lat, localRelato.lng);
          if (r?.cidade) cidadeRelatoDetectada = r.cidade;
          if (r?.estado) estadoRelatoDetectado = r.estado;
        }
      } catch (e) {
        // MVP: se falhar, mantém fallback (city)
        console.warn("Reverse geocoding falhou:", e);
      }

      const criada = addDemanda({
        cidadeEmFoco: city,
        cidadeRelato: cidadeRelatoDetectada, 
        estadoRelato: estadoRelatoDetectado, 
        cidade: cidadeRelatoDetectada, 
        categoria,
        localRelato,
        fotosMeta,
        bairro,
        rua,
        pontoReferencia: pontoReferencia.trim() || "",
        descricao: descricaoNovo.trim(),
        fotos: fotosBase64,
        impacto: { confirmacoes: 1, ultimaConfirmacao: today },
        status: "Em análise",
        userId: "cidadao_001",
      });

      showToast("success", "Demanda registrada com sucesso.");
      navigate(`/painel/${criada.id}`);
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
    setBairro("");
    setRua("");
    setPontoReferencia("");

    setTriagemAtiva(false);
    setAcaoEscolhida(null);
    setDemandaAlvoId(null);

    setDescricaoNovo("");
    setDescricaoReforco("");
    setDescricaoAnexo("");
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

  const podeEnviarEvidencias =
    aceiteResponsabilidade &&
    fotosSelecionadas.length >= 2 &&
    fotosSelecionadas.length <= 5;

  const podeReforcar = aceiteResponsabilidade && descricaoReforco.trim().length > 0;

  const podeRegistrarNovo = podeEnviarEvidencias && descricaoNovo.trim().length > 0;

  const podeAnexar = podeEnviarEvidencias && descricaoAnexo.trim().length > 0;

  const motivoBloqueioAnexar = !descricaoAnexo.trim()
    ? "Explique por que estas novas fotos ajudam."
    : !aceiteResponsabilidade
    ? "Confirme o aviso de responsabilidade."
    : fotosSelecionadas.length < 2
    ? "Envie pelo menos 2 fotos."
    : fotosSelecionadas.length > 5
    ? "Remova fotos para ficar no máximo de 5."
    : null;

  const mostrarPainelSugestoes =
    triagemAtiva &&
    sugestoes.length > 0 &&
    (acaoEscolhida === null || acaoEscolhida === "anexar" || acaoEscolhida === "reforcar");

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

                <label className="space-y-1 md:col-span-4">
                  <span className="text-xs text-textmuted">Bairro</span>
                  <input
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex.: Boa Viagem"
                    className={[
                      "w-full rounded-lg px-3 py-2 text-sm",
                      "bg-surfaceLight text-textmain border border-borderSubtle",
                      "outline-none focus:ring-2 focus:ring-primary/40",
                      "hover:bg-surfaceLight/70 transition",
                      "placeholder:text-textmuted/70",
                    ].join(" ")}
                  />
                </label>

                <label className="space-y-1 md:col-span-4">
                  <span className="text-xs text-textmuted">Rua</span>
                  <input
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    placeholder="Ex.: Rua Domingos Ferreira"
                    className={[
                      "w-full rounded-lg px-3 py-2 text-sm",
                      "bg-surfaceLight text-textmain border border-borderSubtle",
                      "outline-none focus:ring-2 focus:ring-primary/40",
                      "hover:bg-surfaceLight/70 transition",
                      "placeholder:text-textmuted/70",
                    ].join(" ")}
                  />
                </label>

                <label className="space-y-1 md:col-span-9">
                  <span className="text-xs text-textmuted">
                    Ponto de referência (opcional)
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

                <div className="md:col-span-3 flex items-end">
                  <PulseButton
                    onClick={iniciarTriagem}
                    disabled={!triagemHabilitada}
                    title={
                      triagemHabilitada
                        ? "Continuar para registrar o problema"
                        : "Preencha Categoria, Bairro e Rua para habilitar"
                    }
                    intense={triagemHabilitada}
                    className={`w-full justify-center ${
                      triagemHabilitada ? "shadow-[0_0_0_1px_rgba(16,185,129,0.15)]" : ""
                    }`}
                  >
                    Continuar
                  </PulseButton>
                </div>
              </div>

              {!triagemAtiva ? (
                <p className="text-sm text-textmuted">
                  Preencha no mínimo{" "}
                  <span className="text-textmain">Categoria + Bairro + Rua</span> e clique em{" "}
                  <span className="text-textmain">“Continuar”</span>. O sistema vai checar
                  automaticamente se já existe algo parecido e, se encontrar, você decide:{" "}
                  <span className="text-textmain">reforçar</span>,{" "}
                  <span className="text-textmain">anexar</span> novas fotos, ou{" "}
                  <span className="text-textmain">registrar</span> como novo.
                </p>
              ) : null}
            </div>

            {triagemAtiva && sugestoes.length === 0 && (
              <p className="text-sm text-textmuted">
                Não encontramos demandas parecidas. Pode seguir com a descrição e as evidências.
              </p>
            )}
          </>
        )}

        {mostrarPainelSugestoes && (
          <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">
                Possíveis demandas já registradas
              </h2>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-textsoft">
                Encontramos possíveis correspondências. Confira as fotos para reconhecer se é o mesmo problema.
              </p>

              {sugestoes.map(({ d, score }) => (
                <div
                  key={d.id}
                  className={[
                    "rounded-2xl p-4 space-y-3 transition",
                    d.id === demandaAlvoId
                      ? "border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                      : "border-white/10 bg-white/5",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/90">
                          {d.id}
                        </span>
                        <span className="px-2 py-1 rounded-full border border-surfaceLight text-textmuted">
                          {d.categoria} · {d.bairro}
                        </span>
                        <span className="text-textmuted">
                          Similaridade: {Math.round(score * 100)}%
                        </span>
                      </div>

                      <p className="text-sm text-slate-100">{d.descricao}</p>

                      <p className="text-[11px] text-textmuted">
                        Confirmado por {d.impacto?.confirmacoes ?? 0} cidadão(s) · Última:{" "}
                        {d.impacto?.ultimaConfirmacao ?? "—"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/painel/${d.id}`)}
                      className="px-4 py-2 rounded-lg border border-surfaceLight text-sm text-textmain hover:bg-surfaceLight/40 transition"
                    >
                      Ver detalhes
                    </button>
                  </div>
                  
                  {Array.isArray(d.fotos) && d.fotos.length ? (
                    <EvidenceGrid
                      fotos={d.fotos.slice(0, 5)}
                      onClickFoto={(idx) => openFotosExistentes(d, idx)}
                    />
                  ) : (
                    <p className="text-[12px] text-textmuted">Sem fotos neste mock.</p>
                  )}

                  {acaoEscolhida === null && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <SecondaryActionButton onClick={() => escolherReforcar(d.id)}>
                        É o mesmo: reforçar
                      </SecondaryActionButton>

                      <SecondaryActionButton onClick={() => escolherAnexar(d.id)}>
                        É o mesmo: enviar novas fotos
                      </SecondaryActionButton>

                      <SecondaryActionButton onClick={escolherNovo}>
                        Não é o mesmo: registrar novo
                      </SecondaryActionButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {acaoEscolhida && (
          <>
            {(acaoEscolhida === "novo" || acaoEscolhida === "anexar") && (
              <div
                ref={evidenciasRef}
                className={[
                  "rounded-2xl border p-5 space-y-4 transition",
                  "bg-surfaceLight/15",
                  fotosSelecionadas.length > 0 && fotosSelecionadas.length < 2
                    ? "border-amber-500/40"
                    : "border-borderSubtle",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">Evidências (2 a 5 fotos)</h2>
                  <span className="text-xs text-textmuted">
                    {fotosSelecionadas.length}/5 selecionada(s)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    ref={fotosPickRef}
                    className={[
                      "inline-flex items-center justify-center gap-2",
                      "px-4 py-2 rounded-lg border",
                      "border-borderSubtle bg-overlay text-textmain",
                      "hover:bg-overlayHover transition cursor-pointer",
                      "text-sm font-medium",
                    ].join(" ")}
                  >
                    Selecionar fotos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onPickFotos}
                      className="hidden"
                    />
                  </label>

                  <div className="text-xs text-textmuted">
                    {(() => {
                      const n = fotosSelecionadas.length;
                      if (n === 0) return "Selecione de 2 a 5 fotos para continuar.";
                      if (n === 1) return "Você selecionou 1 foto. Falta 1 para atingir o mínimo (2).";
                      return `Perfeito: ${n} foto(s) selecionada(s).`;
                    })()}
                  </div>
                </div>

                {fotosSelecionadas.length ? (
                  <EvidenceGrid
                    fotos={fotosPreviewUrls}
                    renderFooter={(idx) => (
                      <button
                        type="button"
                        onClick={() => removeFotoAt(idx)}
                        className="w-full text-xs py-2 text-textmain bg-overlay hover:bg-overlayHover transition"
                      >
                        Remover
                      </button>
                    )}
                  />
                ) : (
                  <p className="text-sm text-textmuted">
                    Selecione entre 2 e 5 fotos. (MVP: ainda utiliza galeria; no futuro, será exigido câmera in loco.)
                  </p>
                )}
              </div>
            )}

            <div
              ref={descricaoRef}
              className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-3"
            >
              <h2 className="text-lg font-semibold">
                {acaoEscolhida === "reforcar"
                  ? "Confirmação rápida"
                  : acaoEscolhida === "anexar"
                  ? "Por que estas novas fotos ajudam?"
                  : "Descrição do problema"}
              </h2>

              <textarea
                ref={descricaoInputRef}
                value={
                  acaoEscolhida === "reforcar"
                    ? descricaoReforco
                    : acaoEscolhida === "anexar"
                    ? descricaoAnexo
                    : descricaoNovo
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (acaoEscolhida === "reforcar") setDescricaoReforco(v);
                  else if (acaoEscolhida === "anexar") setDescricaoAnexo(v);
                  else setDescricaoNovo(v);
                }}
                rows={acaoEscolhida === "reforcar" ? 2 : acaoEscolhida === "anexar" ? 3 : 4}
                placeholder={
                  acaoEscolhida === "reforcar"
                    ? "Ex.: Confirmo que o poste segue apagado e o trecho continua perigoso."
                    : acaoEscolhida === "anexar"
                    ? "Ex.: A situação piorou desde o último registro / novas fotos mostram o problema à noite."
                    : "Ex.: Buraco grande na via, perto do cruzamento com a Rua X, causando risco a pedestres e veículos."
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

                {acaoEscolhida === "anexar" && (
                  <PulseButton
                    onClick={confirmarAnexo}
                    disabled={!podeAnexar || isProcessing}
                    intense={!isProcessing && podeAnexar}
                    title={
                      !podeAnexar
                        ? motivoBloqueioAnexar ?? "Complete os campos para continuar."
                        : undefined
                    }
                    className="inline-flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border border-current border-t-transparent animate-spin" />
                        Processando fotos...
                      </>
                    ) : (
                      "Enviar novas fotos"
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

              {acaoEscolhida === "anexar" && demandaAlvoId ? (
                <p className="text-[11px] text-textmuted">
                  Você está anexando evidências para{" "}
                  <span className="text-textmain">{demandaAlvoId}</span>.
                </p>
              ) : null}
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
