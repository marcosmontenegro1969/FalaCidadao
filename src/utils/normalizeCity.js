// src/utils/normalizeCity.js

export function toCityKey(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[/.-]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const cityKeyAliases = {
  "jaboatao dos guararapes": "jaboatao",
  "jaboatao dos guararapes pe": "jaboatao",
  "jaboatao": "jaboatao",
  "jaboatao pe": "jaboatao",
  "cidade do recife": "recife",
  "recife": "recife",
  "recife pe": "recife",
  "olinda": "olinda",
  "olinda pe": "olinda",
};

export function normalizeCityKey(raw = "", fallbackKey = "") {
  const k = toCityKey(raw || "");
  return cityKeyAliases[k] || k || fallbackKey;
}