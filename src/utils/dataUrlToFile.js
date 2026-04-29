export function dataUrlToFile(
  dataUrl,
  filename,
  type = "image/jpeg",
  lastModified = Date.now()
) {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || type;

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, {
    type: mime,
    lastModified,
  });
}