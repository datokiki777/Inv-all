import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import { Download, Pencil } from "lucide-react";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { getTemplate } from "@/pdf/templateRegistry";
import { getPdfLabels } from "@/pdf/labels";
import { PdfCanvasPreview } from "@/pdf/PdfCanvasPreview";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { downloadBlob } from "@/utils/downloadFile";
import type { Invoice } from "@/types";

type Status = "loading" | "ready" | "error" | "notFound";

/**
 * Preview and download both come from one generated PDF blob, built with
 * getTemplate(invoice.templateId).Component — the exact same template
 * component used everywhere else. There is no separate HTML preview markup
 * that could visually drift from the actual PDF file.
 */
export function InvoicePreviewPage() {
  const { t } = useTranslation(["common", "invoice"]);
  const { invoiceId } = useParams();
  const [status, setStatus] = useState<Status>("loading");
  const [invoice, setInvoice] = useState<Invoice | undefined>();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfBlobError, setPdfBlobError] = useState(false);

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
  // both the on-screen preview and the download button read from this
  // same blob, so they can never show different content.
  useEffect(() => {
    if (!invoice) return;
    let cancelled = false;
    setPdfBlob(null);
    setPdfBlobError(false);

    const { Component: Template } = getTemplate(invoice.templateId);
    const labels = getPdfLabels(invoice.pdfLanguage);

    pdf(<Template invoice={invoice} labels={labels} />)
      .toBlob()
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

  const fileName = `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;

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
          <Button size="sm" disabled={!pdfBlob} onClick={() => pdfBlob && downloadBlob(fileName, pdfBlob)}>
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
