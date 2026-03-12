// src/utils/handlePickFotos.js
import { distanciaMetros, fileKey, lerGpsExif } from "./exifGps";
import { reverseGeocodeCity } from "./reverseGeocode";

/**
 * Handler puro para seleção de fotos com:
 * - leitura EXIF/GPS obrigatória
 * - verificação de proximidade entre fotos
 * - reverse geocoding (melhor esforço)
 */
export async function handlePickFotos({
  e,
  fotosSelecionadas,
  setFotosSelecionadas,
  setFotosMeta,
  setLocalRelato,
  setEnderecoDetectado,
  limiteDistanciaMetros,
  showToast,
  setAlertOverlay,
  scrollTo,
  evidenciasRef,
  fotosPickRef,
}) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  // Sempre zerar o input para permitir re-selecionar o mesmo arquivo
  e.target.value = "";

  // Junta com as já selecionadas e limita em 3
  const merged = [...fotosSelecionadas, ...files].slice(0, 3);

  if (merged.length < 1 || merged.length > 3) {
    showToast("error", "Envie entre 1 e 3 fotos para continuar.");
    scrollTo(evidenciasRef, fotosPickRef);
    return;
  }

  try {
    const metas = [];

    for (let i = 0; i < merged.length; i++) {
      const file = merged[i];
      const gps = await lerGpsExif(file);

      if (!gps.ok) {
        setAlertOverlay({
          title: `Foto ${i + 1} sem GPS (EXIF)`,
          message:
            `Arquivo: ${file.name}\n\n` +
            `Essa foto está sem dados de localização. ` +
            `Tire a foto com a câmera do celular com a localização ativada e anexe o arquivo original. ` +
            `Evite WhatsApp/Instagram, pois geralmente removem os dados.`,
        });

        scrollTo(evidenciasRef, fotosPickRef);
        return; // BLOQUEIA: não atualiza estado
      }

      metas.push({
        key: fileKey(file),
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        lat: gps.lat,
        lng: gps.lng,
        takenAt: gps.takenAt,
      });
    }

    const metaRef = metas[0];

    for (let i = 0; i < metas.length; i++) {
      const meta = metas[i];
      const dist = distanciaMetros(metaRef.lat, metaRef.lng, meta.lat, meta.lng);

      if (dist > limiteDistanciaMetros) {
        setAlertOverlay({
          title: "Fotos com locais diferentes",
          message:
            `A foto ${i + 1} (${meta.name}) está longe demais da primeira foto.\n\n` +
            `Distância estimada: ${Math.round(dist)}m.\n` +
            `Limite permitido: ${limiteDistanciaMetros}m.\n\n` +
            `Para garantir veracidade, envie fotos do mesmo local.`,
        });

        scrollTo(evidenciasRef, fotosPickRef);
        return;
      }
    }

    setFotosSelecionadas(merged);
    setFotosMeta(metas);

    setLocalRelato({
      lat: metaRef.lat,
      lng: metaRef.lng,
      source: "exif",
    });

    // reverse geocoding é "best effort"
    try {
      const geo = await reverseGeocodeCity(metaRef.lat, metaRef.lng);

      setEnderecoDetectado({
        cidade: geo?.cidade || "",
        estado: geo?.estado || "",
        bairro: geo?.bairro || "",
        rua: geo?.rua || "",
      });
    } catch {
      setEnderecoDetectado(null);
    }
  } catch (err) {
    console.error(err);
    showToast(
      "error",
      "Não foi possível ler o EXIF das fotos. Tente novamente com imagens originais da câmera."
    );
    scrollTo(evidenciasRef, fotosPickRef);
  }
}