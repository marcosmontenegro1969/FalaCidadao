// src/utils/exifGps.js
import exifr from "exifr";

export function distanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function fileKey(f) {
  return `${f.name}__${f.size}__${f.lastModified}`;
}

export async function lerGpsExif(file) {
  const data = await exifr.parse(file, {
    gps: true,
    tiff: true,
    ifd0: true,
    exif: true,
  });

  const lat = data?.latitude;
  const lng = data?.longitude;

  const latOk =
    typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90;
  const lngOk =
    typeof lng === "number" && Number.isFinite(lng) && lng >= -180 && lng <= 180;

  const takenAt =
    data?.DateTimeOriginal ||
    data?.CreateDate ||
    data?.ModifyDate ||
    null;

  return {
    ok: latOk && lngOk,
    lat: latOk ? lat : null,
    lng: lngOk ? lng : null,
    takenAt,
  };
}