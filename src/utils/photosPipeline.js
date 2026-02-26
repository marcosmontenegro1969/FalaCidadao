// src/utils/photosPipeline.js

/**
 * Limite de armazenamento:
 * - como o MVP guarda Base64 no LocalStorage, precisamos de teto.
 * - 3.5MB é "teto seguro" para evitar estourar quota em navegadores comuns.
 */
export const MAX_FOTOS_TOTAL_BYTES = 3.5 * 1024 * 1024;

/**
 * readAsDataURL:
 * - lê um File e retorna DataURL (base64) original
 */
export function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**
 * loadImage:
 * - carrega DataURL em um objeto Image para desenhar em Canvas
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });
}

/**
 * fileToCompressedDataURL:
 * - pipeline de compressão:
 *   File -> DataURL -> Image -> Canvas resize -> DataURL comprimido
 */
export async function fileToCompressedDataURL(
  file,
  { maxW = 1280, maxH = 1280, quality = 0.72, mime = "image/jpeg" } = {}
) {
  const originalDataUrl = await readAsDataURL(file);
  const img = await loadImage(originalDataUrl);

  let { width, height } = img;
  const ratio = Math.min(maxW / width, maxH / height, 1);
  const targetW = Math.max(1, Math.round(width * ratio));
  const targetH = Math.max(1, Math.round(height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador.");

  if (mime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  }

  ctx.drawImage(img, 0, 0, targetW, targetH);
  return canvas.toDataURL(mime, quality);
}

/**
 * estimateBase64Bytes:
 * - calcula bytes aproximados do conteúdo base64
 */
export function estimateBase64Bytes(dataUrl = "") {
  const i = dataUrl.indexOf("base64,");
  if (i === -1) return 0;

  const b64 = dataUrl.slice(i + 7);

  let padding = 0;
  if (b64.endsWith("==")) padding = 2;
  else if (b64.endsWith("=")) padding = 1;

  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

/**
 * formatBytes:
 * - utilitário para mensagens
 */
export function formatBytes(bytes) {
  if (!bytes || bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * filesToBase64:
 * - processa em série (menos travamento)
 * - emite progress {done,total,fileName}
 * - se 1 falhar, ignora (MVP tolerante)
 */
export async function filesToBase64(files, opts) {
  const out = [];
  const onProgress = opts?.onProgress;

  for (let i = 0; i < files.length; i++) {
    const f = files[i];

    try {
      const dataUrl = await fileToCompressedDataURL(f, opts);
      out.push(dataUrl);
    } catch (err) {
      console.warn("Falha ao converter imagem:", f?.name, err);
    } finally {
      if (typeof onProgress === "function") {
        onProgress({
          done: i + 1,
          total: files.length,
          fileName: f?.name ?? "",
        });
      }
    }
  }

  return out;
}