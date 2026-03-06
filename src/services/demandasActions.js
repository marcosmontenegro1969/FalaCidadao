// src/services/demandasActions.js

import { addDemanda, getDemandas, setDemandas } from "../storage/demandasStorage";
import { distanciaMetros } from "../utils/exifGps";
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

/**
 * Anexa novas evidências (fotos) a uma demanda existente.
 */
export async function anexarEvidencias({
  demandaAlvoId,
  fotosSelecionadas,
  fotosMeta,
  localRelato,
  limiteDistanciaMetros,
  onProgress,
}) {
  const allAntes = getDemandas();
  const demandaAlvo = allAntes.find((d) => d.id === demandaAlvoId);
  const fotosAtuais = Array.isArray(demandaAlvo?.fotos) ? demandaAlvo.fotos : [];

  if (fotosAtuais.length >= 5) {
    return {
      ok: false,
      reason: "LIMITE",
      message: "Essa ocorrência já atingiu o limite máximo de 5 fotos.",
    };
  }

  const espacoRestante = 5 - fotosAtuais.length;

  if (fotosSelecionadas.length > espacoRestante) {
    return {
      ok: false,
      reason: "LIMITE",
      message: `Você pode anexar no máximo ${espacoRestante} foto(s) a esta ocorrência. Limite total: 5 fotos.`,
    };
  }

  if (demandaAlvo?.localRelato?.lat && demandaAlvo?.localRelato?.lng) {
    const dist = distanciaMetros(
      demandaAlvo.localRelato.lat,
      demandaAlvo.localRelato.lng,
      localRelato.lat,
      localRelato.lng
    );

    if (dist > limiteDistanciaMetros) {
      return {
        ok: false,
        reason: "DISTANTE",
        dist,
      };
    }
  }

  const novasFotosBase64 = await filesToBase64(fotosSelecionadas, {
    maxW: 1280,
    maxH: 1280,
    quality: 0.72,
    mime: "image/jpeg",
    onProgress,
  });

  const totalBytes = novasFotosBase64.reduce((acc, x) => acc + estimateBase64Bytes(x), 0);

  if (totalBytes > MAX_FOTOS_TOTAL_BYTES) {
    return {
      ok: false,
      reason: "PESO",
      totalBytes,
      message: `As fotos ficaram muito pesadas (${formatBytes(totalBytes)}). Tente menos fotos ou imagens menores.`,
    };
  }

  const all = getDemandas();

  const next = all.map((d) => {
    if (d.id !== demandaAlvoId) return d;

    const fotosExistentes = Array.isArray(d.fotos) ? d.fotos : [];
    const metasAtuais = Array.isArray(d.fotosMeta) ? d.fotosMeta : [];

    return {
      ...d,
      fotos: [...fotosExistentes, ...novasFotosBase64],
      fotosMeta: [...metasAtuais, ...fotosMeta],
    };
  });

  setDemandas(next);

  return { ok: true };
}

/**
 * Cria uma nova demanda.
 */
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