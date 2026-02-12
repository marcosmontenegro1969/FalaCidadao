// src/components/Topo.jsx

import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import CitySelector from "./CitySelector";

const navLinks = [
  { label: "Início", to: "/" },
  { label: "Como funciona", to: "/como-funciona" },
  { label: "Painel público", to: "/painel" },
];

export default function Topo() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("falaCidadao.auth");
      setAuthUser(raw ? JSON.parse(raw) : null);
    } catch {
      setAuthUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("falaCidadao.auth");
    setAuthUser(null);
    closeMobile();
    navigate("/", { replace: true });
  };

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  const linkClass = ({ isActive }) =>
    `transition-colors ${
      isActive ? "text-textmain" : "text-textmuted hover:text-textmain"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `w-full text-left px-2 py-2 rounded-md transition ${
      isActive ? "bg-surfaceLight/60 text-textmain" : "text-textmain hover:bg-surfaceLight/60"
    }`;

  const ctaClass =
    "inline-flex items-center justify-center rounded-xl border border-primary/40 bg-primary/25 px-3 py-1.5 text-sm font-semibold text-textmain hover:bg-primary/35 hover:border-primary/60 transition";
  
  const userChipClass =
    "inline-flex items-center gap-2 rounded-xl border border-surfaceLight bg-surfaceLight/20 px-3 py-2 text-xs text-textmain";

  return (
    <header className="sticky top-0 z-40 border-b border-surfaceLight bg-surface/95 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
        {/* LOGO + TÍTULO */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <img
            src="/Logos/Logo_Icon_Mobile_Fala_Cidadao.png"
            alt="Logo Fala Cidadão Mobile"
            className="h-9 w-auto object-contain md:hidden"
          />

          <img
            src="/Logos/Logo_Desktop_Fala_Cidadao_Transp_Branco.png"
            alt="Logo Fala Cidadão Desktop"
            className="h-10 w-auto object-contain hidden md:block"
          />

          <div className="hidden md:flex flex-col leading-tight shrink-0 mr-6">
            <span className="font-semibold tracking-tight text-base text-textmain whitespace-nowrap">
              Sua voz na gestão pública
            </span>
          </div>
        </div>

        {/* MENU DESKTOP */}
        {/* ÁREA DIREITA (DESKTOP): nav + auth + cidade com espaçamento consistente */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 text-sm" aria-label="Navegação principal">
            {navLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={(props) => `${linkClass(props)} whitespace-nowrap`}
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {!authUser ? (
            <NavLink to="/entrar" className={ctaClass}>
              Entrar
            </NavLink>
          ) : (
            <div
              className="inline-flex w-[200px] items-center rounded-xl bg-surfaceLight text-textmain border border-textmuted/40 px-3 py-1.5 text-sm"
              title={authUser.email}
            >
              <span
                className="font-semibold flex-1 min-w-0 truncate"
                title={authUser?.nome || "Cidadão"}
              >
                {authUser?.nome || "Cidadão"}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 ml-3 rounded-lg px-2 py-1 text-xs font-semibold text-textmuted hover:text-textmain hover:bg-surfaceLight/70 transition"
                title="Sair"
              >
                Sair
              </button>
            </div>
          )}

          <div className="w-[200px] max-w-[200px]">
            <CitySelector />
          </div>
        </div>

        {/* BOTÃO MOBILE */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="md:hidden inline-flex items-center gap-2 border border-surfaceLight rounded-lg px-3 py-1.5 text-xs uppercase tracking-wide text-textmain hover:bg-surfaceLight/60 transition"
        >
          {mobileOpen ? (
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-4 w-4" aria-hidden="true" />
          )}
          Menu
        </button>
      </div>

      {/* MENU MOBILE EXPANDIDO */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-surfaceLight bg-surface">
          <nav
            className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 text-sm"
            aria-label="Navegação mobile"
          >
            <CitySelector onChangeComplete={closeMobile} />

            {navLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={mobileLinkClass}
                end={item.to === "/"}
                onClick={closeMobile}
              >
                {item.label}
              </NavLink>
            ))}
            {!authUser ? (
              <NavLink
                to="/entrar"
                className="w-full text-left px-3 py-2 rounded-xl font-semibold border border-surfaceLight bg-surfaceLight/30 text-textmain hover:bg-surfaceLight/60 transition"
                onClick={closeMobile}
              >
                Entrar
              </NavLink>
            ) : (
              <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-surfaceLight bg-surfaceLight/20">
                <div className="inline-flex items-center text-xs text-textmain" title={authUser.email}>
                  <span className="font-semibold truncate max-w-[220px]" 
                    title={authUser?.nome || "Cidadão"}
                  >
                    {authUser?.nome || "Cidadão"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs rounded-xl border border-surfaceLight px-3 py-1.5 text-textmain hover:bg-surfaceLight/60 transition"
                >
                  Sair
                </button>
              </div>
            )}

            <div className="mt-2 text-[11px] text-textmuted">
              · Projeto piloto · Cidades da Região Metropolitana
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
