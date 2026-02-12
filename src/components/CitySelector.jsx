// src/components/CitySelector.jsx

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

// Componente para seleção de cidade
export default function CitySelector({ onChangeComplete }) {
  const { city, changeCity } = useContext(ThemeContext);

  // Função para lidar com mudança de cidade
  function handleChange(e) {
    changeCity(e.target.value);
    if (onChangeComplete) onChangeComplete();
  }

  return (
    // Dropdown de seleção de cidade
    <select
      value={city}
      onChange={handleChange}
      className="
        bg-surfaceLight text-textmain
        border border-textmuted/40
        rounded-xl px-3 py-1.5 pr-10 text-sm
        outline-none
        focus:ring-2 focus:ring-primary/40
        hover:bg-surfaceLight/70 transition
        w-full
        overflow-hidden text-ellipsis whitespace-nowrap
      "
    >
      {/* Placeholder: não selecionável */}
      <option value="default" disabled>Selecione a cidade</option>
      <option value="recife">Recife/PE</option>
      <option value="jaboatao">Jaboatão dos Guararapes/PE</option>
      <option value="olinda">Olinda/PE</option>
    </select>
  );
}
