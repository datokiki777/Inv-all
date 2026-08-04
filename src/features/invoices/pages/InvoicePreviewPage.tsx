import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Pencil } from "lucide-react";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { getTemplate } from "@/pdf/templateRegistry";
import { getPdfLabels } from "@/pdf/labels";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import type { Invoice } from "@/types";

type Status = "loading" | "ready" | "error" | "notFound";

/**
 * Preview and download share the exact same template component and props
 * (getTemplate(invoice.templateId).Component) — there is no separate HTML
 * preview markup that could drift from the actual PDF output.
 */
export function InvoicePreviewPage() {
  const { t } = useTranslation(["common", "invoice"]);
  const { invoiceId } = useParams();
  const [status, setStatus] = useState<Status>("loading");
  const [invoice, setInvoice] = useState<Invoice | undefined>();

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

  if (status === "loading") return <LoadingSpinner label={t("invoice:preview.loading")} />;
  if (status === "error") return <EmptyState title={t("invoice:preview.loadError")} />;
  if (status === "notFound" || !invoice) return <EmptyState title={t("invoice:form.notFound")} />;

  const { Component: Template } = getTemplate(invoice.templateId);
  const labels = getPdfLabels(invoice.pdfLanguage);
  const document = <Template invoice={invoice} labels={labels} />;
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
          <PDFDownloadLink document={document} fileName={fileName}>
            {({ loading }) => (
              <Button size="sm" disabled={loading}>
                <Download size={15} /> {loading ? t("invoice:preview.preparing") : t("actions.download")}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border border-line">
        <PDFViewer style={{ width: "100%", height: "100%", border: "none" }} showToolbar={false}>
          {document}
        </PDFViewer>
      </div>
    </div>
  );
}
