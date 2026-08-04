/** Triggers a browser file download from in-memory text — no server involved. */
export function downloadTextFile(filename: string, content: string, mimeType = "application/json"): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(filename, blob);
}

/** Triggers a browser file download from an in-memory Blob (e.g. a generated PDF). */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
