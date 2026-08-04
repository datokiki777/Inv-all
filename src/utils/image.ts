/**
 * Converts an uploaded image file into a downscaled, compressed base64
 * data URL. See the LogoUploader component / Stage 2 notes for why a data
 * URL (rather than a Blob) is what gets persisted.
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxDimension = 480,
  quality = 0.82
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available in this browser.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // PNGs are kept lossless (logos are often flat-color/transparent and
  // compress fine losslessly); everything else is re-encoded as JPEG.
  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  return canvas.toDataURL(mime, quality);
}
