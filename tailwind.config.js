/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      /* CORES (via CSS Variables) — com suporte a alpha (/xx) */
      colors: {
        primary: "rgb(var(--color-primary-rgb) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary-rgb) / <alpha-value>)",
        accent: "rgb(var(--color-accent-rgb) / <alpha-value>)",

        surface: "rgb(var(--color-surface-rgb) / <alpha-value>)",
        surfaceLight: "rgb(var(--color-surface-light-rgb) / <alpha-value>)",

        textmain: "rgb(var(--color-text-rgb) / <alpha-value>)",
        textsoft: "rgb(var(--color-text-soft-rgb) / <alpha-value>)",
        textmuted: "rgb(var(--color-text-muted-rgb) / <alpha-value>)",

        /* Tokens semânticos úteis como cores */
        borderSubtle: "var(--border-subtle)",
        overlay: "var(--surface-overlay)",
        overlayHover: "var(--surface-overlay-hover)",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 0 0 var(--glow-primary-0)",
          },
          "50%": {
            boxShadow: "0 0 24px 0 var(--glow-primary-60)",
          },
        },
      },
      
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },

  plugins: [],
};
