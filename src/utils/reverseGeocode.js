export async function reverseGeocodeCity(lat, lng) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lng)}` +
    `&zoom=18&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      // Nominatim recomenda identificar o app; o browser limita UA, mas o header ajuda
      "Accept": "application/json",
    },
  });

  if (!res.ok) throw new Error("Falha no reverse geocoding");
  const data = await res.json();

  const a = data?.address || {};
  // Nominatim pode usar city / town / village / municipality
  const cidade =
    a.city || a.town || a.village || a.municipality || a.county || "";

  const estado = a.state || "";

  const bairro =
    a.suburb || a.neighbourhood || a.quarter || a.city_district || "";

  const rua =
    a.road || a.pedestrian || a.footway || a.path || "";

  return { cidade, estado, bairro, rua, raw: data };
}