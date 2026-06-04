// src/pages/DetalheDemanda.jsx

import { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CityContext } from "../context/CityContext";
import { useAppearance } from "../context/AppearanceContext.jsx";
import { adicionarEventoHistorico, getDemandas } from "../storage/demandasStorage";
import { normalizarDemandas, reforcarDemanda } from "../services/demandasActions";
import EvidenceGrid from "../components/EvidenceGrid";
import BackButton from "../components/BackButton";
import AlertOverlay from "../components/AlertOverlay";
import AtualizacoesProblemaCard from "../components/AtualizacoesProblemaCard";

function formatDateBR(iso) {
  if (!iso || typeof iso !== "string") return "—";
  // Espera "YYYY-MM-DD"
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function statusBadgeClass(status, appearance = "dark") {
  const isLight = appearance === "light";

  if (isLight) {
    switch (status) {
      case "Em análise":
        return "bg-amber-100 text-amber-800 border border-amber-400";
      case "Encaminhada":
        return "bg-sky-100 text-sky-800 border border-sky-400";
      case "Resolvida":
        return "bg-emerald-100 text-emerald-800 border border-emerald-400";
      case "Encerrada":
        return "bg-violet-100 text-violet-800 border border-violet-400";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-400";
    }
  }

  switch (status) {
    case "Em análise":
      return "bg-amber-500/10 text-amber-300 border border-amber-500/40";
    case "Encaminhada":
      return "bg-sky-500/10 text-sky-300 border border-sky-500/40";
    case "Resolvida":
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
    case "Encerrada":
      return "bg-violet-500/10 text-violet-300 border border-violet-500/40";
    default:
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
  }
}

function normalizarStatusOperacional(status) {
  switch (status) {
    case "Em análise":
    case "Encaminhada":
    case "Resolvida":
    case "Encerrada":
      return status;

    // Compatibilidade com registros antigos/mockados
    case "Resposta contestada":
      return "Encaminhada";

    default:
      return status || "Em análise";
  }
}

function obterAcompanhamentoDemanda({ statusOperacional, respostasResponsavel }) {
  const respostas = Array.isArray(respostasResponsavel)
    ? respostasResponsavel
    : [];

  const total = respostas.length;
  const primeiraResposta = respostas[0] || null;
  const segundaResposta = respostas[1] || null;

  if (statusOperacional === "Encerrada") {
    return "Ciclo encerrado";
  }

  if (statusOperacional === "Resolvida") {
    return "Solução aceita";
  }

  if (total === 0) {
    return "Aguardando resposta";
  }

  if (segundaResposta) {
    if (segundaResposta.statusCidadao === "aceita") {
      return "Solução aceita";
    }

    if (segundaResposta.statusCidadao === "contestada") {
      return "Ciclo encerrado";
    }

    return "Nova resposta recebida";
  }

  if (primeiraResposta?.statusCidadao === "aceita") {
    return "Solução aceita";
  }

  if (primeiraResposta?.statusCidadao === "contestada") {
    return "Aguardando resposta";
  }

  return "Resposta recebida";
}

function acompanhamentoBadgeClass(acompanhamento, appearance = "dark") {
  const isLight = appearance === "light";

  if (isLight) {
    switch (acompanhamento) {
      case "Aguardando resposta":
        return "bg-slate-100 text-slate-700 border border-slate-300";
      case "Resposta recebida":
        return "bg-indigo-100 text-indigo-800 border border-indigo-300";
      case "Nova resposta recebida":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "Solução aceita":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "Ciclo encerrado":
        return "bg-violet-100 text-violet-800 border border-violet-300";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-300";
    }
  }

  switch (acompanhamento) {
    case "Aguardando resposta":
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
    case "Resposta recebida":
      return "bg-indigo-500/10 text-indigo-200 border border-indigo-500/40";
    case "Nova resposta recebida":
      return "bg-orange-500/10 text-orange-200 border border-orange-500/40";
    case "Solução aceita":
      return "bg-emerald-500/10 text-emerald-200 border border-emerald-500/40";
    case "Ciclo encerrado":
      return "bg-violet-500/10 text-violet-200 border border-violet-500/40";
    default:
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
  }
}

function tipoBadge(tipo, appearance = "dark") {
  const isLight = appearance === "light";

  if (isLight) {
    switch (String(tipo || "").toLowerCase()) {
      case "sistema":
        return "bg-slate-100 text-slate-700 border border-slate-300";
      case "cidadao":
        return "bg-cyan-100 text-cyan-800 border border-cyan-300";
      case "responsavel":
      case "orgao":
        return "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-300";
    }
  }

  switch (String(tipo || "").toLowerCase()) {
    case "sistema":
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
    case "cidadao":
      return "bg-cyan-500/10 text-cyan-200 border border-cyan-500/40";
    case "responsavel":
    case "orgao":
      return "bg-fuchsia-500/10 text-fuchsia-200 border border-fuchsia-500/30";
    default:
      return "bg-slate-500/10 text-slate-200 border border-slate-500/30";
  }
}

function respostaStatusBadgeClass(status, appearance = "dark") {
  const isLight = appearance === "light";

  if (isLight) {
    switch (status) {
      case "contestada":
        return "border border-amber-400 bg-amber-100 text-amber-800";
      case "aceita":
        return "border border-emerald-400 bg-emerald-100 text-emerald-800";
      default:
        return "border border-slate-300 bg-slate-100 text-slate-700";
    }
  }

  switch (status) {
    case "contestada":
      return "border border-amber-500/40 bg-amber-500/10 text-amber-200";
    case "aceita":
      return "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
    default:
      return "border border-slate-500/30 bg-slate-500/10 text-slate-200";
  }
}

function tipoLabel(tipo) {
  switch (String(tipo || "").toLowerCase()) {
    case "sistema":
      return "Sistema";
    case "cidadao":
      return "Cidadão";
    case "responsavel":
    case "orgao":
      return "Responsável";
    default:
      return "Sistema";
  }
}

function ModalFoto({ open, fotos, fotosMeta, index, onClose, onPrev, onNext }) {
  if (!open) return null;

  const hasFotos = Array.isArray(fotos) && fotos.length > 0;
  const src = hasFotos ? fotos[index] : null;
  const takenAt = fotosMeta?.[index]?.takenAt ?? null;

  function formatarTakenAt(takenAt) {
    if (!takenAt) return null;

    let date = null;

    if (takenAt instanceof Date) {
      date = takenAt;
    } else if (typeof takenAt === "number") {
      date = new Date(takenAt);
    } else if (typeof takenAt === "string") {
      let tentativa = new Date(takenAt);

      if (Number.isNaN(tentativa.getTime())) {
        const exifMatch = takenAt.match(
          /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/
        );

        if (exifMatch) {
          const [, ano, mes, dia, hora, minuto, segundo = "00"] = exifMatch;
          tentativa = new Date(
            Number(ano),
            Number(mes) - 1,
            Number(dia),
            Number(hora),
            Number(minuto),
            Number(segundo)
          );
        }
      }

      if (!Number.isNaN(tentativa.getTime())) {
        date = tentativa;
      }
    }

    if (!date || Number.isNaN(date.getTime())) return null;

    const data = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    const hora = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    return `${data} • ${hora}`;
  }

  const takenAtFormatado = formatarTakenAt(takenAt);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização de foto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl rounded-2xl border border-borderSubtle bg-surface/90 backdrop-blur p-3 md:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-xs text-textsoft">
            Evidência {hasFotos ? index + 1 : 0} de{" "}
            {hasFotos ? fotos.length : 0}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-xs text-textmain bg-overlay hover:bg-overlayHover transition"
          >
            Fechar
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-borderSubtle bg-overlay flex items-center justify-center min-h-[240px]">
          {takenAtFormatado && (
            <div className="absolute inset-x-0 top-0 z-10 px-3 py-2 bg-black/65 backdrop-blur-[1px]">
              <p className="text-xs text-white font-medium text-center">
                {takenAtFormatado}
              </p>
            </div>
          )}

          {src ? (
            <img
              src={src}
              alt={`Evidência ${index + 1}`}
              className="w-full h-full object-contain"
              loading="eager"
            />
          ) : (
            <div className="text-sm text-textmuted p-6">
              Nenhuma evidência fotográfica disponível.
            </div>
          )}
        </div>

        {hasFotos && fotos.length > 1 && (
          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              type="button"
              onClick={onPrev}
              className="px-3 py-2 rounded-lg border border-borderSubtle text-xs text-textmain bg-overlay hover:bg-overlayHover transition"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-3 py-2 rounded-lg border border-borderSubtle text-xs text-textmain bg-overlay hover:bg-overlayHover transition"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const AUTH_KEY = "falaCidadao.auth";

function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      id: parsed.id || parsed.userId || parsed.email || null,
      nome: parsed.nome || parsed.name || parsed.displayName || null,
      email: parsed.email || null,
    };
  } catch {
    return null;
  }
}

const TEMPO_PERCEBIDO_LABELS = {
  hoje: "Hoje",
  alguns_dias: "Há alguns dias",
  uma_semana: "Há cerca de 1 semana",
  quinze_dias: "Há cerca de 15 dias",
  um_mes: "Há cerca de 1 mês",
  mais_de_um_mes: "Há mais de 1 mês",
};

const DEMANDAS_STORAGE_KEY = "falaCidadao:demandas";

function persistirDemandas(nextDemandas) {
  localStorage.setItem(DEMANDAS_STORAGE_KEY, JSON.stringify(nextDemandas));
  window.dispatchEvent(new Event("falaCidadao:demandas_updated"));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function DetalheDemanda() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const { appearance } = useAppearance();
  const isLight = appearance === "light";  

  // Mantemos CityContext apenas para manter consistência global (se necessário).
  // Porém, a tela prioriza SEMPRE a cidade da demanda.
  useContext(CityContext);

  const [demandasBase, setDemandasBase] = useState([]);
  const [alertOverlay, setAlertOverlay] = useState(null);
  const [confirmacaoReforcoAberta, setConfirmacaoReforcoAberta] = useState(false);
  const [toastReforco, setToastReforco] = useState(null);
  const [abrirAtualizacaoAutomaticamente, setAbrirAtualizacaoAutomaticamente] = useState(false);
  const [fluxoAtualizacaoAtivo, setFluxoAtualizacaoAtivo] = useState(false);
  const [contestandoRespostaIdx, setContestandoRespostaIdx] = useState(null);
  const [textoContestacao, setTextoContestacao] = useState("");  
  const authUser = getAuthUser();
  const currentUserId = authUser?.id || null;
  const isAutenticado = !!currentUserId;
  const params = new URLSearchParams(location.search);
  const abaPainel = params.get("aba");
  const ordemPainel = params.get("ordem");

  const abaValida = ["minhas", "cidade", "todas"].includes(abaPainel);
  const ordemValida = ["recentes", "proximas"].includes(ordemPainel);

  const painelParams = new URLSearchParams();

  if (abaValida) {
    painelParams.set("aba", abaPainel);
  }

  if (ordemValida) {
    painelParams.set("ordem", ordemPainel);
  }

  const painelBackTo = painelParams.toString()
    ? `/painel?${painelParams.toString()}`
    : "/painel";

  const sectionCardClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-5 space-y-4 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/30 p-5 space-y-4 shadow-sm shadow-black/20";

  const sectionCardCompactClass = isLight
    ? "rounded-2xl border border-slate-300/80 bg-white/80 p-5 space-y-3 shadow-sm shadow-slate-900/5"
    : "rounded-2xl border border-white/10 bg-surfaceLight/30 p-5 space-y-3 shadow-sm shadow-black/20";

  const innerCardClass = isLight
    ? "rounded-xl border border-slate-300 bg-white/90 p-4 space-y-2 shadow-sm shadow-slate-900/5"
    : "rounded-xl border border-white/10 bg-white/5 p-4 space-y-2";

  const timelineItemClass = isLight
    ? "rounded-xl border border-slate-300 bg-white/90 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-sm shadow-slate-900/5"
    : "rounded-xl border border-white/10 bg-white/5 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2";

  const responseItemClass = isLight
    ? "rounded-xl border border-slate-300 bg-white/90 p-3 space-y-2 shadow-sm shadow-slate-900/5"
    : "rounded-xl border border-white/10 bg-white/5 p-3 space-y-2";

  const smallBadgeClass = isLight
    ? "px-2 py-1 rounded-full border border-slate-300 bg-white text-slate-800"
    : "px-2 py-1 rounded-full border border-white/10 bg-white/5 text-textmain";

  const subtlePillClass = isLight
    ? "px-2 py-0.5 rounded-full border border-slate-300 bg-white text-slate-700"
    : "px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-textmain";

  const subtleButtonClass = isLight
    ? "px-4 py-2 rounded-xl border border-slate-300 bg-white/80 text-sm text-textmain hover:bg-white hover:border-primary/30 transition"
    : "px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-textmain hover:bg-white/10 hover:border-primary/30 transition";

  const miniButtonClass = isLight
    ? "px-3 py-1.5 rounded-lg border border-slate-300 bg-white/80 text-xs text-textmain hover:bg-white hover:border-primary/30 transition"
    : "px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-textmain hover:bg-white/10 hover:border-primary/30 transition";

  const nestedSoftBoxClass = isLight
    ? "rounded-xl border border-slate-300 bg-slate-50/90 p-3"
    : "rounded-xl border border-white/10 bg-white/5 p-3";  

  const acceptButtonClass = isLight
    ? "min-w-[88px] px-3 py-1.5 rounded-lg border border-emerald-400 bg-emerald-100 text-emerald-800 text-xs hover:bg-emerald-200 transition"
    : "min-w-[88px] px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs hover:bg-emerald-500/20 transition";

  const contestButtonClass = isLight
    ? "min-w-[88px] px-3 py-1.5 rounded-lg border border-amber-400 bg-amber-100 text-amber-800 text-xs hover:bg-amber-200 transition"
    : "min-w-[88px] px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs hover:bg-amber-500/20 transition";    

  useEffect(() => {
    const load = () => setDemandasBase(normalizarDemandas(getDemandas()));
    load();

    window.addEventListener("falaCidadao:demandas_updated", load);
    return () =>
      window.removeEventListener("falaCidadao:demandas_updated", load);
  }, []);

  const demanda = useMemo(
    () => demandasBase.find((d) => d.id === id),
    [demandasBase, id]
  );

  const donoDaDemanda = demanda?.autorId || demanda?.userId || null;

  const isAutorOriginal =
    !!demanda && isAutenticado && donoDaDemanda === currentUserId;

  const reforcos = Array.isArray(demanda?.reforcos) ? demanda.reforcos : [];

  const jaReforcou =
    !!demanda &&
    isAutenticado &&
    reforcos.some((item) => item?.autorId === currentUserId);

  const statusOperacional = normalizarStatusOperacional(demanda?.status);

  const statusDemanda = statusOperacional;

  const respostasResponsavel = Array.isArray(demanda?.respostaResponsavel)
    ? demanda.respostaResponsavel
    : Array.isArray(demanda?.respostaOrgao)
    ? demanda.respostaOrgao
    : [];

  const acompanhamentoDemanda = obterAcompanhamentoDemanda({
    statusOperacional,
    respostasResponsavel,
  });

  const demandaBloqueadaParaMovimentacao =
    statusDemanda === "Resolvida" || statusDemanda === "Encerrada";

  const demandaComRespostaContestada = respostasResponsavel.some(
    (resposta) => resposta?.statusCidadao === "contestada"
  );

  const mensagemBloqueioMovimentacao =
    statusDemanda === "Resolvida"
      ? "Esta demanda foi marcada como resolvida e não aceita novos reforços ou atualizações."
      : statusDemanda === "Encerrada"
      ? "Esta demanda foi encerrada e não aceita novas movimentações cidadãs."
      : "";    

  const podeReforcar =
    !!demanda &&
    isAutenticado &&
    !isAutorOriginal &&
    !jaReforcou &&
    !demandaBloqueadaParaMovimentacao;

  const podeAtualizarProblema =
    !!demanda &&
    isAutenticado &&
    !demandaBloqueadaParaMovimentacao;

  const atualizacoes = Array.isArray(demanda?.atualizacoes)
  ? demanda.atualizacoes
  : [];

  const jaAtualizou =
    !!demanda &&
    isAutenticado &&
    atualizacoes.some(
      (item) =>
        item?.autorId === currentUserId ||
        item?.autorEmail === authUser?.email ||
        item?.autorId === authUser?.email
    );

  useEffect(() => {
  if (!demanda) return;
  if (!isAutenticado) return;
  if (!podeReforcar) return;

  const params = new URLSearchParams(location.search);

  if (params.get("acao") !== "reforcar") return;

  setConfirmacaoReforcoAberta(true);

  params.delete("acao");

  navigate(
    {
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : "",
    },
    { replace: true }
  );
}, [demanda, isAutenticado, podeReforcar, location.pathname, location.search, navigate]);  

useEffect(() => {
  if (!demanda) return;
  if (!isAutenticado) return;
  if (!podeAtualizarProblema) return;

  const params = new URLSearchParams(location.search);

  if (params.get("acao") !== "atualizar") return;

  setAbrirAtualizacaoAutomaticamente(true);

  params.delete("acao");

  navigate(
    {
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : "",
    },
    { replace: true }
  );
}, [
  demanda,
  isAutenticado,
  podeAtualizarProblema,
  location.pathname,
  location.search,
  navigate,
]);

  // Mobilização cidadã
  const totalReforcos =
    typeof demanda?.totalReforcos === "number"
      ? demanda.totalReforcos
      : reforcos.length;

  const ultimoReforco = formatDateBR(
    demanda?.ultimoReforcoEm?.slice?.(0, 10) || demanda?.ultimoReforcoEm
  );

  const resumoMobilizacao = demandaBloqueadaParaMovimentacao
    ? statusDemanda === "Resolvida"
      ? "Demanda resolvida."
      : "Demanda encerrada."
    : jaReforcou
    ? "Você já reforçou esta demanda."
    : totalReforcos === 0
    ? "Esta demanda ainda não recebeu reforços de outros cidadãos."
    : totalReforcos === 1
    ? "1 cidadão já reforçou esta demanda."
    : `${totalReforcos} cidadãos já reforçaram esta demanda.`;
  
  // Modal de foto
  const [modalOpen, setModalOpen] = useState(false);
  const [fotoIndex, setFotoIndex] = useState(0);
  const [modalFotos, setModalFotos] = useState([]);
  const [modalFotosMeta, setModalFotosMeta] = useState([]);

  if (!demanda) {
    return (
      <section className="flex-1 w-full">
        <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold">
            Demanda não encontrada
          </h1>
          <p className="text-textsoft">
            Não localizamos a demanda{" "}
            <span className="text-textmain">{id}</span>.
          </p>
          <BackButton to={painelBackTo} />
        </div>
      </section>
    );
  }

  const podeAnexar = demanda.userId === currentUserId;
  const ruaExibida =
    demanda.enderecoDetectado?.rua || demanda.rua || "";

  const bairroExibido =
    demanda.enderecoDetectado?.bairro || demanda.bairro || "";

  const cidadeExibida =
    demanda.enderecoDetectado?.cidade ||
    demanda.cidadeRelatoLabel ||
    demanda.cidadeRelato ||
    demanda.cidade ||
    "";

  const estadoExibido =
    demanda.enderecoDetectado?.estado || demanda.estadoRelato || "";

  const cidadeEstadoExibido =
    [cidadeExibida, estadoExibido].filter(Boolean).join("/") || "—";

  const localResumoExibido =
    [ruaExibida, bairroExibido, cidadeEstadoExibido].filter(Boolean).join(" · ") || "—";

  const tempoPercebidoExibido =
  TEMPO_PERCEBIDO_LABELS[demanda.tempoPercebido] || "";
  
  const responsavelAtual = demanda.orgao?.nome
    ? [
        demanda.orgao.sigla || demanda.orgao.nome,
        demanda.orgao.cidade || cidadeEstadoExibido,
      ]
        .filter(Boolean)
        .join(" — ")
    : "Ainda em triagem";

  const dataEncaminhamento = Array.isArray(demanda.historico)
    ? demanda.historico.find((item) =>
        String(item?.evento || "")
          .toLowerCase()
          .includes("encaminhada")
      )?.data
    : null;

  function formatarEventoHistorico(eventoOriginal) {
    const evento = String(eventoOriginal || "");

    if (evento === "Demanda encaminhada ao responsável pelo atendimento.") {
      return `Demanda encaminhada para ${responsavelAtual}.`;
    }

    if (evento === "Primeira resposta do responsável registrada.") {
      return `Primeira resposta de ${responsavelAtual} registrada.`;
    }

    if (evento === "Segunda resposta do responsável registrada.") {
      return `Segunda resposta de ${responsavelAtual} registrada.`;
    }

    if (evento === "Resposta do responsável contestada pelo cidadão.") {
      return `Resposta de ${responsavelAtual} contestada pelo cidadão.`;
    }

    if (evento === "Resposta do responsável aceita pelo cidadão.") {
      return `Resposta de ${responsavelAtual} aceita pelo cidadão.`;
    }

    return evento;
  }  

  const totalRespostasResponsavel = respostasResponsavel.length;

  const primeiraRespostaContestada =
    respostasResponsavel[0]?.statusCidadao === "contestada";

  const segundaResposta = respostasResponsavel[1] || null;

  const segundaRespostaAvaliada =
    segundaResposta?.statusCidadao === "aceita" ||
    segundaResposta?.statusCidadao === "contestada";

  const podeSimularSegundaResposta =
    primeiraRespostaContestada && totalRespostasResponsavel === 1;

  const limiteRespostasAtingido = totalRespostasResponsavel >= 2;

  const cicloRespostasEncerrado =
    limiteRespostasAtingido && segundaRespostaAvaliada;    

  const podeAvaliarResposta = isAutenticado && isAutorOriginal;

  const mensagemBloqueioAvaliacao = !isAutenticado
    ? "Faça login para aceitar ou contestar esta resposta."
    : !isAutorOriginal
    ? "Apenas o autor da demanda pode avaliar esta resposta."
    : "";

  const fotos = Array.isArray(demanda.fotos) ? demanda.fotos : [];

  const fotosPublicas = fotos.filter(
    (src) => typeof src === "string" && !src.startsWith("local:")
  );

  const anexosPendentes = fotos.filter(
    (src) => typeof src === "string" && src.startsWith("local:")
  );

  function abrirModalFotos(fotos, fotosMeta = [], idx = 0) {
    setModalFotos(Array.isArray(fotos) ? fotos : []);
    setModalFotosMeta(Array.isArray(fotosMeta) ? fotosMeta : []);
    setFotoIndex(idx);
    setModalOpen(true);
  }

  function openModalAt(idx) {
    abrirModalFotos(fotosPublicas, demanda.fotosMeta || [], idx);
  }

  function openModalAtualizacao(fotos, fotosMeta, idx) {
    abrirModalFotos(fotos, fotosMeta, idx);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleEntrarParaReforcar() {
    const params = new URLSearchParams(location.search);

    params.set("acao", "reforcar");

    const redirectTo = `${location.pathname}?${params.toString()}`;

    navigate(`/entrar?redirect=${encodeURIComponent(redirectTo)}`);
  }

  function handleEntrarParaAtualizar() {
    const params = new URLSearchParams(location.search);

    params.set("acao", "atualizar");

    const redirectTo = `${location.pathname}?${params.toString()}`;

    navigate(`/entrar?redirect=${encodeURIComponent(redirectTo)}`);
  }  

  function handleReforcarDemanda() {
    if (!demanda?.id) return;

    const result = reforcarDemanda({ demandaAlvoId: demanda.id });

    if (!result.ok) {
      setConfirmacaoReforcoAberta(false);

      setAlertOverlay({
        title: "Não foi possível reforçar",
        message: result.message || "Tente novamente.",
        actionLabel: "Fechar",
      });

      return;
    }

    setConfirmacaoReforcoAberta(false);

    setToastReforco({
      title: "Reforço registrado",
      message: "Esta demanda ganhou mais força no painel.",
    });

    window.setTimeout(() => {
      setToastReforco(null);
    }, 2000);
  }
  
  function prevFoto() {
    if (!modalFotos.length) return;
    setFotoIndex((i) => (i - 1 + modalFotos.length) % modalFotos.length);
  }

  function nextFoto() {
    if (!modalFotos.length) return;
    setFotoIndex((i) => (i + 1) % modalFotos.length);
  }

  function enviarNovasFotos() {
    setAlertOverlay({
      title: "Envio de novas evidências",
      message:
        "Novas evidências passam por validação antes de serem exibidas publicamente na demanda.",
    });
  }

  function handleAdicionarEvidenciaAtualizacao() {
    setAlertOverlay({
      title: "Nova evidência para atualização",
      message:
        "Novas evidências podem ser adicionadas em atualizações cidadãs quando houver informação complementar sobre o problema.",
      actionLabel: "Fechar",
    });
  }  

  function handleAceitarResposta(respostaIdx) {
    if (!demanda?.id) return;

    if (!podeAvaliarResposta) {
      setAlertOverlay({
        title: "Ação indisponível",
        message: mensagemBloqueioAvaliacao,
        actionLabel: "Fechar",
      });
      return;
    }    

    const now = new Date();
    const nowIso = now.toISOString();
    const dataHistorico = nowIso.slice(0, 10);

    const nextDemandas = demandasBase.map((item) => {
      if (item.id !== demanda.id) return item;

      const respostasAtuais = Array.isArray(item.respostaResponsavel)
        ? item.respostaResponsavel
        : Array.isArray(item.respostaOrgao)
        ? item.respostaOrgao
        : [];

      const respostasAtualizadas = respostasAtuais.map((resposta, idx) => {
        if (idx !== respostaIdx) return resposta;

        return {
          ...resposta,
          statusCidadao: "aceita",
          avaliadaEm: nowIso,
        };
      });

      return {
        ...item,
        respostaResponsavel: respostasAtualizadas,
        ultimaMovimentacaoEm: nowIso,
        historico: adicionarEventoHistorico(item.historico, {
          data: dataHistorico,
          tipo: "cidadao",
          evento: "Resposta do responsável aceita pelo cidadão.",
        }),
      };
    });

    setContestandoRespostaIdx(null);
    setTextoContestacao("");
    setDemandasBase(nextDemandas);
    persistirDemandas(nextDemandas);

    setAlertOverlay({
      title: "Resposta aceita",
      message: "Sua avaliação foi registrada no histórico da demanda.",
      actionLabel: "Fechar",
    });
  }

  function handleEnviarContestacao(respostaIdx) {
    if (!demanda?.id) return;

    if (!podeAvaliarResposta) {
      setAlertOverlay({
        title: "Ação indisponível",
        message: mensagemBloqueioAvaliacao,
        actionLabel: "Fechar",
      });
      return;
    }    
    const texto = textoContestacao.trim();

    if (texto.length < 20) {
      setAlertOverlay({
        title: "Contestação muito curta",
        message:
          "Explique em pelo menos 20 caracteres por que a resposta não atende à demanda.",
        actionLabel: "Fechar",
      });
      return;
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const dataHistorico = nowIso.slice(0, 10);

    const nextDemandas = demandasBase.map((item) => {
      if (item.id !== demanda.id) return item;

      const respostasAtuais = Array.isArray(item.respostaResponsavel)
        ? item.respostaResponsavel
        : Array.isArray(item.respostaOrgao)
        ? item.respostaOrgao
        : [];

      const respostasAtualizadas = respostasAtuais.map((resposta, idx) => {
        if (idx !== respostaIdx) return resposta;

        return {
          ...resposta,
          statusCidadao: "contestada",
          avaliadaEm: nowIso,
          contestacao: {
            texto,
            data: nowIso,
            autorId: authUser?.email || currentUserId || "anonimo",
            autorNome: authUser?.nome || "Cidadão",
          },
        };
      });

      return {
        ...item,
        respostaResponsavel: respostasAtualizadas,
        ultimaMovimentacaoEm: nowIso,
        historico: adicionarEventoHistorico(item.historico, {
          data: dataHistorico,
          tipo: "cidadao",
          evento: "Resposta do responsável contestada pelo cidadão.",
        }),
      };
    });

    setContestandoRespostaIdx(null);
    setTextoContestacao("");
    setDemandasBase(nextDemandas);
    persistirDemandas(nextDemandas);

    setAlertOverlay({
      title: "Contestação registrada",
      message: "Sua contestação foi registrada no histórico da demanda.",
      actionLabel: "Fechar",
    });
  }

  function handleSimularSegundaRespostaResponsavel() {
    if (!demanda?.id) return;

    if (!podeSimularSegundaResposta) {
      setAlertOverlay({
        title: "Ação indisponível",
        message:
          "A segunda resposta só pode ser simulada quando a primeira resposta tiver sido contestada.",
        actionLabel: "Fechar",
      });
      return;
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const dataHistorico = nowIso.slice(0, 10);

    const nextDemandas = demandasBase.map((item) => {
      if (item.id !== demanda.id) return item;

      const respostasAtuais = Array.isArray(item.respostaResponsavel)
        ? item.respostaResponsavel
        : Array.isArray(item.respostaOrgao)
        ? item.respostaOrgao
        : [];

      if (respostasAtuais.length >= 2) {
        return item;
      }

      const primeiraResposta = respostasAtuais[0] || {};

      const segundaResposta = {
        data: dataHistorico,
        protocolo: `${primeiraResposta.protocolo || demanda.id}-R2`,
        responsavel:
          primeiraResposta.responsavel ||
          item.orgao?.nome ||
          "Responsável pelo atendimento",
        tipoResponsavel:
          primeiraResposta.tipoResponsavel || "orgao_publico",
        canal: "registro_interno",
        rodada: 2,
        texto:
          "Após nova análise da contestação registrada pelo cidadão, informamos que a demanda será reavaliada pela equipe responsável para definição das providências cabíveis.",
        statusCidadao: "pendente_avaliacao",
        avaliadaEm: null,
        contestacao: null,
      };

      return {
        ...item,
        respostaResponsavel: [...respostasAtuais, segundaResposta],
        ultimaMovimentacaoEm: nowIso,
        historico: adicionarEventoHistorico(item.historico, {
          data: dataHistorico,
          tipo: "responsavel",
          evento: "Segunda resposta do responsável registrada.",
        }),
      };
    });

    setContestandoRespostaIdx(null);
    setTextoContestacao("");
    setDemandasBase(nextDemandas);
    persistirDemandas(nextDemandas);

    setAlertOverlay({
      title: "Nova resposta registrada",
      message:
        "A nova manifestação do responsável foi adicionada ao histórico da demanda.",
      actionLabel: "Fechar",
    });
  }

  async function handleSalvarAtualizacao(payload) {
    try {
      if (!demanda?.id) {
        return {
          ok: false,
          message: "Demanda não encontrada para receber a atualização.",
        };
      }

      const now = new Date();
      const nowIso = now.toISOString();
      const dataHistorico = nowIso.slice(0, 10);

      const atualizacao = {
        id: `ATU-${Date.now()}`,
        createdAt: nowIso,
        autorId: authUser?.email || "anonimo",
        autorNome: authUser?.nome || "Cidadão",
        autorEmail: authUser?.email || "",
        descricao: payload.descricao,
        pontoReferencia: payload.pontoReferencia,
        aceiteResponsabilidade: Boolean(payload.aceiteResponsabilidade),
        fotos: Array.isArray(payload.fotos)
          ? await Promise.all(
              payload.fotos.map(async (file) => {
                if (typeof file === "string") return file;
                return await fileToDataUrl(file);
              })
            )
          : [],
        fotosMeta: Array.isArray(payload.fotosMeta) ? payload.fotosMeta : [],
        enderecoDetectado: payload.enderecoDetectado || null,
        localRelato: payload.localRelato || null,
        status: "registrada",
        origem: "atualizacao_cidada",
      };

      const nextDemandas = demandasBase.map((item) => {
        if (item.id !== demanda.id) return item;

        const atualizacoesAtuais = Array.isArray(item.atualizacoes)
          ? item.atualizacoes
          : [];

        return {
          ...item,
          atualizacoes: [...atualizacoesAtuais, atualizacao],
          ultimaMovimentacaoEm: nowIso,
          historico: adicionarEventoHistorico(item.historico, {
            data: dataHistorico,
            tipo: "cidadao",
            evento: "Atualização cidadã registrada.",
          }),
        };
      });

      setDemandasBase(nextDemandas);
      localStorage.setItem("falaCidadao:demandas", JSON.stringify(nextDemandas));
      window.dispatchEvent(new Event("falaCidadao:demandas_updated"));

      return { ok: true };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        message: "Ocorreu um erro ao salvar a atualização.",
      };
    }
  }
  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Header da página */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Detalhes da Demanda
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={smallBadgeClass}>
                {demanda.id}
              </span>

              <span
                className={`px-2 py-1 rounded-full ${statusBadgeClass(
                  statusOperacional,
                  appearance
                )}`}
              >
                {statusOperacional}
              </span>

              <span
                className={`px-2 py-1 rounded-full ${acompanhamentoBadgeClass(
                  acompanhamentoDemanda,
                  appearance
                )}`}
              >
                {acompanhamentoDemanda}
              </span>
            </div>

          </div>
          <BackButton to={painelBackTo} />  
        </div>

        {/* Card principal (resumo) */}
        <div className={sectionCardClass}>

          {/* Header do box */}
          <div className="flex flex-col gap-3">

            {/* Linha 1 — Título + Categoria + Código */}
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold shrink-0">
                Resumo da demanda
              </h2>

              <span className={`${smallBadgeClass} text-xs`}>
                {demanda.categoria}
              </span>
            </div>

            {/* Linha 2 — Localização */}
            <div className="text-textmuted text-sm space-y-1">
              <div>{localResumoExibido}</div>

              {tempoPercebidoExibido ? (
                <div className="text-xs text-textsoft">
                  Percebido:{" "}
                  <span className="text-textmain">{tempoPercebidoExibido}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Responsável e encaminhamento */}
          <div className="text-sm text-textsoft space-y-1">
            <div>
              Responsável atual:{" "}
              <span className="text-textmain">{responsavelAtual}</span>
            </div>

            <div>
              Encaminhamento:{" "}
              <span className="text-textmain">
                {dataEncaminhamento
                  ? formatDateBR(dataEncaminhamento)
                  : "Ainda em triagem"}
              </span>
            </div>
          </div>

          {/* Descrição */}
          <p className="text-textmain leading-relaxed">
            {demanda.descricao}
          </p>

          {demanda.pontoReferencia ? (
            <div className="text-xs text-textsoft pt-1">
              Ponto de referência:{" "}
              <span className="text-textmain">{demanda.pontoReferencia}</span>
            </div>
          ) : null}
        </div>

        {/* Galeria (evidências) */}
        <div className={sectionCardCompactClass}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Evidências</h2>
              <span className="text-xs text-textmuted">
                {fotosPublicas.length
                  ? `${fotosPublicas.length} foto(s)`
                  : "Sem fotos publicadas"}
              </span>
            </div>
          </div>

          {fotosPublicas.length ? (
          <EvidenceGrid
            fotos={fotosPublicas}
            fotosMeta={demanda.fotosMeta}            
            onClickFoto={openModalAt}
          />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-textmuted">
                Esta demanda não possui evidências fotográficas publicadas.
              </p>

              {anexosPendentes.length ? (
                <div className="rounded-xl border border-borderSubtle bg-overlay p-3">
                  <p className="text-xs text-textsoft mb-2">
                    Anexos enviados (pendentes de validação/publicação):
                  </p>

                  <ul className="space-y-1 text-xs text-textmuted">
                    {anexosPendentes.map((src, idx) => (
                      <li
                        key={`${src}-${idx}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          {src.replace("local:", "")}
                        </span>
                        <span className="px-2 py-0.5 rounded-full border border-borderSubtle bg-overlay text-textmuted">
                          Pendente
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-[11px] text-textmuted mt-2">
                    Esses anexos aguardam validação antes de serem exibidos publicamente.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Mobilização cidadã */}
        <div className={sectionCardClass}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-lg font-semibold">Mobilização cidadã</h2>
            {demandaBloqueadaParaMovimentacao ? null : !isAutenticado ? (
              <button
                type="button"
                onClick={handleEntrarParaReforcar}
                className={subtleButtonClass}
              >
                Entrar para reforçar
              </button>
            ) : podeReforcar ? (
              <button
                type="button"
                onClick={() => setConfirmacaoReforcoAberta(true)}
                className={subtleButtonClass}
              >
                Reforçar demanda
              </button>
            ) : null}
          </div>

          <div className={innerCardClass}>
            <p className="text-sm text-textmain">{resumoMobilizacao}</p>

            {demandaBloqueadaParaMovimentacao ? null : totalReforcos > 0 ? (
              <p className="text-xs text-textmuted">
                Último reforço registrado em: {ultimoReforco}
              </p>
            ) : (
              <p className="text-xs text-textmuted">
                A mobilização começará quando outro cidadão reforçar esta demanda.
              </p>
            )}

            {demandaBloqueadaParaMovimentacao ? (
              <p className="text-xs text-textmuted">
                {mensagemBloqueioMovimentacao}
              </p>
            ) : !isAutenticado ? (
              <p className="text-xs text-textmuted">
                Faça login para participar da mobilização desta demanda.
              </p>
            ) : isAutorOriginal ? (
              <p className="text-xs text-textmuted">
                Você é o autor desta demanda.
              </p>
            ) : jaReforcou ? (
              <p className="text-xs text-textmuted">
                Você já reforçou esta demanda.
              </p>
            ) : null}
          </div>
        </div>

        {/* Atualizações do problema */}
        <AtualizacoesProblemaCard
          isAutenticado={isAutenticado}
          jaAtualizou={jaAtualizou}
          podeAtualizarProblema={podeAtualizarProblema}
          demandaBloqueadaParaMovimentacao={demandaBloqueadaParaMovimentacao}
          mensagemBloqueioMovimentacao={mensagemBloqueioMovimentacao}
          demandaComRespostaContestada={demandaComRespostaContestada}
          totalAtualizacoes={Array.isArray(demanda.atualizacoes) ? demanda.atualizacoes.length : 0}
          atualizacoes={Array.isArray(demanda.atualizacoes) ? demanda.atualizacoes : []}
          localOriginal={{
            lat: demanda?.localRelato?.lat ?? demanda?.enderecoDetectado?.lat ?? null,
            lng: demanda?.localRelato?.lng ?? demanda?.enderecoDetectado?.lng ?? null,
          }}
          onAviso={(payload) => setAlertOverlay(payload)}
          onSalvarAtualizacao={handleSalvarAtualizacao}
          onFluxoAtualizacaoChange={(ativo) => {
            setFluxoAtualizacaoAtivo(ativo);

            if (ativo) {
              setAbrirAtualizacaoAutomaticamente(false);
            }
          }}
          onAbrirFotoAtualizacao={openModalAtualizacao}
          onEntrarParaAtualizar={handleEntrarParaAtualizar}
          abrirAtualizacaoAutomaticamente={abrirAtualizacaoAutomaticamente}
        />

        {/* Histórico */}
        {!fluxoAtualizacaoAtivo ? (
          <div className={sectionCardCompactClass}>
            <h2 className="text-lg font-semibold">Histórico</h2>
            {Array.isArray(demanda.historico) && demanda.historico.length ? (
              <div className="space-y-3">
                {demanda.historico.map((h, idx) => (
                  <div
                    key={`${h.data}-${idx}`}
                    className={timelineItemClass}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-textmuted">{formatDateBR(h.data)}</span>
                      {h.tipo && (
                        <span
                          className={`px-2 py-0.5 rounded-full ${tipoBadge(
                            h.tipo,
                            appearance
                          )}`}
                        >
                          {tipoLabel(h.tipo)}
                        </span>
                      )}
                    </div>
                      <p className="text-sm text-textmain">
                        {formatarEventoHistorico(h.evento)}
                      </p>
                    </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-textmuted">
                Sem eventos registrados no histórico ainda.
              </p>
            )}
          </div>
        ) : null}

        {/* Resposta do responsável */}
        {!fluxoAtualizacaoAtivo ? (
          <div className={sectionCardCompactClass}>
            <h2 className="text-lg font-semibold">Resposta do responsável</h2>

            {respostasResponsavel.length ? (
              <>
                <p className="text-sm text-textmuted">
                  Abaixo estão registradas as manifestações recebidas do responsável pelo atendimento desta demanda.
                </p>

                <div className="space-y-3">

                {respostasResponsavel.map((r, idx) => {
                  const textoResposta = r.mensagem || r.texto || "Resposta não informada.";
                  const isContestando = contestandoRespostaIdx === idx;

                  return (
                    <div
                      key={`${r.data}-${idx}`}
                      className={responseItemClass}
                    >
                      {isContestando ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-textmain">
                              Contestando resposta do responsável
                            </p>
                            <p className="text-xs text-textmuted mt-1">
                              Revise a resposta recebida e explique por que ela não atende à demanda registrada.
                            </p>
                          </div>

                          <div className={nestedSoftBoxClass}>
                            <p className="text-xs text-textmuted mb-1">
                              Resposta recebida:
                            </p>
                            <p className="text-sm text-textmain leading-relaxed">
                              {textoResposta}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-xs text-textmuted">
                              Explique por que esta resposta não atende à demanda.
                            </label>

                            <textarea
                              value={textoContestacao}
                              onChange={(e) => setTextoContestacao(e.target.value)}
                              rows={3}
                              className="w-full rounded-xl border border-borderSubtle bg-surfaceLight/20 px-3 py-2 text-sm text-textmain placeholder:text-textmuted outline-none focus:border-amber-500"
                              placeholder="Ex.: O problema continua no local, e a resposta não informa prazo ou providência concreta."
                            />

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleEnviarContestacao(idx)}
                                className={acceptButtonClass}
                              >
                                Enviar
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setContestandoRespostaIdx(null);
                                  setTextoContestacao("");
                                }}
                                className={contestButtonClass}
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-textmuted">
                              {formatDateBR(r.data)}
                            </span>

                            {r.protocolo ? (
                              <span className={subtlePillClass}>
                                {r.protocolo}
                              </span>
                            ) : (
                              <span className={subtlePillClass}>
                                Sem protocolo
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-textmain leading-relaxed">
                            {textoResposta}
                          </p>

                          {r.statusCidadao === "aceita" ? (
                            <div className="pt-2 border-t border-borderSubtle">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs ${respostaStatusBadgeClass(
                                  "aceita",
                                  appearance
                                )}`}
                              >
                                Resposta aceita pelo cidadão
                              </span>
                            </div>
                          ) : null}

                          {r.statusCidadao === "contestada" ? (
                            <div className="pt-2 border-t border-borderSubtle space-y-2">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs ${respostaStatusBadgeClass(
                                  "contestada",
                                  appearance
                                )}`}
                              >
                                Resposta contestada pelo cidadão
                              </span>

                              {r.contestacao?.texto ? (
                                <div className={nestedSoftBoxClass}>
                                  <p className="text-xs text-textmuted mb-1">
                                    Motivo da contestação:
                                  </p>
                                  <p className="text-sm text-textmain leading-relaxed">
                                    {r.contestacao.texto}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {r.statusCidadao === "pendente_avaliacao" ? (
                            <div className="pt-2 border-t border-borderSubtle space-y-2">
                              {podeAvaliarResposta ? (
                                <>
                                  <p className="text-xs text-textmuted">
                                    Esta resposta atende à demanda registrada?
                                  </p>

                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAceitarResposta(idx)}
                                      className={acceptButtonClass}
                                    >
                                      Aceitar
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setContestandoRespostaIdx(idx);
                                        setTextoContestacao("");
                                      }}
                                      className={contestButtonClass}
                                    >
                                      Contestar
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <div className="rounded-lg border border-borderSubtle bg-surfaceLight/10 px-3 py-2">
                                  <p className="text-xs text-textsoft">
                                    {mensagemBloqueioAvaliacao}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  );
                })}

                </div>

                {podeSimularSegundaResposta ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-2">
                    <p className="text-xs text-amber-200 leading-relaxed">
                      A primeira resposta foi contestada pelo cidadão. Uma nova manifestação do responsável pode ser registrada para complementar o acompanhamento da demanda.
                    </p>

                    <button
                      type="button"
                      onClick={handleSimularSegundaRespostaResponsavel}
                      className="px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs hover:bg-amber-500/20 transition"
                    >
                      Registrar nova resposta do responsável
                    </button>
                  </div>
                ) : null}

                {cicloRespostasEncerrado ? (
                  <div className={`${nestedSoftBoxClass} space-y-1`}>
                    <p className="text-sm text-textmain font-medium">
              Ciclo de respostas encerrado.
                    </p>

                    <p className="text-xs text-textmuted leading-relaxed">
                      Esta demanda já recebeu as manifestações registradas do responsável e não possui novas rodadas de resposta abertas.
                    </p>
                  </div>
                ) : null}                

                <p className="text-[11px] text-textmuted">
                  As respostas podem conter posicionamentos oficiais, prazos estimados, números de protocolo e atualizações de andamento.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-textmuted">
                  Aguardando manifestação do responsável pelo atendimento.
                </p>

                <div className="rounded-xl border border-borderSubtle bg-overlay p-3 space-y-2">
                  <p className="text-sm text-textsoft leading-relaxed">
                    Quando uma resposta é enviada por e-mail ou registrada pelo sistema, ela pode ser registrada aqui
                    com data e protocolo para manter transparência e histórico público.
                  </p>

                  <p className="text-[11px] text-textmuted">
                    As manifestações recebidas serão registradas nesta seção para manter transparência, rastreabilidade e histórico público da demanda.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Modal de foto */}
      <ModalFoto
        open={modalOpen}
        fotos={modalFotos}
        fotosMeta={modalFotosMeta}
        index={fotoIndex}
        onClose={closeModal}
        onPrev={prevFoto}
        onNext={nextFoto}
      />
      {confirmacaoReforcoAberta ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-borderSubtle bg-surface p-5 shadow-xl space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-textmain">
                Reforçar esta demanda?
              </h2>

              <p className="text-sm text-textmuted leading-relaxed">
                Ao confirmar, você informa que este problema também foi observado por você
                ou continua relevante para a comunidade.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmacaoReforcoAberta(false)}
                className={subtleButtonClass}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleReforcarDemanda}
                className={acceptButtonClass}
              >
                Confirmar reforço
              </button>
            </div>
          </div>
        </div>
      ) : null}     
        {toastReforco ? (
          <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-sm font-semibold text-emerald-100">
              {toastReforco.title}
            </p>

            <p className="text-xs text-emerald-100/80">
              {toastReforco.message}
            </p>
          </div>
        ) : null}      
       
        <AlertOverlay
          open={!!alertOverlay}
          title={alertOverlay?.title}
          message={alertOverlay?.message}
          actionLabel={alertOverlay?.actionLabel}
          onClose={() => setAlertOverlay(null)}
        />      
    </section>
  );
}
