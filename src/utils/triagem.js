// src/utils/triagem.js
import { normalizeCityKey } from "./normalizeCity";

function normalizeText(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function jaccard(aTokens = [], bTokens = []) {
  const A = new Set(aTokens);
  const B = new Set(bTokens);
  if (A.size === 0 && B.size === 0) return 0;

  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;

  const uni = A.size + B.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

function getCoords(d) {
  const lat = d?.localRelato?.lat ?? d?.enderecoDetectado?.lat ?? d?.lat ?? null;
  const lng = d?.localRelato?.lng ?? d?.enderecoDetectado?.lng ?? d?.lng ?? null;
  return (typeof lat === "number" && typeof lng === "number") ? { lat, lng } : null;
}

export function computeDupScore({ cidade, categoria, bairro, rua, descricao, lat, lng }, demanda) {
  const demandaCityRaw =
    demanda?.cidadeRelato ||
    demanda?.cidade ||
    demanda?.enderecoDetectado?.cidade ||
    demanda?.cidadeRelatoLabel ||
    "";

  const demandaCityKey = normalizeCityKey(demandaCityRaw);
  const inputCityKey = normalizeCityKey(cidade || "");

  if (!inputCityKey || demandaCityKey !== inputCityKey) return 0;

  let score = 0;

  // 1) Coordenadas (mais forte)
  const a = (typeof lat === "number" && typeof lng === "number") ? { lat, lng } : null;
  const b = getCoords(demanda);

  if (a && b) {
    const dist = distanciaMetros(a.lat, a.lng, b.lat, b.lng);

    // mesmos arredores => alto
    if (dist <= 30) score += 0.60;
    else if (dist <= 80) score += 0.40;
    else if (dist <= 150) score += 0.25;
  }

  // 2) Endereço (preferir enderecoDetectado, fallback legado)
  const demandaBairro = (demanda?.enderecoDetectado?.bairro || demanda?.bairro || "").trim();
  const demandaRua = (demanda?.enderecoDetectado?.rua || demanda?.rua || "").trim();

  const inputBairro = (bairro || "").trim();
  const inputRua = (rua || "").trim();

  // 3) Categoria (peso menor agora)
  if (categoria && demanda?.categoria === categoria) score += 0.25;

  // 4) Bairro
  if (inputBairro && demandaBairro && normalizeText(demandaBairro) === normalizeText(inputBairro)) {
    score += 0.10;
  }

  // 5) Rua
  if (inputRua && demandaRua && normalizeText(demandaRua).includes(normalizeText(inputRua))) {
    score += 0.05;
  }

  // 6) Texto (bem leve, porque no input você ainda manda descricao "")
  const sim = jaccard(tokenize(descricao || ""), tokenize(demanda?.descricao || ""));
  score += Math.min(0.05, sim * 0.05);

  return Math.min(1, score);
}