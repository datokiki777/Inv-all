import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export function EditInvoicePage() {
  const { t } = useTranslation();
  const { invoiceId } = useParams();
  return (
    <div>
      <h1 className="font-display text-2xl text-ink">{t("pages.editInvoice")}</h1>
      <p className="mt-2 text-sm text-ink-muted">Invoice: {invoiceId}</p>
    </div>
  );
}
