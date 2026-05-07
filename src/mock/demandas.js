// src/mock/demandas.js

export const MOCK_DEMANDAS_EXISTENTES = [
  {
    id: "DMD-2025-1216-0001",

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
    status: "Resposta contestada",
    createdAt: "2025-12-12",
    orgao: {
      nome: "EMLURB",
      sigla: "EMLURB",
      descricao: "Autarquia responsável por limpeza urbana, manutenção e serviços urbanos no Recife",
      cidade: "Recife/PE",
      email: "atendimento@recife.pe.gov.br",
    },

    userId: "jose@gmail.com",
    autorId: "jose@gmail.com",
    autorNome: "JOSE",

    fotos: [
      "/mock/DMD-2025-1212-0001-1.jpg",
      "/mock/DMD-2025-1212-0001-2.jpg",
      "/mock/DMD-2025-1212-0001-3.jpg",
    ],
    impacto: { confirmacoes: 35, ultimaConfirmacao: "2025-12-16" },
    respostaResponsavel: [
      {
        data: "2025-12-14",
        protocolo: "FC-RESP-2025-0001",
        responsavel: "EMLURB",
        tipoResponsavel: "responsavel",
        canal: "simulado",
        rodada: 1,
        texto:
          "Informamos que a demanda foi recebida e será avaliada pela equipe responsável para verificação das providências cabíveis.",
        statusCidadao: "contestada",
        avaliadaEm: "2025-12-15T09:30:00.000Z",
        contestacao: {
          texto:
            "A resposta não informa prazo nem providência concreta para resolver o problema de iluminação no local.",
          data: "2025-12-15T09:30:00.000Z",
          autorId: "jose@gmail.com",
          autorNome: "JOSE",
        },
      },
    ],    
    historico: [
      {
        data: "2025-12-12",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-13",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
      {
        data: "2025-12-14",
        tipo: "responsavel",
        evento:
          "EMLURB informou que a demanda foi recebida e será avaliada pela equipe responsável para verificação das providências cabíveis.",
      },
      {
        data: "2025-12-15",
        tipo: "cidadao",
        evento:
          "Resposta contestada pelo cidadão. Aguardando nova manifestação do responsável.",
      },
    ],    
  },

  {
    id: "DMD-2025-1211-0004",

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
    status: "Encaminhada",
    createdAt: "2025-12-11",
    orgao: {
      nome: "EMLURB",
      sigla: "EMLURB",
      descricao: "Autarquia responsável por limpeza urbana, manutenção e serviços urbanos no Recife",
      cidade: "Recife/PE",
      email: "atendimento@recife.pe.gov.br",
    },    

    userId: "maria@gmail.com",
    autorId: "maria@gmail.com",
    autorNome: "MARIA",

    fotos: [
      "/mock/DMD-2025-1211-0004-1.jpg",
      "/mock/DMD-2025-1211-0004-2.jpg",
      "/mock/DMD-2025-1211-0004-3.jpg",
    ],
    impacto: { confirmacoes: 12, ultimaConfirmacao: "2025-12-15" },
    historico: [
      {
        data: "2025-12-11",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-12",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
    ],    
  },

  {
    id: "DMD-2025-1216-0005",

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
    status: "Resolvida",
    createdAt: "2025-12-16",
    orgao: {
      nome: "Secretaria de Infraestrutura Urbana",
      sigla: "SEINFRA",
      descricao: "Responsável por manutenção viária e infraestrutura urbana no Recife",
      cidade: "Recife/PE",
      email: "infraestrutura@recife.pe.gov.br",
    },    
    userId: "flavio@gmail.com",
    autorId: "flavio@gmail.com",
    autorNome: "FLAVIO",

    fotos: ["/mock/DMD-2025-1216-0005-1.jpg", "/mock/DMD-2025-1216-0005-2.jpg"],
    impacto: { confirmacoes: 8, ultimaConfirmacao: "2025-12-17" },
    respostaResponsavel: [
      {
        data: "2025-12-17",
        protocolo: "FC-RESP-2025-0005",
        responsavel: "Secretaria de Infraestrutura Urbana",
        tipoResponsavel: "orgao_publico",
        canal: "simulado",
        rodada: 1,
        texto:
          "Informamos que a demanda foi recebida e incluída na análise da equipe de manutenção viária.",
        statusCidadao: "contestada",
        avaliadaEm: "2025-12-18T10:00:00.000Z",
        contestacao: {
          texto:
            "O buraco continua oferecendo risco e a resposta não informa prazo concreto para atendimento.",
          data: "2025-12-18T10:00:00.000Z",
          autorId: "flavio@gmail.com",
          autorNome: "FLAVIO",
        },
      },
      {
        data: "2025-12-19",
        protocolo: "FC-RESP-2025-1216-0005-R2",
        responsavel: "Secretaria de Infraestrutura Urbana",
        tipoResponsavel: "orgao_publico",
        canal: "simulado",
        rodada: 2,
        texto:
          "Após reavaliação, informamos que a equipe operacional realizou o reparo emergencial no trecho indicado.",
        statusCidadao: "aceita",
        avaliadaEm: "2025-12-20T09:30:00.000Z",
        contestacao: null,
      },
    ],

    historico: [
      {
        data: "2025-12-16",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-17",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
      {
        data: "2025-12-17",
        tipo: "responsavel",
        evento: "Primeira resposta do responsável registrada.",
      },
      {
        data: "2025-12-18",
        tipo: "cidadao",
        evento: "Resposta do responsável contestada pelo cidadão.",
      },
      {
        data: "2025-12-19",
        tipo: "responsavel",
        evento: "Segunda resposta do responsável registrada.",
      },
      {
        data: "2025-12-20",
        tipo: "cidadao",
        evento: "Resposta do responsável aceita pelo cidadão.",
      },
      {
        data: "2025-12-20",
        tipo: "sistema",
        evento: "Demanda marcada como resolvida no Fala Cidadão.",
      },
    ],    
  },

  {
    id: "DMD-2025-1214-0006",

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
    status: "Encaminhada",
    createdAt: "2025-12-14",
    orgao: {
      nome: "EMLURB",
      sigla: "EMLURB",
      descricao: "Autarquia responsável por limpeza urbana, manutenção e serviços urbanos no Recife",
      cidade: "Recife/PE",
      email: "atendimento@recife.pe.gov.br",
    },    

    userId: "jose@gmail.com",
    autorId: "jose@gmail.com",
    autorNome: "JOSE",

    fotos: [
      "/mock/DMD-2025-1214-0006-1.jpg",
      "/mock/DMD-2025-1214-0006-2.jpg",
      "/mock/DMD-2025-1214-0006-3.jpg",
    ],
    impacto: { confirmacoes: 21, ultimaConfirmacao: "2025-12-17" },
    respostaResponsavel: [
      {
        data: "2025-12-18",
        protocolo: "FC-RESP-2025-0006",
        responsavel: "EMLURB",
        tipoResponsavel: "orgao_publico",
        canal: "simulado",
        texto:
          "Informamos que a demanda foi recebida e encaminhada à equipe responsável para análise e programação de atendimento.",
        statusCidadao: "pendente_avaliacao",
      },
    ],

    historico: [
      {
        data: "2025-12-14",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-15",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
      {
        data: "2025-12-18",
        tipo: "responsavel",
        evento:
          "EMLURB informou que a demanda foi recebida e encaminhada à equipe responsável para análise e programação de atendimento.",
      },
    ],    
  },

  {
    id: "DMD-2025-1205-0007",

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
    status: "Encerrada",
    createdAt: "2025-12-05",
    orgao: {
      nome: "Secretaria de Mobilidade Urbana de Jaboatão",
      sigla: "SEMOB",
      descricao: "Responsável por mobilidade, trânsito e sinalização viária no município",
      cidade: "Jaboatão dos Guararapes/PE",
      email: "mobilidade@jaboatao.pe.gov.br",
    },

    userId: "maria@gmail.com",
    autorId: "maria@gmail.com",
    autorNome: "MARIA",

    fotos: ["/mock/DMD-2025-1205-0007-1.jpg", "/mock/DMD-2025-1205-0007-2.jpg"],
    impacto: { confirmacoes: 15, ultimaConfirmacao: "2025-12-10" },
    respostaResponsavel: [
      {
        data: "2025-12-06",
        protocolo: "FC-RESP-2025-0007",
        responsavel: "SEMOB Jaboatão",
        tipoResponsavel: "orgao_publico",
        canal: "simulado",
        rodada: 1,
        texto:
          "Informamos que a solicitação foi recebida e encaminhada para avaliação da equipe de sinalização viária.",
        statusCidadao: "contestada",
        avaliadaEm: "2025-12-07T11:00:00.000Z",
        contestacao: {
          texto:
            "A sinalização continua apagada e a resposta não informa prazo para pintura ou vistoria.",
          data: "2025-12-07T11:00:00.000Z",
          autorId: "maria@gmail.com",
          autorNome: "MARIA",
        },
      },
      {
        data: "2025-12-09",
        protocolo: "FC-RESP-2025-0007-R2",
        responsavel: "SEMOB Jaboatão",
        tipoResponsavel: "orgao_publico",
        canal: "simulado",
        rodada: 2,
        texto:
          "Após nova análise, informamos que a demanda foi registrada para execução conforme disponibilidade da equipe operacional.",
        statusCidadao: "contestada",
        avaliadaEm: "2025-12-10T15:20:00.000Z",
        contestacao: {
          texto:
            "A segunda resposta ainda não confirma a execução nem apresenta prazo objetivo para resolver o problema.",
          data: "2025-12-10T15:20:00.000Z",
          autorId: "maria@gmail.com",
          autorNome: "MARIA",
        },
      },
    ],
    historico: [
      {
        data: "2025-12-05",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-06",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
      {
        data: "2025-12-06",
        tipo: "responsavel",
        evento: "Primeira resposta do responsável registrada.",
      },
      {
        data: "2025-12-07",
        tipo: "cidadao",
        evento: "Resposta do responsável contestada pelo cidadão.",
      },
      {
        data: "2025-12-09",
        tipo: "responsavel",
        evento: "Segunda resposta do responsável registrada.",
      },
      {
        data: "2025-12-10",
        tipo: "cidadao",
        evento: "Segunda resposta do responsável contestada pelo cidadão.",
      },
      {
        data: "2025-12-10",
        tipo: "sistema",
        evento:
          "Ciclo de respostas encerrado no MVP após duas manifestações do responsável.",
      },
    ],    
  },

  {
    id: "DMD-2025-1218-0008",

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
      "/mock/DMD-2025-1218-0008-1.jpg",
      "/mock/DMD-2025-1218-0008-2.jpg",
    ],
    impacto: { confirmacoes: 6, ultimaConfirmacao: "2025-12-18" },
    historico: [
      {
        data: "2025-12-18",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-19",
        tipo: "sistema",
        evento:
          "Triagem inicial em andamento para identificação do responsável pelo atendimento.",
      },
    ],    
  },  
  {
    id: "DMD-2025-1219-0009",

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
      "/mock/DMD-2025-1219-0009-1.jpg",
      "/mock/DMD-2025-1219-0009-2.jpg",
    ],

    impacto: { confirmacoes: 4, ultimaConfirmacao: "2025-12-20" },

    reforcos: [],
    totalReforcos: 0,
    ultimoReforcoEm: null,

    atualizacoes: [],
    totalAtualizacoes: 0,

    ultimaMovimentacaoEm: "2025-12-19T18:30:00.000Z",
    historico: [
      {
        data: "2025-12-19",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-20",
        tipo: "sistema",
        evento:
          "Triagem inicial em andamento para identificação do responsável pelo atendimento.",
      },
    ],    
  },
  {
    id: "DMD-2025-1221-1010",

    cidadeEmFoco: "recife",
    cidadeRelato: "recife",
    cidadeRelatoLabel: "Recife",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Rua Jean Emile Favre",
      bairro: "Imbiribeira",
      cidade: "Recife",
      estado: "PE",
      lat: -8.1058,
      lng: -34.9102,
    },
    localRelato: {
      lat: -8.1058,
      lng: -34.9102,
      source: "mock",
    },

    cidade: "Recife",
    bairro: "Imbiribeira",
    rua: "Rua Jean Emile Favre",

    categoria: "Via pública",
    descricao:
      "Boca de lobo entupida provoca acúmulo de água após chuvas, dificultando a passagem de pedestres e veículos.",
    pontoReferencia: "Próximo ao cruzamento com a Avenida Mascarenhas de Morais",
    status: "Encaminhada",
    createdAt: "2025-12-21",

    orgao: {
      nome: "Secretaria de Infraestrutura Urbana",
      sigla: "SEINFRA",
      descricao:
        "Responsável por manutenção viária, drenagem urbana e infraestrutura no Recife",
      cidade: "Recife/PE",
      email: "infraestrutura@recife.pe.gov.br",
    },

    userId: "ana@gmail.com",
    autorId: "ana@gmail.com",
    autorNome: "ANA",

    fotos: [
      "/mock/DMD-2025-1221-1010-1.jpg",
      "/mock/DMD-2025-1221-1010-2.jpg",
    ],

    impacto: { confirmacoes: 18, ultimaConfirmacao: "2025-12-23" },

    reforcos: [],
    totalReforcos: 0,
    ultimoReforcoEm: null,

    atualizacoes: [],
    totalAtualizacoes: 0,

    ultimaMovimentacaoEm: "2025-12-23T10:20:00.000Z",

    respostaResponsavel: [
      {
        data: "2025-12-23",
        protocolo: "FC-RESP-2025-1221-1010",
        responsavel: "Secretaria de Infraestrutura Urbana",
        tipoResponsavel: "orgao_publico",
        canal: "simulado",
        rodada: 1,
        texto:
          "Informamos que a solicitação foi recebida e encaminhada para vistoria da equipe responsável pela rede de drenagem urbana.",
        statusCidadao: "pendente_avaliacao",
      },
    ],

    historico: [
      {
        data: "2025-12-21",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-22",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
      {
        data: "2025-12-23",
        tipo: "responsavel",
        evento:
          "Secretaria de Infraestrutura Urbana informou que a solicitação foi encaminhada para vistoria da rede de drenagem urbana.",
      },
    ],
  },

  {
    id: "DMD-2025-1222-1011",

    cidadeEmFoco: "olinda",
    cidadeRelato: "olinda",
    cidadeRelatoLabel: "Olinda",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Avenida Ministro Marcos Freire",
      bairro: "Bairro Novo",
      cidade: "Olinda",
      estado: "PE",
      lat: -8.0089,
      lng: -34.8419,
    },
    localRelato: {
      lat: -8.0089,
      lng: -34.8419,
      source: "mock",
    },

    cidade: "Olinda",
    bairro: "Bairro Novo",
    rua: "Avenida Ministro Marcos Freire",

    categoria: "Via pública",
    descricao:
      "Calçada danificada e sem faixa livre de circulação obriga pedestres, idosos e cadeirantes a seguir pela rua.",
    pontoReferencia: "Próximo a uma parada de ônibus em Bairro Novo",
    status: "Resposta contestada",
    createdAt: "2025-12-22",

    orgao: {
      nome: "Secretaria de Obras de Olinda",
      sigla: "SEOB",
      descricao:
        "Responsável por obras, manutenção urbana e intervenções em vias públicas no município",
      cidade: "Olinda/PE",
      email: "obras@olinda.pe.gov.br",
    },

    userId: "lucas@gmail.com",
    autorId: "lucas@gmail.com",
    autorNome: "LUCAS",

    fotos: [
      "/mock/DMD-2025-1222-1011-1.jpg",
      "/mock/DMD-2025-1222-1011-2.jpg",
    ],

    impacto: { confirmacoes: 27, ultimaConfirmacao: "2025-12-25" },

    reforcos: [],
    totalReforcos: 0,
    ultimoReforcoEm: null,

    atualizacoes: [],
    totalAtualizacoes: 0,

    ultimaMovimentacaoEm: "2025-12-25T14:40:00.000Z",

    respostaResponsavel: [
      {
        data: "2025-12-24",
        protocolo: "FC-RESP-2025-1222-1011",
        responsavel: "Secretaria de Obras de Olinda",
        tipoResponsavel: "orgao_publico",
        canal: "simulado",
        rodada: 1,
        texto:
          "Informamos que a demanda foi recebida e será analisada quanto à competência do município e à programação das equipes de manutenção.",
        statusCidadao: "contestada",
        avaliadaEm: "2025-12-25T14:40:00.000Z",
        contestacao: {
          texto:
            "A resposta não informa prazo de vistoria nem providência concreta para garantir a circulação segura de pedestres.",
          data: "2025-12-25T14:40:00.000Z",
          autorId: "lucas@gmail.com",
          autorNome: "LUCAS",
        },
      },
    ],

    historico: [
      {
        data: "2025-12-22",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-23",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
      {
        data: "2025-12-24",
        tipo: "responsavel",
        evento: "Primeira resposta do responsável registrada.",
      },
      {
        data: "2025-12-25",
        tipo: "cidadao",
        evento:
          "Resposta do responsável contestada pelo cidadão. Aguardando nova manifestação do responsável.",
      },
    ],
  },
  {
    id: "DMD-2025-1223-1012",

    cidadeEmFoco: "jaboatao",
    cidadeRelato: "jaboatao",
    cidadeRelatoLabel: "Jaboatão dos Guararapes",
    estadoRelato: "PE",
    enderecoDetectado: {
      rua: "Rua Santo Elias",
      bairro: "Prazeres",
      cidade: "Jaboatão dos Guararapes",
      estado: "PE",
      lat: -8.1592,
      lng: -34.9264,
    },
    localRelato: {
      lat: -8.1592,
      lng: -34.9264,
      source: "mock",
    },

    cidade: "Jaboatão dos Guararapes",
    bairro: "Prazeres",
    rua: "Rua Santo Elias",

    categoria: "Outros",
    descricao:
      "Esgoto a céu aberto escorre pela via há vários dias, causando mau cheiro, risco sanitário e dificuldade de circulação.",
    pontoReferencia: "Próximo à entrada de uma vila residencial em Prazeres",
    status: "Resolvida",
    createdAt: "2025-12-23",

    orgao: {
      nome: "Compesa",
      sigla: "COMPESA",
      descricao:
        "Companhia responsável por serviços de abastecimento de água e esgotamento sanitário em Pernambuco",
      cidade: "Jaboatão dos Guararapes/PE",
      email: "atendimento@compesa.com.br",
    },

    userId: "paula@gmail.com",
    autorId: "paula@gmail.com",
    autorNome: "PAULA",

    fotos: [
      "/mock/DMD-2025-1223-1012-1.jpg",
      "/mock/DMD-2025-1223-1012-2.jpg",
    ],

    impacto: { confirmacoes: 31, ultimaConfirmacao: "2025-12-27" },

    reforcos: [],
    totalReforcos: 0,
    ultimoReforcoEm: null,

    atualizacoes: [
      {
        id: "ATU-2025-1224-1012",
        data: "2025-12-24",
        autorId: "paula@gmail.com",
        autorNome: "PAULA",
        texto:
          "Moradores informam que o vazamento continua ativo e o mau cheiro aumentou após a chuva.",
        fotos: ["/mock/DMD-2025-1223-1012-3.jpg"],
      },
    ],
    totalAtualizacoes: 1,

    ultimaMovimentacaoEm: "2025-12-27T16:10:00.000Z",

    respostaResponsavel: [
      {
        data: "2025-12-24",
        protocolo: "FC-RESP-2025-1223-1012",
        responsavel: "Compesa",
        tipoResponsavel: "concessionaria",
        canal: "simulado",
        rodada: 1,
        texto:
          "Informamos que a ocorrência foi registrada e encaminhada para avaliação técnica da equipe operacional.",
        statusCidadao: "contestada",
        avaliadaEm: "2025-12-25T09:15:00.000Z",
        contestacao: {
          texto:
            "A resposta confirma o recebimento, mas não informa previsão de atendimento para o vazamento de esgoto.",
          data: "2025-12-25T09:15:00.000Z",
          autorId: "paula@gmail.com",
          autorNome: "PAULA",
        },
      },
      {
        data: "2025-12-26",
        protocolo: "FC-RESP-2025-1223-1012-R2",
        responsavel: "Compesa",
        tipoResponsavel: "concessionaria",
        canal: "simulado",
        rodada: 2,
        texto:
          "Após vistoria, informamos que a equipe realizou intervenção emergencial no ponto indicado e normalizou o escoamento.",
        statusCidadao: "aceita",
        avaliadaEm: "2025-12-27T16:10:00.000Z",
        contestacao: null,
      },
    ],

    historico: [
      {
        data: "2025-12-23",
        tipo: "sistema",
        evento: "Demanda registrada no Fala Cidadão.",
      },
      {
        data: "2025-12-24",
        tipo: "sistema",
        evento: "Demanda encaminhada ao responsável pelo atendimento.",
      },
      {
        data: "2025-12-24",
        tipo: "responsavel",
        evento: "Primeira resposta do responsável registrada.",
      },
      {
        data: "2025-12-24",
        tipo: "cidadao",
        evento: "Atualização cidadã registrada.",
      },
      {
        data: "2025-12-25",
        tipo: "cidadao",
        evento: "Resposta do responsável contestada pelo cidadão.",
      },
      {
        data: "2025-12-26",
        tipo: "responsavel",
        evento: "Segunda resposta do responsável registrada.",
      },
      {
        data: "2025-12-27",
        tipo: "cidadao",
        evento: "Resposta do responsável aceita pelo cidadão.",
      },
      {
        data: "2025-12-27",
        tipo: "sistema",
        evento: "Demanda marcada como resolvida no Fala Cidadão.",
      },
    ],
  },    
];
