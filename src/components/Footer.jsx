// src/components/Footer.jsx

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { CITY_THEMES } from "../theme/cities";

/* Footer (Rodapé da aplicação)
 *
 * Responsabilidades:
 * - Exibir a identidade institucional da cidade selecionada
 * - Aplicar o gradiente oficial da cidade no fundo do footer
 * - Exibir logo, nome da cidade e informações acadêmicas
 *
 * Observação importante:
 * - O Footer é o único local onde as cores da cidade aparecem */
export default function Footer() {
  const { city } = useContext(ThemeContext);

  const theme = CITY_THEMES[city] ?? CITY_THEMES.default;
  const [c1, c2, c3] = theme.footerGradient;

  return (
    <footer
      className="border-t border-borderSubtle relative"
      style={{
        backgroundImage: `linear-gradient(90deg, ${c1}, ${c2}, ${c3})`,
      }}
    >
      {/* Overlay sutil para legibilidade */}
      <div className="absolute inset-0 bg-[var(--overlay-footer)] pointer-events-none" />

      {/* Conteúdo */}
      <div className="relative max-w-5xl mx-auto px-4 py-4 text-xs text-textmain">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
          {/* Esquerda */}
          <span className="text-textsoft">
            © 2025 · Fala Cidadão · Projeto acadêmico
          </span>

          {/* Centro */}
          <div className="flex items-center gap-3 md:justify-center">
            <div className="flex items-center gap-2">
              <div className="leading-tight">
                <div className="text-[18px] text-textsoft">
                  Cidade ativa:
                </div>
              </div>
              <img
                src={theme.footerLogo}
                alt={theme.cidadeFull ?? theme.name}
                className="h-7 w-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Direita */}
          <span className="md:text-right text-textsoft">
            GTI · CESAR School
          </span>
        </div>
      </div>
    </footer>
  );
}
