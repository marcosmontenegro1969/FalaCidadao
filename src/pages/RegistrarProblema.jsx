// src/pages/RegistrarProblema.jsx

import { useContext, useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { CITY_THEMES } from "../theme/cities";
import { addDemanda, getDemandas, setDemandas } from "../storage/demandasStorage";
import { CATEGORIAS_DEMANDAS } from "../constants/categoriasDemandas";
import PulseButton from "../components/PulseButton";
import SecondaryActionButton from "../components/SecondaryActionButton";
import EvidenceGrid from "../components/EvidenceGrid";
import BackButton from "../components/BackButton";

/**
 * ---------------------------------------------------------------------------
 * RegistrarProblema — Fluxo (visão macro)
 * ---------------------------------------------------------------------------
 * Objetivo: permitir que o cidadão registre um problema com evidências, MAS
 * primeiro tente evitar duplicidade de demandas (triagem).
 *
 * FASE 1 — Dados mínimos do problema (Categoria, Bairro, Rua, Ponto de referência)
 *   1) Usuário preenche dados e clica "Verificar se já existe" (triagem).
 *   2) O sistema procura demandas parecidas (mesma cidade, pesos de categoria/bairro/rua).
 *
 * FASE 1.5 — Resultado da triagem
 *   - Se encontrar possíveis correspondências: usuário escolhe uma ação:
 *       a) "reforcar"  -> confirma que é o mesmo (sem fotos novas)
 *       b) "anexar"    -> adiciona novas fotos à demanda existente
 *       c) "novo"      -> registra como novo problema
 *   - Se NÃO encontrar correspondências: o sistema avança automaticamente para "novo".
 *
 * FASE 2 — Execução da ação (render condicional por acaoEscolhida)
 *   - "reforcar": descrição curta + aceite -> incrementa impacto.confirmacoes
 *   - "anexar"  : descrição + 2..5 fotos + aceite -> adiciona fotos à demanda alvo
 *   - "novo"    : descrição + 2..5 fotos + aceite -> cria demanda nova
 *
 * UX (micro):
 *   - scrollTo(refSeção, refFoco) para levar o usuário ao ponto do erro/ação.
 *   - toast leve (success/error/info) para feedback sem bloquear.
 *   - overlay de processamento durante compressão/conversão das imagens.
 */

// =============================================================================
// 1) Helpers de "duplicidade" / triagem (MVP)
// =============================================================================

/**
 * normalizeText:
 * - padroniza string para comparação (lowercase, remove acentos, limpa pontuação)
 * - usado em bairro/rua e tokenização
 */
function normalizeText(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * tokenize:
 * - divide a descrição em palavras úteis (remove stopwords e termos curtos)
 * - objetivo: evitar que “rua”, “av”, “número”, etc. dominem a comparação
 */
function tokenize(s = "") {
  const stop = new Set([
    "a","o","os","as","um","uma","de","do","da","dos","das","em","no","na","nos","nas",
    "para","por","e","ou","com","sem","ao","aos","à","às","que","ha","há",
    "dias","dia","rua","avenida","av","prox","proximo","próximo","numero","número",
  ]);

  return normalizeText(s)
    .split(" ")
    .filter((w) => w.length >= 3 && !stop.has(w));
}

/**
 * Similaridade simples (Jaccard) entre dois conjuntos de tokens.
 * Retorna 0..1
 */
function jaccard(aTokens = [], bTokens = []) {
  const A = new Set(aTokens);
  const B = new Set(bTokens);
  if (A.size === 0 && B.size === 0) return 0;

  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;

  const uni = A.size + B.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

/**
 * computeDupScore:
 * - gera um "score" de possível duplicidade entre o input do usuário e uma demanda existente.
 * - regra mínima: mesma cidade
 * - pesos (MVP):
 *     categoria = 0.45 (alto)
 *     bairro    = 0.20 (médio)
 *     rua       = 0.15 (médio, por contains)
 *     descricao = 0.20 (leve, por similaridade Jaccard)
 *
 * Retorna score 0..1
 */
function computeDupScore({ cidade, categoria, bairro, rua, descricao }, demanda) {
  // regra mínima: mesma cidade
  if (!cidade || demanda.cidade !== cidade) return 0;

  let score = 0;

  // categoria (alto peso)
  if (categoria && demanda.categoria === categoria) score += 0.45;

  // bairro (médio)
  if (bairro && normalizeText(demanda.bairro) === normalizeText(bairro)) score += 0.2;

  // rua (médio) — MVP: texto livre (contains)
  if (rua && demanda.rua && normalizeText(demanda.rua).includes(normalizeText(rua))) {
    score += 0.15;
  }

  // descrição (leve)
  const sim = jaccard(tokenize(descricao), tokenize(demanda.descricao));
  score += Math.min(0.2, sim * 0.2);

  return score; // 0..1
}

/**
 * Limite de armazenamento:
 * - como o MVP guarda Base64 no LocalStorage, precisamos de teto.
 * - 3.5MB é "teto seguro" para evitar estourar quota em navegadores comuns.
 */
const MAX_FOTOS_TOTAL_BYTES = 3.5 * 1024 * 1024;

// =============================================================================
// 2) Fotos: compressão + conversão para Base64 (MVP sem backend)
// =============================================================================

/**
 * readAsDataURL:
 * - lê um File e retorna DataURL (base64) original
 */
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * loadImage:
 * - carrega DataURL em um objeto Image para desenhar em Canvas
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // evita ceneita de canvas tainted em cenários futuros (URLs remotas)
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });
}

