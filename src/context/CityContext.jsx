/* CityContext
 *
 * Este arquivo define um contexto global do React responsável por:
 * - Armazenar a cidade atualmente selecionada
 * - Permitir que qualquer componente altere essa cidade
 *
 * Importante:
 * - Este contexto NÃO controla cores ou tema visual, ele serve apenas para
 * compartilhar o estado da cidade, que pode ser "recife", "olinda", etc. */

import { createContext, useEffect, useState } from "react";

const INITIAL_CITY = "recife";
const CITY_STORAGE_KEY = "falaCidadao.city";

export const CityContext = createContext(null);

export function CityProvider({ children }) {
  // ✅ Inicializa lendo do localStorage (se existir)
  const [city, setCity] = useState(() => {
    try {
      const saved = localStorage.getItem(CITY_STORAGE_KEY);
      return saved || INITIAL_CITY;
    } catch {
      return INITIAL_CITY;
    }
  });

  // ✅ Persiste sempre que city mudar
  useEffect(() => {
    try {
      localStorage.setItem(CITY_STORAGE_KEY, city);
    } catch {
      // ignora (ex.: modo privado muito restrito)
    }
  }, [city]);

  function changeCity(newCity) {
    setCity(newCity);
  }

  return (
    <CityContext.Provider value={{ city, changeCity }}>
      {children}
    </CityContext.Provider>
  );
}
