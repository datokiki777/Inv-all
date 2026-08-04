import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfCanvasPreviewProps {
  blob: Blob | null;
  loadErrorLabel: string;
}

/**
 * Renders a generated PDF as actual pixels on <canvas> elements, using
 * pdf.js — NOT @react-pdf/renderer's <PDFViewer> (which embeds an
 * <iframe> pointing at a blob URL and depends on the browser having a
 * native inline PDF plugin). Most Android WebViews / installed PWAs don't
 * have one, so <PDFViewer> silently falls back to a generic "can't
 * preview this file, tap to open" card instead of showing the invoice.
 * Rasterizing ourselves works identically everywhere, mobile included —
 * and it still renders the exact same bytes the Download button saves.
 */
export function PdfCanvasPreview({ blob, loadErrorLabel }: PdfCanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!blob) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    setStatus("loading");

    async function render() {
      try {
        const arrayBuffer = await blob!.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          // Our templates use PDF's built-in "standard" fonts (Helvetica)
          // rather than embedding a font file, so pdf.js needs this metrics
          // data to measure/rasterize glyphs correctly. Bundled locally
          // (public/pdfjs/standard_fonts) so it works fully offline.
          standardFontDataUrl: `${import.meta.env.BASE_URL}pdfjs/standard_fonts/`
        });
        const pdfDoc = await loadingTask.promise;
        if (cancelled || !container) return;

        container.innerHTML = "";
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 * dpr });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.style.marginBottom = "10px";
          canvas.style.borderRadius = "6px";
          canvas.style.boxShadow = "0 1px 4px rgba(0,0,0,0.35)";
          container.appendChild(canvas);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
        }

        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [blob]);

  return (
    <div className="h-full overflow-y-auto bg-surface-sunken p-2">
      {status === "loading" || status === "idle" ? <LoadingSpinner /> : null}
      {status === "error" ? <p className="p-4 text-center text-sm text-danger">{loadErrorLabel}</p> : null}
      <div ref={containerRef} />
    </div>
  );
}