/**
 * fileToCompressedDataURL:
 * - pipeline de compressão:
 *   File -> DataURL -> Image -> Canvas resize -> DataURL comprimido
 * - reduz drasticamente peso e resolução para caber no LocalStorage
 */
async function fileToCompressedDataURL(
  file,
  { maxW = 1280, maxH = 1280, quality = 0.72, mime = "image/jpeg" } = {}
) {
  const originalDataUrl = await readAsDataURL(file);
  const img = await loadImage(originalDataUrl);

  let { width, height } = img;
  const ratio = Math.min(maxW / width, maxH / height, 1); // nunca aumenta
  const targetW = Math.max(1, Math.round(width * ratio));
  const targetH = Math.max(1, Math.round(height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador.");

  // JPEG não suporta transparência; fundo branco evita “preto” em PNGs transparentes
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  }

  ctx.drawImage(img, 0, 0, targetW, targetH);
  return canvas.toDataURL(mime, quality);
}

/**
 * estimateBase64Bytes:
 * - calcula bytes aproximados do conteúdo base64 (sem header "data:image/...;base64,")
 * - usado para impor limite total (MAX_FOTOS_TOTAL_BYTES)
 */
function estimateBase64Bytes(dataUrl = "") {
  const i = dataUrl.indexOf("base64,");
  if (i === -1) return 0;

  const b64 = dataUrl.slice(i + 7);

  // bytes ≈ (len * 3/4) - padding
  let padding = 0;
  if (b64.endsWith("==")) padding = 2;
  else if (b64.endsWith("=")) padding = 1;

  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

/**
 * formatBytes:
 * - apenas utilitário para mensagens amigáveis ao usuário
 */
function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * filesToBase64:
 * - processa em série para reduzir travamentos de UI.
 * - emite progress (done/total/fileName) para overlay
 * - se 1 arquivo falhar, ele é ignorado (MVP tolerante)
 */
async function filesToBase64(files, opts) {
  const out = [];
  const onProgress = opts?.onProgress;

  for (let i = 0; i < files.length; i++) {
    const f = files[i];

    try {
      const dataUrl = await fileToCompressedDataURL(f, opts);
      out.push(dataUrl);
    } catch (err) {
      console.warn("Falha ao converter imagem:", f?.name, err);
      // MVP: ignora a foto com problema, mantém o fluxo vivo
    } finally {
      if (typeof onProgress === "function") {
        onProgress({
          done: i + 1,
          total: files.length,
          fileName: f?.name ?? "",
        });
      }
    }
  }

  return out;
}

// =============================================================================
// 3) Componentes locais: Modal de fotos existentes + Overlay de processamento
// =============================================================================

/**
 * ModalFotos:
 * - usado para visualizar fotos já existentes de uma demanda sugerida na triagem
 * - abre ao clicar na miniatura no painel de sugestões
 */
function ModalFotos({ open, fotos, index, onClose, onPrev, onNext, title }) {
  if (!open) return null;

  const hasFotos = Array.isArray(fotos) && fotos.length > 0;
  const src = hasFotos ? fotos[index] : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização de foto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur p-3 md:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="text-xs text-white/80">
            {title ? <span className="text-white/90">{title} · </span> : null}
            Evidência {hasFotos ? index + 1 : 0} de {hasFotos ? fotos.length : 0}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/90 hover:bg-white/10 transition"
          >
            Fechar
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center min-h-[240px]">
          {src ? (
            <img
              src={src}
              alt={`Evidência ${index + 1}`}
              className="w-full h-full object-contain"
              loading="eager"
            />
          ) : (
            <div className="text-sm text-white/70 p-6">
              Nenhuma evidência fotográfica disponível.
            </div>
          )}
        </div>

        {hasFotos && fotos.length > 1 && (
          <div className="flex items-center justify-between gap-2 mt-3">
            <button
              type="button"
              onClick={onPrev}
              className="px-3 py-2 rounded-lg border border-white/10 text-xs text-white/90 hover:bg-white/10 transition"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={onNext}
              className="px-3 py-2 rounded-lg border border-white/10 text-xs text-white/90 hover:bg-white/10 transition"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ProcessingOverlay:
 * - aparece durante compressão/conversão das imagens
 * - dá transparência ao usuário de que o app não travou
 */
function ProcessingOverlay({ open, progress }) {
  if (!open) return null;

  const { done, total, fileName } = progress || {};
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur p-5 space-y-3">
        <div className="text-sm text-white/90 font-medium">
          Processando fotos...
        </div>

        <div className="text-xs text-white/70">
          {total ? `Convertendo ${done}/${total}` : "Preparando..."}
          {fileName ? (
            <span className="block mt-1 truncate">Arquivo: {fileName}</span>
          ) : null}
        </div>

        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="text-[11px] text-white/60">
          Isso pode levar alguns segundos dependendo do tamanho das imagens.
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 4) Componente principal: estado, triagem, validações e submissões
// =============================================================================

export default function RegistrarProblema() {
  const navigate = useNavigate();

  // cidade ativa vem do contexto global (ThemeContext)
  const { city } = useContext(ThemeContext);
  const cityTheme = CITY_THEMES[city] ?? CITY_THEMES.default;

  // ---------------------------------------------------------------------------
  // 4.1) Refs de UX: scroll e foco em validações
  // ---------------------------------------------------------------------------
  // - descricaoRef/evidenciasRef/avisoRef apontam para "seções"
  // - descricaoInputRef/fotosPickRef apontam para elementos focáveis
  const descricaoRef = useRef(null);
  const descricaoInputRef = useRef(null);
  const evidenciasRef = useRef(null);
  const avisoRef = useRef(null);
  const fotosPickRef = useRef(null);

  /**
   * scrollTo:
   * - usado nas validações para levar o usuário diretamente ao ponto do erro
   * - se focusRef existir, foca o input/textarea após um pequeno delay
   */
  function scrollTo(sectionRef, focusRef) {
    const el = sectionRef?.current;
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });

    const target = focusRef?.current;
    if (target && typeof target.focus === "function") {
      window.setTimeout(() => target.focus(), 250);
    }
  }

  // ---------------------------------------------------------------------------
  // 4.2) Estados do formulário
  // ---------------------------------------------------------------------------

  // FASE 1: dados mínimos do problema
  const [categoria, setCategoria] = useState("Iluminação");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");

  // FASE 2: descrição varia conforme ação escolhida
  // - novo: descrição completa
  // - anexar: "por que as novas fotos ajudam"
  // - reforcar: frase curta
  const [descricaoNovo, setDescricaoNovo] = useState("");
  const [descricaoAnexo, setDescricaoAnexo] = useState("");
  const [descricaoReforco, setDescricaoReforco] = useState("");

  // evidências (somente em novo/anexar)
  const [fotosSelecionadas, setFotosSelecionadas] = useState([]); // File[]
  const [aceiteResponsabilidade, setAceiteResponsabilidade] = useState(false);

  // feedback de UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null); // { type, message }
  const [progress, setProgress] = useState({ done: 0, total: 0, fileName: "" });

  // triagem: quando true, calculamos sugestões (useMemo) e exibimos painel
  const [triagemAtiva, setTriagemAtiva] = useState(false);

  // ação escolhida pós-triagem:
  // null (nenhuma) | "novo" | "anexar" | "reforcar"
  const [acaoEscolhida, setAcaoEscolhida] = useState(null);
  const [demandaAlvoId, setDemandaAlvoId] = useState(null);

  // sempre que o usuário troca de ação, exigimos novo aceite (evita “auto-aceite”)
  useEffect(() => {
    setAceiteResponsabilidade(false);
  }, [acaoEscolhida]);

  // ---------------------------------------------------------------------------
  // 4.3) Modal para ver fotos de demandas sugeridas
  // ---------------------------------------------------------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFotos, setModalFotos] = useState([]);
  const [modalIdx, setModalIdx] = useState(0);
  const [modalTitle, setModalTitle] = useState("");

  // ---------------------------------------------------------------------------
  // 4.4) Base de demandas (LocalStorage) + assinatura de atualização
  // ---------------------------------------------------------------------------
  const [demandasBase, setDemandasBase] = useState([]);

  /**
   * triagemHabilitada:
   * - só permitimos triagem quando os 3 campos essenciais estiverem preenchidos
   */
  const triagemHabilitada =
    categoria.trim().length > 0 &&
    bairro.trim().length > 0 &&
    rua.trim().length > 0;

  /**
   * Sempre que o usuário altera dados do problema, invalidamos triagem/ação.
   * Motivo: evita manter sugestões/ação escolhida com dados antigos.
   * Observação: mantemos descrição/fotos no MVP para não frustrar quem só “corrigiu” rua/bairro.
   */
  useEffect(() => {
    setTriagemAtiva(false);
    setAcaoEscolhida(null);
    setDemandaAlvoId(null);
  }, [categoria, bairro, rua, pontoReferencia]);

  /**
   * Carrega demandas do LocalStorage e escuta um evento custom
   * (emitido pelo storage quando houver mudanças em outras telas).
   */
  useEffect(() => {
    const load = () => setDemandasBase(getDemandas());
    load();

    window.addEventListener("falaCidadao:demandas_updated", load);
    return () => window.removeEventListener("falaCidadao:demandas_updated", load);
  }, []);

  /**
   * descricaoParaTriagem:
   * - reservado para futuras melhorias (Cap. 4), caso você queira incluir descrição no score
   * - no momento, o input de triagem usa descricao: "" (apenas dados mínimos)
   */
  const descricaoParaTriagem =
    acaoEscolhida === "reforcar"
      ? descricaoReforco
      : acaoEscolhida === "anexar"
      ? descricaoAnexo
      : descricaoNovo;

  // ---------------------------------------------------------------------------
  // 4.5) Sugestões da triagem (useMemo) + auto-avanço para "novo" quando não há match
  // ---------------------------------------------------------------------------

  /**
   * sugestoes:
   * - calculado apenas quando triagemAtiva=true
   * - filtro: score >= 0.55 e no máximo 3 itens
   */
  const sugestoes = useMemo(() => {
    if (!triagemAtiva) return [];

    const input = {
      cidade: city,
      categoria,
      bairro,
      rua,
      descricao: "", // MVP: comparação de descrição ainda não usada no input
    };

    return demandasBase
      .map((d) => ({ d, score: computeDupScore(input, d) }))
      .filter((x) => x.score >= 0.55)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [triagemAtiva, city, categoria, bairro, rua, demandasBase]);

  /**
   * Auto-avanço:
   * - se a triagem rodou e não achou nada, seguimos direto como “novo”
   * - isso evita deixar o usuário “sem próximo passo”
   */
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

  // ---------------------------------------------------------------------------
  // 4.6) Modal de fotos (demanda sugerida)
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // 4.7) Evidências: seleção/remoção (novo/anexar)
  // ---------------------------------------------------------------------------

  /**
   * onPickFotos:
   * - junta fotos atuais + novas e limita a 5
   * - zera input file para permitir selecionar o mesmo arquivo novamente
   */
  function onPickFotos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const merged = [...fotosSelecionadas, ...files].slice(0, 5);
    setFotosSelecionadas(merged);
    e.target.value = "";
  }

  function removeFotoAt(idx) {
    setFotosSelecionadas((arr) => arr.filter((_, i) => i !== idx));
  }

  // ---------------------------------------------------------------------------
  // 4.8) Validações — sempre apontam o usuário para a seção correta via scrollTo()
  // ---------------------------------------------------------------------------

  function validarDescricaoObrigatoria() {
    // "novo" exige descrição
    if (!descricaoNovo.trim()) {
      showToast("error", "Descreva o problema para continuar.");
      scrollTo(descricaoRef, descricaoInputRef);
      return false;
    }
    return true;
  }

  function validarDescricaoParaAnexo() {
    // "anexar" exige justificar o valor das novas fotos
    if (!descricaoAnexo.trim()) {
      showToast("error", "Explique rapidamente por que estas novas fotos ajudam (o que mudou).");
      scrollTo(descricaoRef, descricaoInputRef);
      return false;
    }
    return true;
  }

  function validarEvidencias() {
    // novo/anexar exigem 2..5 fotos + aceite
    if (fotosSelecionadas.length < 2 || fotosSelecionadas.length > 5) {
      showToast("error", "Envie entre 2 e 5 fotos para continuar.");
      scrollTo(evidenciasRef, fotosPickRef);
      return false;
    }
    if (!aceiteResponsabilidade) {
      showToast("error", "Confirme o aviso de responsabilidade para continuar.");
      scrollTo(avisoRef);
      return false;
    }
    return true;
  }

  function validarDescricaoCurtaParaReforco() {
    // reforço exige frase curta + aceite (sem fotos)
    if (!descricaoReforco.trim()) {
      showToast("error", "Escreva uma frase curta para registrar o reforço.");
      scrollTo(descricaoRef, descricaoInputRef);
      return false;
    }
    if (!aceiteResponsabilidade) {
      showToast("error", "Confirme o aviso de responsabilidade para continuar.");
      scrollTo(avisoRef);
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // 4.9) Ações pós-triagem (define acaoEscolhida + demanda alvo)
  // ---------------------------------------------------------------------------

  /**
   * Importante:
   * - "reforcar": zera fotos, pois não serão usadas
   * - "anexar": mantém fotos (usuário pode ter começado a selecionar depois)
   * - "novo": limpa demandaAlvoId
   */
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

  // ---------------------------------------------------------------------------
  // 4.10) Reforço (sem fotos): incrementa impacto.confirmacoes
  // ---------------------------------------------------------------------------

  function confirmarReforco() {
    if (!demandaAlvoId) return;
    if (!validarDescricaoCurtaParaReforco()) return;

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

    // MVP: alert (no Cap. 4 podemos trocar por toast + navegação direta)
    alert(`MVP: reforço registrado para ${demandaAlvoId}.`);
    navigate(`/painel/${demandaAlvoId}`);
  }

  // =============================================================================
  // 5) Toast helpers — feedback não-bloqueante
  // =============================================================================

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

  // =============================================================================
  // 6) Submissões com fotos (anexar / novo) — compressão + limite + persistência
  // =============================================================================

  /**
   * confirmarAnexo:
   * - valida texto de anexo + evidências
   * - compressão e conversão (filesToBase64)
   * - verifica tamanho total em bytes (teto LocalStorage)
   * - persiste fotos concatenando com fotos existentes da demanda alvo
   */
  async function confirmarAnexo() {
    if (!demandaAlvoId) return;
    if (!validarDescricaoParaAnexo()) return;
    if (!validarEvidencias()) return;

    setIsProcessing(true);
    setProgress({ done: 0, total: fotosSelecionadas.length, fileName: "" });

    // garante que overlay apareça antes do trabalho pesado
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

      // soma bytes estimados para impor teto
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
        return {
          ...d,
          fotos: [...fotosAtuais, ...novasFotosBase64],
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

  /**
   * confirmarNovo:
   * - valida descrição + evidências
   * - compressão e conversão (filesToBase64)
   * - verifica tamanho total em bytes
   * - cria demanda nova via addDemanda e navega para o painel
   */
  async function confirmarNovo() {
    if (!validarDescricaoObrigatoria()) return;
    if (!validarEvidencias()) return;

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

      const criada = addDemanda({
        cidade: city,
        categoria,
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

  // ---------------------------------------------------------------------------
  // 4.11) Reset geral — usado por “Cancelar registro”
  // ---------------------------------------------------------------------------

  /**
   * resetTotal:
   * - volta o componente ao estado inicial
   * - útil para “recomeçar do zero” sem sair da tela
   */
  function resetTotal() {
    // Fase 1
    setCategoria("Iluminação");
    setBairro("");
    setRua("");
    setPontoReferencia("");

    // triagem / modo
    setTriagemAtiva(false);
    setAcaoEscolhida(null);
    setDemandaAlvoId(null);

    // fase 2
    setDescricaoNovo("");
    setDescricaoReforco("");
    setDescricaoAnexo("");
    setFotosSelecionadas([]);
    setAceiteResponsabilidade(false);

    // UI
    setIsProcessing(false);
    setProgress({ done: 0, total: 0, fileName: "" });
    setToast(null);

    // modal
    setModalOpen(false);
    setModalFotos([]);
    setModalIdx(0);
    setModalTitle("");
  }

  // =============================================================================
  // 7) Derived state — regras de habilitação dos botões e mensagens de bloqueio
  // =============================================================================

  const podeEnviarEvidencias =
    aceiteResponsabilidade &&
    fotosSelecionadas.length >= 2 &&
    fotosSelecionadas.length <= 5;

  const podeReforcar = aceiteResponsabilidade && descricaoReforco.trim().length > 0;

  const podeRegistrarNovo = podeEnviarEvidencias && descricaoNovo.trim().length > 0;

  const podeAnexar = podeEnviarEvidencias && descricaoAnexo.trim().length > 0;

  /**
   * motivoBloqueioAnexar:
   * - usado no title do botão, explicando por que ele está desabilitado
   * - (Cap. 4) aqui dá para refinar a copy e o timing do tooltip
   */
  const motivoBloqueioAnexar = !descricaoAnexo.trim()
    ? "Explique por que estas novas fotos ajudam."
    : !aceiteResponsabilidade
    ? "Confirme o aviso de responsabilidade."
    : fotosSelecionadas.length < 2
    ? "Envie pelo menos 2 fotos."
    : fotosSelecionadas.length > 5
    ? "Remova fotos para ficar no máximo de 5."
    : null;

  /**
   * mostrarPainelSugestoes:
   * - exibe o painel apenas se triagemAtiva e existe match
   * - mantém o painel visível enquanto usuário está em "anexar/reforcar",
   *   para ele lembrar qual demanda está tratando.
   */
  const mostrarPainelSugestoes =
    triagemAtiva &&
    sugestoes.length > 0 &&
    (acaoEscolhida === null || acaoEscolhida === "anexar" || acaoEscolhida === "reforcar");

  // =============================================================================
  // 8) Render — UI
  // =============================================================================

  return (
    <section className="flex-1 w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Toast fixo no topo: feedback leve sem interromper fluxo */}
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

        {/* Header / contexto da cidade */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold">
              Registrar um problema
            </h1>
            <p className="text-textsoft text-sm leading-relaxed">
              Cidade ativa:{" "}
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
            {/* Fase 1: Dados do problema + botão de triagem no mesmo box */}
            <div className="rounded-2xl border border-surfaceLight bg-surfaceLight/20 backdrop-blur-sm p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Dados do problema</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Categoria */}
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

                {/* Bairro */}
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

                {/* Rua */}
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

                {/* Ponto de referência */}
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

                {/* CTA Triagem */}
                <div className="md:col-span-3 flex items-end">
                  <PulseButton
                    onClick={iniciarTriagem}
                    disabled={!triagemHabilitada}
                    title={
                      triagemHabilitada
                        ? "Checar se já existe algo parecido"
                        : "Preencha Categoria, Bairro e Rua para habilitar"
                    }
                    intense={triagemHabilitada}
                    className={`w-full justify-center ${
                      triagemHabilitada ? "shadow-[0_0_0_1px_rgba(16,185,129,0.15)]" : ""
                    }`}
                  >
                    Verificar se já existe
                  </PulseButton>
                </div>
              </div>

              {!triagemAtiva ? (
                <p className="text-sm text-textmuted">
                  Preencha no mínimo{" "}
                  <span className="text-textmain">Categoria + Bairro + Rua</span> e
                  clique em{" "}
                  <span className="text-textmain">“Verificar se já existe”</span>.
                  Se encontrarmos um registro parecido, você decide:{" "}
                  <span className="text-textmain">reforçar</span>,{" "}
                  <span className="text-textmain">anexar</span> novas fotos, ou{" "}
                  <span className="text-textmain">registrar</span> como novo.
                </p>
              ) : null}
            </div>

            {/* Mensagem quando triagem rodou e não achou match */}
            {triagemAtiva && sugestoes.length === 0 && (
              <p className="text-sm text-textmuted">
                Não encontramos demandas parecidas. Pode seguir com a descrição e as evidências.
              </p>
            )}
          </>
        )}

        {/* FASE 1.5: Painel de sugestões (quando há match) */}
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

                  {/* Ações disponíveis apenas quando ainda não escolheu uma ação */}
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

        {/* FASE 2: Descrição + Evidências + Aviso (render apenas se acaoEscolhida !== null) */}
        {acaoEscolhida && (
          <>
            {/* Descrição: sempre aparece; muda título/placeholder/rows conforme ação */}
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

            {/* Evidências: apenas em "novo" e "anexar" */}
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
                    fotos={fotosSelecionadas.map((file) => URL.createObjectURL(file))}
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

            {/* Aviso: sempre presente (novo/anexar/reforçar) */}
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

              {/* CTA final varia conforme ação escolhida */}
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

              {/* Contexto extra quando estiver em modo "anexar" */}
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

      {/* Modal: fotos existentes nas sugestões */}
      <ModalFotos
        open={modalOpen}
        fotos={modalFotos}
        index={modalIdx}
        onClose={closeModal}
        onPrev={prevModal}
        onNext={nextModal}
        title={modalTitle}
      />

      {/* Overlay: processamento de fotos */}
      <ProcessingOverlay open={isProcessing} progress={progress} />
    </section>
  );
}
