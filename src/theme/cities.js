// src/theme/cities.js

/**
 * CONFIGURAÇÃO DE CIDADES
 * 
 * REGRA DO PROJETO (IMPORTANTE):
 * - O tema de UI do sistema (cores, textos, superfícies) é FIXO e está definido no CSS (:root).
 * - A cidade selecionada altera APENAS o branding contextual, que hoje inclui:
 *   - Logo exibida no footer, Nome da cidade, gradiente do footer e Imagem de background da tela principal
 *
 * Este arquivo funciona como uma "tabela de configuração" das cidades. */

export const CITY_THEMES = {

  /** Estado default da aplicação.
   * 
   * - Usado quando nenhuma cidade foi selecionada
   * - Serve como fallback seguro para footer e background
   * - Evita que o sistema quebre caso alguma cidade não esteja definida */
  default: {
    id: "default",
    name: "Padrão",
    cidadeFull: "Selecione uma cidade",
    cidadeShort: "—",

    // Logo padrão exibida no footer
    footerLogo: "/Logos/Logo_Icon_Mobile_Fala_Cidadao.png",

    // Gradiente padrão do footer (fallback visual)
    footerGradient: ["#0f172a", "#111827", "#0f172a"],

    // background padrão do hero
    backgroundImage: "/backgrounds/bg-default.png",
  },

  /* Cidade do Recife */
  recife: {
    id: "recife",
    name: "Cidade do Recife",
    cidadeFull: "Cidade do Recife",
    cidadeShort: "Recife/PE",

    // Logo institucional exibida no footer
    footerLogo: "/Logos/Logo-Recife.png",

    // Gradiente do footer baseado nas cores oficiais
    footerGradient: ["#173DB7", "#42DA2E", "#FC9346"],

    // Imagem de background da tela principal (hero)
    backgroundImage: "/backgrounds/bg-recife-pe.png",
  },

  /* Cidade de Olinda */
  olinda: {
    id: "olinda",
    name: "Cidade de Olinda",
    cidadeFull: "Cidade de Olinda",
    cidadeShort: "Olinda/PE",

    footerLogo: "/Logos/Logo-Olinda.png",
    footerGradient: ["#1F6FB2", "#2A7EC4", "#F2C94C"],
    backgroundImage: "/backgrounds/bg-olinda-pe.png",
  },

  /* Cidade de Jaboatão dos Guararapes */
  jaboatao: {
    id: "jaboatao",
    name: "Cidade de Jaboatão dos Guararapes",
    cidadeFull: "Cidade de Jaboatão dos Guararapes",
    cidadeShort: "Jaboatão dos Guararapes/PE",

    footerLogo: "/Logos/Logo-Jaboatao.png",
    footerGradient: ["#0B5EA8", "#2DBE60", "#F4B000"],
    backgroundImage: "/backgrounds/bg-jaboatao-pe.png",
  },
};
