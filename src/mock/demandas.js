// src/mock/demandas.js
export const MOCK_DEMANDAS_EXISTENTES = [
  {
    id: "DMD-2025-0001",
    cidade: "recife",
    bairro: "Boa Viagem",
    rua: "Rua X",
    categoria: "Iluminação",
    descricao: "Poste apagado há 3 dias na Rua X",
    pontoReferencia: "Próximo ao supermercado ABC",
    status: "Em análise",
    createdAt: "2025-12-12",
    userId: "cidadao_001",
    fotos: [
      "/mock/DMD-2025-0001-1.jpg",
      "/mock/DMD-2025-0001-2.jpg",
      "/mock/DMD-2025-0001-3.jpg",
    ],
    impacto: { confirmacoes: 35, ultimaConfirmacao: "2025-12-16" },
  },
  {
    id: "DMD-2025-0004",
    cidade: "recife",
    bairro: "Casa Forte",
    rua: "Rua Y",
    categoria: "Outros",
    descricao: "Árvore caída parcialmente obstruindo a calçada.",
    pontoReferencia: "Próximo ao ponto de ônibus na Rua Y",
    status: "Em andamento",
    createdAt: "2025-12-11",
    userId: "cidadao_002",
    fotos: [
      "/mock/DMD-2025-0004-1.jpg",
      "/mock/DMD-2025-0004-2.jpg",
      "/mock/DMD-2025-0004-3.jpg",
    ],
    impacto: { confirmacoes: 12, ultimaConfirmacao: "2025-12-15" },
  },
  {
    id: "DMD-2025-0005",
    cidade: "recife",
    bairro: "Afogados",
    rua: "Av. Sul Governador Cid Sampaio",
    categoria: "Via pública",
    descricao: "Buraco profundo na faixa da direita, causando desvios bruscos e risco de acidentes.",
    pontoReferencia: "Próximo ao semáforo da Av. Sul Governador Cid Sampaio",
    status: "Em análise",
    createdAt: "2025-12-16",
    userId: "cidadao_001",
    fotos: [
      "/mock/DMD-2025-0005-1.jpg",
      "/mock/DMD-2025-0005-2.jpg"
    ],
    impacto: { confirmacoes: 8, ultimaConfirmacao: "2025-12-17" }
  },
  {
    id: "DMD-2025-0006",
    cidade: "recife",
    bairro: "Ibura",
    rua: "Rua do Futuro II",
    categoria: "Limpeza urbana",
    descricao: "Acúmulo frequente de lixo e entulho em terreno baldio, com mau cheiro e presença de animais.",
    pontoReferencia: "Entre as ruas A e B no Ibura",
    status: "Em andamento",
    createdAt: "2025-12-14",
    userId: "cidadao_003",
    fotos: [
      "/mock/DMD-2025-0006-1.jpg",
      "/mock/DMD-2025-0006-2.jpg",
      "/mock/DMD-2025-0006-3.jpg"
    ],
    impacto: { confirmacoes: 21, ultimaConfirmacao: "2025-12-17" }
  },
  {
    id: "DMD-2025-0007",
    cidade: "jaboatao",
    bairro: "Piedade",
    rua: "Av. Ayrton Senna",
    categoria: "Sinalização",
    descricao: "Faixa de pedestres apagada em frente à escola, dificultando a travessia com segurança.",
    pontoReferencia: "Em frente à Escola Municipal Piedade",
    status: "Resolvido",
    createdAt: "2025-12-05",
    userId: "cidadao_001",
    fotos: [
      "/mock/DMD-2025-0007-1.jpg",
      "/mock/DMD-2025-0007-2.jpg"
    ],
    impacto: { confirmacoes: 15, ultimaConfirmacao: "2025-12-10" }
  }
];
