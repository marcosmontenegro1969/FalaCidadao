// src/mock/demandas.js

export const MOCK_DEMANDAS_EXISTENTES = [
  {
    id: "DMD-2025-0001",

    // NOVO (modelo atual)
    cidadeEmFoco: "recife",
    cidadeRelato: "recife",
    cidadeRelatoLabel: "Recife",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Rua X",
      bairro: "Boa Viagem",
      cidade: "Recife",
      estado: "PE",
      lat: -8.1266,
      lng: -34.9007,
    },

    // LEGADO (compat temporária)
    cidade: "Recife",
    bairro: "Boa Viagem",
    rua: "Rua X",

    categoria: "Iluminação",
    descricao: "Poste apagado há 3 dias na Rua X",
    pontoReferencia: "Próximo ao supermercado ABC",
    status: "Em análise",
    createdAt: "2025-12-12",

    userId: "jose@gmail.com",
    autorId: "jose@gmail.com",
    autorNome: "JOSE",

    fotos: [
      "/mock/DMD-2025-0001-1.jpg",
      "/mock/DMD-2025-0001-2.jpg",
      "/mock/DMD-2025-0001-3.jpg",
    ],
    impacto: { confirmacoes: 35, ultimaConfirmacao: "2025-12-16" },
  },

  {
    id: "DMD-2025-0004",

    cidadeEmFoco: "recife",
    cidadeRelato: "recife",
    cidadeRelatoLabel: "Recife",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Rua Y",
      bairro: "Casa Forte",
      cidade: "Recife",
      estado: "PE",
      lat: -8.0316,
      lng: -34.9178,
    },

    cidade: "Recife",
    bairro: "Casa Forte",
    rua: "Rua Y",

    categoria: "Outros",
    descricao: "Árvore caída parcialmente obstruindo a calçada.",
    pontoReferencia: "Próximo ao ponto de ônibus na Rua Y",
    status: "Em andamento",
    createdAt: "2025-12-11",

    userId: "maria@gmail.com",
    autorId: "maria@gmail.com",
    autorNome: "MARIA",

    fotos: [
      "/mock/DMD-2025-0004-1.jpg",
      "/mock/DMD-2025-0004-2.jpg",
      "/mock/DMD-2025-0004-3.jpg",
    ],
    impacto: { confirmacoes: 12, ultimaConfirmacao: "2025-12-15" },
  },

  {
    id: "DMD-2025-0005",

    cidadeEmFoco: "recife",
    cidadeRelato: "recife",
    cidadeRelatoLabel: "Recife",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Av. Sul Governador Cid Sampaio",
      bairro: "Afogados",
      cidade: "Recife",
      estado: "PE",
      lat: -8.0778,
      lng: -34.9189,
    },

    cidade: "Recife",
    bairro: "Afogados",
    rua: "Av. Sul Governador Cid Sampaio",

    categoria: "Via pública",
    descricao:
      "Buraco profundo na faixa da direita, causando desvios bruscos e risco de acidentes.",
    pontoReferencia: "Próximo ao semáforo da Av. Sul Governador Cid Sampaio",
    status: "Em análise",
    createdAt: "2025-12-16",

    userId: "flavio@gmail.com",
    autorId: "flavio@gmail.com",
    autorNome: "FLAVIO",

    fotos: ["/mock/DMD-2025-0005-1.jpg", "/mock/DMD-2025-0005-2.jpg"],
    impacto: { confirmacoes: 8, ultimaConfirmacao: "2025-12-17" },
  },

  {
    id: "DMD-2025-0006",

    cidadeEmFoco: "recife",
    cidadeRelato: "recife",
    cidadeRelatoLabel: "Recife",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Rua do Futuro II",
      bairro: "Ibura",
      cidade: "Recife",
      estado: "PE",
      lat: -8.1019,
      lng: -34.9518,
    },

    cidade: "Recife",
    bairro: "Ibura",
    rua: "Rua do Futuro II",

    categoria: "Limpeza urbana",
    descricao:
      "Acúmulo frequente de lixo e entulho em terreno baldio, com mau cheiro e presença de animais.",
    pontoReferencia: "Entre as ruas A e B no Ibura",
    status: "Em andamento",
    createdAt: "2025-12-14",

    userId: "jose@gmail.com",
    autorId: "jose@gmail.com",
    autorNome: "JOSE",

    fotos: [
      "/mock/DMD-2025-0006-1.jpg",
      "/mock/DMD-2025-0006-2.jpg",
      "/mock/DMD-2025-0006-3.jpg",
    ],
    impacto: { confirmacoes: 21, ultimaConfirmacao: "2025-12-17" },
  },

  {
    id: "DMD-2025-0007",

    cidadeEmFoco: "jaboatao",
    cidadeRelato: "jaboatao",
    cidadeRelatoLabel: "Jaboatão dos Guararapes",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Av. Ayrton Senna",
      bairro: "Piedade",
      cidade: "Jaboatão dos Guararapes",
      estado: "PE",
      lat: -8.1684,
      lng: -34.9186,
    },

    cidade: "Jaboatão dos Guararapes",
    bairro: "Piedade",
    rua: "Av. Ayrton Senna",

    categoria: "Sinalização",
    descricao:
      "Faixa de pedestres apagada em frente à escola, dificultando a travessia com segurança.",
    pontoReferencia: "Em frente à Escola Municipal Piedade",
    status: "Resolvido",
    createdAt: "2025-12-05",

    userId: "maria@gmail.com",
    autorId: "maria@gmail.com",
    autorNome: "MARIA",

    fotos: ["/mock/DMD-2025-0007-1.jpg", "/mock/DMD-2025-0007-2.jpg"],
    impacto: { confirmacoes: 15, ultimaConfirmacao: "2025-12-10" },
  },

  {
    id: "DMD-2025-0008",

    cidadeEmFoco: "olinda",
    cidadeRelato: "olinda",
    cidadeRelatoLabel: "Olinda",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Rua do Sol",
      bairro: "Carmo",
      cidade: "Olinda",
      estado: "PE",
      lat: -8.0134,
      lng: -34.8553,
    },
    localRelato: {
      lat: -8.0134,
      lng: -34.8553,
      source: "mock",
    },

    cidade: "Olinda",
    bairro: "Carmo",
    rua: "Rua do Sol",

    categoria: "Limpeza urbana",
    descricao:
      "Acúmulo de lixo próximo a área de circulação de pedestres, causando mau cheiro e risco à saúde.",
    pontoReferencia: "Próximo ao Mercado da Ribeira",
    status: "Em análise",
    createdAt: "2025-12-18",

    userId: "lucas@gmail.com",
    autorId: "lucas@gmail.com",
    autorNome: "LUCAS",

    fotos: [
      "/mock/DMD-2025-0008-1.jpg",
      "/mock/DMD-2025-0008-2.jpg",
    ],
    impacto: { confirmacoes: 6, ultimaConfirmacao: "2025-12-18" },
  },  
  {
    id: "DMD-2025-0009",

    cidadeEmFoco: "jaboatao",
    cidadeRelato: "jaboatao",
    cidadeRelatoLabel: "Jaboatão dos Guararapes",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Rua Professor Mário Ramos",
      bairro: "Piedade",
      cidade: "Jaboatão dos Guararapes",
      estado: "PE",
      lat: -8.1762,
      lng: -34.9218,
    },
    localRelato: {
      lat: -8.1762,
      lng: -34.9218,
      source: "mock",
    },

    cidade: "Jaboatão dos Guararapes",
    bairro: "Piedade",
    rua: "Rua Professor Mário Ramos",

    categoria: "Segurança",
    descricao:
      "Moradores relatam assaltos frequentes neste trecho, especialmente no início da noite, gerando sensação de insegurança para pedestres.",
    pontoReferencia: "Próximo a uma parada de ônibus em Piedade",
    status: "Em análise",
    createdAt: "2025-12-19",

    userId: "maria@gmail.com",
    autorId: "maria@gmail.com",
    autorNome: "MARIA",

    fotos: [
      "/mock/DMD-2025-0009-1.jpg",
      "/mock/DMD-2025-0009-2.jpg",
    ],

    impacto: { confirmacoes: 4, ultimaConfirmacao: "2025-12-20" },

    reforcos: [],
    totalReforcos: 0,
    ultimoReforcoEm: null,

    atualizacoes: [],
    totalAtualizacoes: 0,

    ultimaMovimentacaoEm: "2025-12-19T18:30:00.000Z",
  },  
];