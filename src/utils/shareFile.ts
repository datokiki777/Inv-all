/**
 * Thin wrapper around the Web Share API's file-sharing support
 * (navigator.share({ files })) — lets the person hand a generated PDF
 * straight to whatever app they pick from the OS share sheet (WhatsApp,
 * Gmail, Telegram, etc.) without a manual download-then-attach step.
 *
 * Well-supported on Android Chrome/WebView (installed PWAs included) and
 * iOS Safari, but not universal — canShareFiles() does real feature
 * detection so callers can fall back to a plain download when it's not
 * available, rather than showing a Share button that would just fail.
 */

/** Whether this browser/device can share a file of this type at all — call before offering a Share button. */
export function canShareFiles(file: File): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Opens the native share sheet with the given file. Resolves to false
 * (not a thrown error) if the person simply cancels the share sheet —
 * that's a normal, silent outcome, not a failure to surface. Rethrows
 * any other, genuine error so the caller can show a real failure message.
 */
export async function shareFile(file: File, title?: string): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({ files: [file], title });
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return false;
    throw err;
  }
}
