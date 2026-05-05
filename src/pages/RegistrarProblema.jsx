// src/pages/RegistrarProblema.jsx

// Libs externas
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Context/tema
import { ThemeContext } from "../context/ThemeContext";
import { useAppearance } from "../context/AppearanceContext.jsx";
import { CITY_THEMES } from "../theme/cities";

// Constants
import { LIMITE_DISTANCIA_FOTOS_METROS } from "../constants/registroProblema";

// Services
import { criarDemanda, reforcarDemanda } from "../services/demandasActions";

// Storage
import {
  adicionarEventoHistorico,
  getDemandas,
  setDemandas,
} from "../storage/demandasStorage";

// Hooks
import { useFotoPreviews } from "../hooks/useFotoPreviews";

// Components
import AlertOverlay from "../components/AlertOverlay";
import AvisoResponsabilidade from "../components/AvisoResponsabilidade";
import BackButton from "../components/BackButton";
import BotoesAcaoRegistro from "../components/BotoesAcaoRegistro";
import EvidenciasPicker from "../components/EvidenciasPicker";
import ModalFotos from "../components/ModalFotos";
import ProcessingOverlay from "../components/ProcessingOverlay";
import SugestoesDemandas from "../components/SugestoesDemandas";
import CameraCaptureModal from "../components/CameraCaptureModal";
import FormNovoRegistro from "../components/FormNovoRegistro";
import FormAtualizacaoDemanda from "../components/FormAtualizacaoDemanda";

// Utils
import { handlePickFotos } from "../utils/handlePickFotos";
import { distanciaMetros } from "../utils/exifGps";
import { normalizeCityKey } from "../utils/normalizeCity";
import { scrollTo } from "../utils/scrollTo";
import { computeDupScore } from "../utils/triagem";
import { reverseGeocodeCity } from "../utils/reverseGeocode";
import { fileToDataUrl } from "../utils/fileToDataUrl";
import { dataUrlToFile } from "../utils/dataUrlToFile";

const PRE_LOGIN_DRAFT_KEY = "falaCidadao.preLoginDraft";

