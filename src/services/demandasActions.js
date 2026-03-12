// src/services/demandasActions.js

import { addDemanda, getDemandas, setDemandas } from "../storage/demandasStorage";
import {
  MAX_FOTOS_TOTAL_BYTES,
  estimateBase64Bytes,
  filesToBase64,
  formatBytes,
} from "../utils/photosPipeline";

/**
 * Reforça impacto (+1 confirmação) em uma demanda existente.
 */
export function reforcarDemanda({ demandaAlvoId }) {
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
}

// Cria uma nova demanda.
export async function criarDemanda({
  cityEmFoco,
  cidadeRelatoKey,
  enderecoDetectado,
  categoria,
  localRelato,
  fotosSelecionadas,
  fotosMeta,
  pontoReferencia,
  descricao,
  onProgress,
}) {
  const today = new Date().toISOString().slice(0, 10);

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

  const criada = addDemanda({
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
    localRelato,
    fotosMeta,
    pontoReferencia: pontoReferencia?.trim() || "",
    descricao: (descricao || "").trim(),
    fotos: fotosBase64,
    impacto: { confirmacoes: 1, ultimaConfirmacao: today },
    status: "Em análise",
    userId: "cidadao_001",
  });

  return { ok: true, criada };
}