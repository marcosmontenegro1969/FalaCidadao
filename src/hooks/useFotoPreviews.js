// src/hooks/useFotoPreviews.js
import { useEffect, useState } from "react";

export function useFotoPreviews(fotosSelecionadas = []) {
  const [fotosPreviewUrls, setFotosPreviewUrls] = useState([]);

  useEffect(() => {
    const urls = fotosSelecionadas.map((file) => URL.createObjectURL(file));
    setFotosPreviewUrls(urls);

    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [fotosSelecionadas]);

  return fotosPreviewUrls;
}