// src/services/demandasActions.js

import { addDemanda, getDemandas, setDemandas } from "../storage/demandasStorage";
import {
  MAX_FOTOS_TOTAL_BYTES,
  estimateBase64Bytes,
  filesToBase64,
  formatBytes,
} from "../utils/photosPipeline";

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
      role: parsed.role || null,
    };
  } catch {
    return null;
  }
}

/**
 * Garante que a demanda tenha o shape expandido necessário
 * para mobilização e atualizações, sem quebrar demandas antigas.
 */
export function normalizarDemanda(demanda) {
  if (!demanda) return demanda;

  const createdAtBase =
    demanda.ultimaMovimentacaoEm ||
    demanda.createdAt ||
    new Date().toISOString();

  const reforcos = Array.isArray(demanda.reforcos) ? demanda.reforcos : [];

  const atualizacoes = Array.isArray(demanda.atualizacoes)
    ? demanda.atualizacoes
    : [];

  const ultimoReforco = reforcos.length
    ? reforcos[reforcos.length - 1]
    : null;

  return {
    ...demanda,

    reforcos,
    totalReforcos:
      typeof demanda.totalReforcos === "number"
        ? demanda.totalReforcos
        : reforcos.length,

    ultimoReforcoEm:
      demanda.ultimoReforcoEm ||
      ultimoReforco?.createdAt ||
      null,

    atualizacoes,
    totalAtualizacoes:
      typeof demanda.totalAtualizacoes === "number"
        ? demanda.totalAtualizacoes
        : atualizacoes.length,

    ultimaMovimentacaoEm: demanda.ultimaMovimentacaoEm || createdAtBase,
  };
}

/* normaliza uma lista de demandas, garantindo o shape expandido necessário */
export function normalizarDemandas(demandas = []) {
  return demandas.map(normalizarDemanda);
}

/* Reforça uma demanda, registrando apoio de outro cidadão. */
export function reforcarDemanda({ demandaAlvoId }) {
  const authUser = getAuthUser();

  const autorId = authUser?.id || null;
  const autorNome = authUser?.nome || authUser?.email || "Usuário";

  if (!autorId) {
    return {
      ok: false,
      reason: "AUTH",
      message: "Faça login para reforçar esta demanda.",
    };
  }

  const all = normalizarDemandas(getDemandas());
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  let demandaAtualizada = null;

  const next = all.map((d) => {
    if (d.id !== demandaAlvoId) return d;

    const demanda = normalizarDemanda(d);
    const donoDaDemanda = demanda.autorId || demanda.userId || null;

    if (donoDaDemanda === autorId) {
      demandaAtualizada = {
        ok: false,
        reason: "AUTOR",
        message: "Você não pode reforçar a própria demanda.",
      };
      return d;
    }

    const jaReforcou =
      Array.isArray(demanda.reforcos) &&
      demanda.reforcos.some((item) => item?.autorId === autorId);

    if (jaReforcou) {
      demandaAtualizada = {
        ok: false,
        reason: "DUPLICADO",
        message: "Você já reforçou esta demanda.",
      };
      return d;
    }

    const novoReforco = {
      id: `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      demandaId: demanda.id,
      autorId,
      autorNome,
      createdAt: now,
    };

    const reforcos = [...demanda.reforcos, novoReforco];
    const totalReforcos = reforcos.length;

    const impactoAnterior = demanda.impacto?.confirmacoes ?? 0;

    const historicoAtual = Array.isArray(demanda.historico)
      ? demanda.historico
      : [];

    const atualizado = {
      ...demanda,
      reforcos,
      totalReforcos,
      ultimoReforcoEm: now,
      ultimaMovimentacaoEm: now,

      impacto: {
        confirmacoes: Math.max(impactoAnterior, 1) + 1,
        ultimaConfirmacao: today,
      },

      historico: [
        ...historicoAtual,
        {
          data: today,
          tipo: "sistema",
          evento: "Um cidadão reforçou esta demanda.",
        },
      ],
    };

    demandaAtualizada = {
      ok: true,
      demanda: atualizado,
    };

    return atualizado;
  });

  if (!demandaAtualizada) {
    return {
      ok: false,
      reason: "NAO_ENCONTRADA",
      message: "Não foi possível localizar a demanda.",
    };
  }

  if (!demandaAtualizada.ok) {
    return demandaAtualizada;
  }

  setDemandas(next);

  return {
    ok: true,
    demanda: demandaAtualizada.demanda,
  };
}

/* Cria uma nova demanda, adicionando à lista existente. */
export async function criarDemanda({
  cityEmFoco,
  cidadeRelatoKey,
  enderecoDetectado,
  categoria,
  tempoPercebido,
  localRelato,
  fotosSelecionadas,
  fotosMeta,
  pontoReferencia,
  descricao,
  onProgress,
}) {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const authUser = getAuthUser();
  const autorId = authUser?.id || "cidadao_001";
  const autorNome = authUser?.nome || authUser?.email || "Usuário";

  const fotosBase64 = await filesToBase64(fotosSelecionadas, {
    maxW: 1280,
    maxH: 1280,
    quality: 0.72,
    mime: "image/jpeg",
    onProgress,
  });

  if (fotosBase64.length !== fotosSelecionadas.length) {
    return {
      ok: false,
      reason: "CONVERSAO",
      message:
        "Não foi possível processar todas as fotos selecionadas. Tente novamente com imagens originais da câmera.",
    };
  }

  if (fotosBase64.length < 1 || fotosBase64.length > 3) {
    return {
      ok: false,
      reason: "QTD_FOTOS",
      message: "Após o processamento, foi necessário manter entre 1 e 3 fotos válidas.",
    };
  }

  const totalBytes = fotosBase64.reduce((acc, x) => acc + estimateBase64Bytes(x), 0);

  if (totalBytes > MAX_FOTOS_TOTAL_BYTES) {
    return {
      ok: false,
      reason: "PESO",
      totalBytes,
      message: `As fotos ficaram muito pesadas (${formatBytes(totalBytes)}). Tente menos fotos ou imagens menores.`,
    };
  }

  const cidadeRelatoLabel = (enderecoDetectado?.cidade || "").trim();
  const estadoRelatoDetectado = (enderecoDetectado?.estado || "").trim();

  const criada = addDemanda(
    normalizarDemanda({
      cidadeEmFoco: cityEmFoco,
      cidadeRelato: cidadeRelatoKey,
      cidadeRelatoLabel,
      estadoRelato: estadoRelatoDetectado,
      cidade: cidadeRelatoKey, // compat

      enderecoDetectado: enderecoDetectado
        ? {
            ...enderecoDetectado,
            lat: localRelato?.lat ?? null,
            lng: localRelato?.lng ?? null,
          }
        : null,

      categoria,
      tempoPercebido,
      localRelato,
      fotosMeta,
      pontoReferencia: pontoReferencia?.trim() || "",
      descricao: (descricao || "").trim(),
      fotos: fotosBase64,
      impacto: { confirmacoes: 1, ultimaConfirmacao: today },
      status: "Em análise",
      userId: autorId,
      autorId,
      autorNome,

      // Novo shape expandido
      reforcos: [],
      totalReforcos: 0,
      ultimoReforcoEm: null,

      atualizacoes: [],
      totalAtualizacoes: 0,

      ultimaMovimentacaoEm: now,
    })
  );

  return { ok: true, criada };
}

