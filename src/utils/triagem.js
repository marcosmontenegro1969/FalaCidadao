// src/utils/triagem.js

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

export function computeDupScore({ cidade, categoria, bairro, rua, descricao }, demanda) {
  if (!cidade || demanda.cidade !== cidade) return 0;

  let score = 0;

  if (categoria && demanda.categoria === categoria) score += 0.45;

  if (bairro && normalizeText(demanda.bairro) === normalizeText(bairro)) score += 0.2;

  if (rua && demanda.rua && normalizeText(demanda.rua).includes(normalizeText(rua))) {
    score += 0.15;
  }

  const sim = jaccard(tokenize(descricao), tokenize(demanda.descricao));
  score += Math.min(0.2, sim * 0.2);

  return score;
}