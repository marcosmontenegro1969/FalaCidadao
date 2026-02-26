// src/storage/demandasStorage.js
import { MOCK_DEMANDAS_EXISTENTES } from "../mock/demandas.js";

const LS_KEY = "falaCidadao:demandas";
const LS_SEEDED_KEY = "falaCidadao:demandas:seeded";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch {
    return fallback;
  }
}

function isoDateOnly(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

// Gera ID no padrão escolhido: DMD-YYYY-MMDD-RAND(4)
function nextId(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rnd = Math.floor(Math.random() * 9000) + 1000;
  return `DMD-${yyyy}-${mm}${dd}-${rnd}`;
}

// Evita colisão (baixa chance, mas é bom deixar “blindado”)
function generateUniqueId(existingIds, date = new Date()) {
  let id = nextId(date);
  let tries = 0;
  while (existingIds.has(id) && tries < 10) {
    id = nextId(date);
    tries++;
  }
  return id;
}

// Padroniza mocks antigos com ID sequencial para o formato data+sufixo
function normalizeSeedDemandas(mocks) {
  const existingIds = new Set();

  return mocks.map((d) => {
    // Usa createdAt como referência de data (se existir), senão hoje
    const baseDate = d.createdAt ? new Date(`${d.createdAt}T12:00:00`) : new Date();
    const id = generateUniqueId(existingIds, baseDate);
    existingIds.add(id);

    // Se não houver histórico, podemos deixar vazio no seed
    // (ou criar um histórico mínimo também; abaixo eu opto por criar)
    const createdAt = d.createdAt ?? isoDateOnly(baseDate);

    const historico =
      Array.isArray(d.historico) && d.historico.length
        ? d.historico
        : [
            { data: createdAt, tipo: "sistema", evento: "Demanda registrada." },
            { data: createdAt, tipo: "sistema", evento: "Encaminhada para triagem Fala Cidadão (MVP)." },
          ];

    const cidadeRelato = d.cidadeRelato ?? d.cidade ?? "default";
    const cidadeEmFoco = d.cidadeEmFoco ?? d.cidade ?? cidadeRelato ?? "default";

    return {
      ...d,
      cidadeRelato,
      cidadeEmFoco,

      // compat (por enquanto): mantém 'cidade' apontando para a cidade do relato
      cidade: cidadeRelato,

      id,
      createdAt,
      status: d.status ?? "Em análise",
      fotos: Array.isArray(d.fotos) ? d.fotos : [],
      impacto: d.impacto ?? { confirmacoes: 0, ultimaConfirmacao: null },
      historico,
    };
  });
}

export function seedDemandasIfNeeded() {
  const alreadySeeded = localStorage.getItem(LS_SEEDED_KEY) === "1";
  if (alreadySeeded) return;

  const normalized = normalizeSeedDemandas(MOCK_DEMANDAS_EXISTENTES);

  localStorage.setItem(LS_KEY, JSON.stringify(normalized));
  localStorage.setItem(LS_SEEDED_KEY, "1");
}

export function getDemandas() {
  seedDemandasIfNeeded();
  return safeParse(localStorage.getItem(LS_KEY), []);
}

export function setDemandas(next) {
  localStorage.setItem(LS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("falaCidadao:demandas_updated"));
}

export function addDemanda(partial) {
  const current = getDemandas();
  const existingIds = new Set(current.map((d) => d.id));

  const createdAt = isoDateOnly(new Date());
  const id = generateUniqueId(existingIds, new Date());

  const historicoInicial = [
    { data: createdAt, tipo: "sistema", evento: "Demanda registrada." },
    { data: createdAt, tipo: "sistema", evento: "Encaminhada para triagem Fala Cidadão (MVP)." },
  ];

  const orgaoDefault = {
    nome: "Triagem Fala Cidadão (MVP)",
    email: null,
  };

  const cidadeRelato = partial.cidadeRelato ?? partial.cidade ?? "default";
  const cidadeEmFoco = partial.cidadeEmFoco ?? partial.cidade ?? cidadeRelato ?? "default";
  
  const demanda = {
    ...partial,

    cidadeRelato,
    cidadeEmFoco,

    // compat (por enquanto)
    cidade: cidadeRelato,

    id,
    status: "Em análise",
    createdAt,

    fotos: Array.isArray(partial.fotos) ? partial.fotos : [],
    impacto: partial.impacto ?? { confirmacoes: 0, ultimaConfirmacao: null },

    orgao: partial.orgao ?? orgaoDefault,
    historico: Array.isArray(partial.historico) && partial.historico.length
      ? partial.historico
      : historicoInicial,
  };

  const next = [demanda, ...current];
  setDemandas(next);
  return demanda;
}
