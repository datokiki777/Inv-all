import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Download, Share2, Pencil } from "lucide-react";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { recentExportService } from "@/features/invoices/services/recentExportService";
import { generateInvoicePdfBlob, invoicePdfFileName } from "@/pdf/generateInvoicePdf";
import { PdfCanvasPreview } from "@/pdf/PdfCanvasPreview";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { downloadBlob } from "@/utils/downloadFile";
import { canShareFiles, shareFile } from "@/utils/shareFile";
import type { Invoice } from "@/types";

type Status = "loading" | "ready" | "error" | "notFound";

/**
 * Preview, download, and share all come from one generated PDF blob, built
 * with getTemplate(invoice.templateId).Component via generateInvoicePdfBlob
 * — the exact same template component used everywhere else. There is no
 * separate HTML preview markup that could visually drift from the actual
 * PDF file, and nothing shared/downloaded is ever a different file from
 * what's on screen.
 */
export function InvoicePreviewPage() {
  const { t } = useTranslation(["common", "invoice"]);
  const toast = useToast();
  const { invoiceId } = useParams();
  const [status, setStatus] = useState<Status>("loading");
  const [invoice, setInvoice] = useState<Invoice | undefined>();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfBlobError, setPdfBlobError] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!invoiceId) return;
    setStatus("loading");
    invoiceService
      .getById(invoiceId)
      .then((loaded) => {
        if (cancelled) return;
        setInvoice(loaded);
        setStatus(loaded ? "ready" : "notFound");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  // Generate the actual PDF bytes once the invoice is loaded (or changes) —
  // the on-screen preview, download, and share buttons all read from this
  // same blob, so they can never show/send different content.
  useEffect(() => {
    if (!invoice) return;
    let cancelled = false;
    setPdfBlob(null);
    setPdfBlobError(false);

    generateInvoicePdfBlob(invoice)
      .then((blob) => {
        if (!cancelled) setPdfBlob(blob);
      })
      .catch(() => {
        if (!cancelled) setPdfBlobError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [invoice]);

  if (status === "loading") return <LoadingSpinner label={t("invoice:preview.loading")} />;
  if (status === "error") return <EmptyState title={t("invoice:preview.loadError")} />;
  if (status === "notFound" || !invoice) return <EmptyState title={t("invoice:form.notFound")} />;

  const fileName = invoicePdfFileName(invoice);

  function handleDownload() {
    if (!pdfBlob || !invoice) return;
    downloadBlob(fileName, pdfBlob);
    recentExportService.recordExport(invoice.id);
  }

  async function handleShare() {
    if (!pdfBlob || !invoice) return;
    setSharing(true);
    try {
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });
      const shared = await shareFile(file, invoice.invoiceNumber);
      if (shared) recentExportService.recordExport(invoice.id);
    } catch {
      toast.error(t("actions.shareError"));
    } finally {
      setSharing(false);
    }
  }

  const shareSupported = !!pdfBlob && canShareFiles(new File([pdfBlob], fileName, { type: "application/pdf" }));

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-ink">{invoice.invoiceNumber}</h1>
        <div className="flex gap-2">
          <Link to={`/invoices/${invoice.id}/edit`}>
            <Button variant="secondary" size="sm">
              <Pencil size={15} /> {t("actions.edit")}
            </Button>
          </Link>
          {shareSupported ? (
            <Button variant="secondary" size="sm" disabled={sharing} onClick={handleShare}>
              <Share2 size={15} /> {t("actions.share")}
            </Button>
          ) : null}
          <Button size="sm" disabled={!pdfBlob} onClick={handleDownload}>
            <Download size={15} /> {pdfBlob ? t("actions.download") : t("invoice:preview.preparing")}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-line">
        {pdfBlobError ? (
          <EmptyState title={t("invoice:preview.loadError")} />
        ) : (
          <PdfCanvasPreview blob={pdfBlob} loadErrorLabel={t("invoice:preview.loadError")} />
        )}
      </div>
    </div>
  );
}
