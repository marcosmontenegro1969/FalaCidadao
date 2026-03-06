// src/utils/normalizeCity.js

export function toCityKey(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\s-]/g, "") // remove pontuação
    .replace(/\s+/g, " ")
    .trim();
}

export const cityKeyAliases = {
  "jaboatao dos guararapes": "jaboatao",
  "jaboatao": "jaboatao",
  "cidade do recife": "recife",
  "recife": "recife",
  "olinda": "olinda",
};

export function normalizeCityKey(raw = "", fallbackKey = "") {
  const k = toCityKey(raw || "");
  return cityKeyAliases[k] || k || fallbackKey;
}