import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

// Stage 1 skeleton. Later this renders the PDFViewer using the same
// template + data the download button uses, per the "one source of truth"
// requirement — never a separate HTML preview.
export function InvoicePreviewPage() {
  const { t } = useTranslation();
  const { invoiceId } = useParams();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">{t("pages.invoicePreview")}</h1>
      <p className="mt-2 text-sm text-ink-muted">Invoice: {invoiceId}</p>
    </div>
  );
}
