// src/context/AppearanceContext.jsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const APPEARANCE_STORAGE_KEY = "falaCidadao.appearance";
const DEFAULT_APPEARANCE = "dark";

const VALID_APPEARANCES = ["dark", "light"];

const AppearanceContext = createContext(null);

function isValidAppearance(value) {
  return VALID_APPEARANCES.includes(value);
}

function getInitialAppearance() {
  try {
    const saved = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    return isValidAppearance(saved) ? saved : DEFAULT_APPEARANCE;
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearanceState] = useState(getInitialAppearance);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appearance);

    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
    } catch {
      // Ignora ambientes onde localStorage esteja indisponível.
    }
  }, [appearance]);

  function setAppearance(nextAppearance) {
    if (!isValidAppearance(nextAppearance)) return;
    setAppearanceState(nextAppearance);
  }

  function toggleAppearance() {
    setAppearanceState((current) => (current === "dark" ? "light" : "dark"));
  }

  const value = useMemo(
    () => ({
      appearance,
      setAppearance,
      toggleAppearance,
      isDark: appearance === "dark",
      isLight: appearance === "light",
    }),
    [appearance]
  );

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);

  if (!context) {
    throw new Error("useAppearance deve ser usado dentro de AppearanceProvider.");
  }

  return context;
}