export default function RegistrarProblema() {
  const navigate = useNavigate();

  const { city } = useContext(ThemeContext);
  const { appearance } = useAppearance();
  const isLight = appearance === "light";
  const actionPanelClass = isLight
  ? "rounded-2xl border border-slate-300/80 bg-white/80 p-4 space-y-3 shadow-sm shadow-slate-900/5"
  : "rounded-2xl border border-white/15 bg-surfaceLight/30 p-4 space-y-3 shadow-sm shadow-black/20";

  const cityTheme = CITY_THEMES[city] ?? CITY_THEMES.default;

  const descricaoRef = useRef(null);
  const descricaoInputRef = useRef(null);
  const evidenciasRef = useRef(null);
  const avisoRef = useRef(null);
  const fotosPickRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const cameraAutoOpenedRef = useRef(false);

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
    return normalizeCityKey(enderecoDetectado?.cidade || "");
  }, [enderecoDetectado?.cidade]);;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFotos, setModalFotos] = useState([]);
  const [modalIdx, setModalIdx] = useState(0);
  const [modalTitle, setModalTitle] = useState("");

  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  useEffect(() => {
    const usuarioLogado = Boolean(localStorage.getItem("falaCidadao.auth"));
    const temRascunhoPreLogin = Boolean(
      sessionStorage.getItem(PRE_LOGIN_DRAFT_KEY)
    );

    if (!usuarioLogado) return;
    if (temRascunhoPreLogin) return;
    if (cameraAutoOpenedRef.current) return;
    if (cameraModalOpen) return;
    if (fotosSelecionadas.length > 0) return;
    if (acaoEscolhida && acaoEscolhida !== "novo") return;

    cameraAutoOpenedRef.current = true;
    setCameraModalOpen(true);
  }, [cameraModalOpen, fotosSelecionadas.length, acaoEscolhida]);

  useEffect(() => {
    const usuarioLogado = Boolean(localStorage.getItem("falaCidadao.auth"));
    if (!usuarioLogado) return;
    if (fotosSelecionadas.length > 0) return;

    const rawDraft = sessionStorage.getItem(PRE_LOGIN_DRAFT_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft);
      const lat = Number(draft?.meta?.lat);
      const lng = Number(draft?.meta?.lng);

      if (
        draft?.origem !== "captura_pre_login" ||
        !draft?.foto?.dataUrl ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        sessionStorage.removeItem(PRE_LOGIN_DRAFT_KEY);
        return;
      }
      const file = dataUrlToFile(
        draft.foto.dataUrl,
        draft.foto.name || "captura-pre-login.jpg",
        draft.foto.type || "image/jpeg",
        draft.foto.lastModified || Date.now()
      );

      const meta = {
        key:
          draft.meta.key ||
          `${draft.foto.name || "captura-pre-login.jpg"}__${
            draft.foto.size || 0
          }__${draft.foto.lastModified || Date.now()}`,
        name: draft.meta.name || draft.foto.name || "captura-pre-login.jpg",
        size: draft.meta.size || draft.foto.size || file.size,
        lastModified:
          draft.meta.lastModified || draft.foto.lastModified || file.lastModified,
        lat,
        lng,
        takenAt: draft.meta.takenAt || draft.createdAt || new Date().toISOString(),
        source: draft.meta.source || "browser_capture",
        accuracy: draft.meta.accuracy ?? null,
      };

      setFotosSelecionadas([file]);
      setFotosMeta([meta]);

      setLocalRelato({
        lat,
        lng,
        source: meta.source,
      });

      if (draft.enderecoDetectado) {
        setEnderecoDetectado(draft.enderecoDetectado);
      } else {
        reverseGeocodeCity(lat, lng)
          .then((geo) => {
            setEnderecoDetectado({
              cidade: geo?.cidade || "",
              estado: geo?.estado || "",
              bairro: geo?.bairro || "",
              rua: geo?.rua || "",
            });
          })
          .catch(() => {
            setEnderecoDetectado(null);
          });
      }      
      setAcaoEscolhida("novo");
      setDemandaAlvoId(null);

      cameraAutoOpenedRef.current = true;

      showToast(
        "success",
        "Foto recuperada. Complete as informações para enviar o registro."
      );
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem(PRE_LOGIN_DRAFT_KEY);
      showToast(
        "error",
        "Não foi possível recuperar a foto capturada antes do login."
      );
    }
  }, [fotosSelecionadas.length]);

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

    // só decide automaticamente depois que a cidade do relato estiver resolvida
    if (!cidadeRelatoKey) return;

    if (sugestoesVisiveis.length === 0) {
      setAcaoEscolhida("novo");
      setDemandaAlvoId(null);
    }
  }, [
    triagemAtiva,
    acaoEscolhida,
    fotosSelecionadas.length,
    cidadeRelatoKey,
    sugestoesVisiveis.length,
  ]);

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

    if (tipo === "atualizar") {
      if (!descricaoNovo.trim()) {
        showToast("error", "Descreva a atualização para continuar.");
        scrollTo(descricaoRef, descricaoInputRef);
        return false;
      }

      if (fotosSelecionadas.length < 1 || fotosSelecionadas.length > 3) {
        showToast("error", "Envie entre 1 e 3 fotos para atualizar esta demanda.");
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

  function escolherAtualizar(demandaId) {
    setAcaoEscolhida("atualizar");
    setDemandaAlvoId(demandaId);
  }

  function escolherNovo() {
    setAcaoEscolhida("novo");
    setDemandaAlvoId(null);
  }

  function cancelarAposSugestao() {
    resetTotal();
    showToast("info", "Registro cancelado.");
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

  async function confirmarAtualizacao() {
    if (!demandaAlvoId) return;
    if (!validarAntesDeEnviar("atualizar")) return;
    if (!validarIntegridadeGps()) return;

    setIsProcessing(true);
    setProgress({ done: 0, total: fotosSelecionadas.length, fileName: "" });

    try {
      showToast("info", "Registrando atualização...");

      const now = new Date();
      const nowIso = now.toISOString();
      const today = nowIso.slice(0, 10);

      const fotosBase64 = await Promise.all(
        fotosSelecionadas.map(async (file) => {
          if (typeof file === "string") return file;
          return await fileToDataUrl(file);
        })
      );

      const atualizacao = {
        id: `ATU-${Date.now()}`,
        createdAt: nowIso,
        autorId: localStorage.getItem("falaCidadao.auth")
          ? JSON.parse(localStorage.getItem("falaCidadao.auth"))?.email || "anonimo"
          : "anonimo",
        autorNome: localStorage.getItem("falaCidadao.auth")
          ? JSON.parse(localStorage.getItem("falaCidadao.auth"))?.nome || "Cidadão"
          : "Cidadão",
        autorEmail: localStorage.getItem("falaCidadao.auth")
          ? JSON.parse(localStorage.getItem("falaCidadao.auth"))?.email || ""
          : "",
        descricao: descricaoNovo.trim(),
        pontoReferencia: pontoReferencia.trim(),
        aceiteResponsabilidade: Boolean(aceiteResponsabilidade),
        fotos: fotosBase64,
        fotosMeta: fotosMeta.map((meta) => ({
          ...meta,
          takenAt:
            meta?.takenAt instanceof Date
              ? meta.takenAt.toISOString()
              : meta?.takenAt || null,
        })),
        enderecoDetectado,
        localRelato,
        status: "registrada",
        origem: "atualizacao_via_triagem",
      };

      const nextDemandas = getDemandas().map((item) => {
        if (item.id !== demandaAlvoId) return item;

        const atualizacoesAtuais = Array.isArray(item.atualizacoes)
          ? item.atualizacoes
          : [];

        const nextAtualizacoes = [...atualizacoesAtuais, atualizacao];

        return {
          ...item,
          atualizacoes: nextAtualizacoes,
          totalAtualizacoes: nextAtualizacoes.length,
          ultimaAtualizacaoEm: nowIso,
          ultimaMovimentacaoEm: nowIso,
          historico: adicionarEventoHistorico(item.historico, {
            data: today,
            tipo: "cidadao",
            evento: "Atualização cidadã registrada.",
          }),
        };
      });

      setDemandas(nextDemandas);

      showToast("success", "Atualização registrada com sucesso.");

      window.setTimeout(() => {
        navigate(`/painel/${demandaAlvoId}`);
      }, 1800);
    } catch (error) {
      console.error(error);
      showToast("error", "Não foi possível registrar a atualização.");
    } finally {
      setIsProcessing(false);
      setProgress({ done: 0, total: 0, fileName: "" });
    }
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

  function toastClass(type, appearance = "dark") {
    const isLightMode = appearance === "light";

    if (isLightMode) {
      switch (type) {
        case "success":
          return "border-emerald-400 bg-emerald-100 text-emerald-800";
        case "error":
          return "border-rose-400 bg-rose-100 text-rose-800";
        default:
          return "border-sky-400 bg-sky-100 text-sky-800";
      }
    }

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

      sessionStorage.removeItem(PRE_LOGIN_DRAFT_KEY);

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
    sessionStorage.removeItem(PRE_LOGIN_DRAFT_KEY);
    
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
    setCameraModalOpen(false);
  }

  const evidenciasValidas =
    fotosSelecionadas.length >= 1 && fotosSelecionadas.length <= 3;

  const aceiteValido = aceiteResponsabilidade;

  const podeReforcar = !!demandaAlvoId && aceiteValido;

  const podeAdicionarAtualizacao =
    !!demandaAlvoId &&
    evidenciasValidas &&
    aceiteValido &&
    descricaoNovo.trim().length > 0;  

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
    acaoEscolhida === null;

  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
        {toast && (
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-[420px]">
            <div
              className={`rounded-xl border backdrop-blur px-4 py-3 text-sm shadow-lg text-center ${toastClass(
                toast.type,
                appearance
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

        {(acaoEscolhida === null ||
          acaoEscolhida === "novo" ||
          acaoEscolhida === "atualizar") && (
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
            onAdicionarAtualizacao={(id) => escolherAtualizar(id)}
            onRegistrarNovo={(id) => {
              ignorarSugestao(id);
              escolherNovo();
            }}
            onCancelar={cancelarAposSugestao}
          />
        )}

        {triagemAtiva && acaoEscolhida && (
          <>
            {acaoEscolhida === "atualizar" && (
              <FormAtualizacaoDemanda
                descricaoRef={descricaoRef}
                descricaoInputRef={descricaoInputRef}
                descricaoNovo={descricaoNovo}
                setDescricaoNovo={setDescricaoNovo}
                pontoReferencia={pontoReferencia}
                setPontoReferencia={setPontoReferencia}
              />
            )}
            {acaoEscolhida === "novo" && (
              <FormNovoRegistro
                descricaoRef={descricaoRef}
                descricaoInputRef={descricaoInputRef}
                categoria={categoria}
                setCategoria={setCategoria}
                tempoPercebido={tempoPercebido}
                setTempoPercebido={setTempoPercebido}
                descricaoNovo={descricaoNovo}
                setDescricaoNovo={setDescricaoNovo}
                pontoReferencia={pontoReferencia}
                setPontoReferencia={setPontoReferencia}
              />
            )}

            <div
              ref={avisoRef}
              className={actionPanelClass}
            >
              <AvisoResponsabilidade
                checked={aceiteResponsabilidade}
                onChange={setAceiteResponsabilidade}
                contexto={acaoEscolhida === "atualizar" ? "atualizacao" : "demanda"}
              />
              <BotoesAcaoRegistro
                acaoEscolhida={acaoEscolhida}
                confirmarReforco={confirmarReforco}
                confirmarAtualizacao={confirmarAtualizacao}
                confirmarNovo={confirmarNovo}
                resetTotal={resetTotal}
                podeReforcar={podeReforcar}
                podeAdicionarAtualizacao={podeAdicionarAtualizacao}
                podeRegistrarNovo={podeRegistrarNovo}
                isProcessing={isProcessing}
              />
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
