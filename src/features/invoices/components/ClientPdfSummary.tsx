import { useTranslation } from "react-i18next";
import { PdfVisibilitySwitch } from "./PdfVisibilitySwitch";
import type { Client, InvoicePdfVisibility } from "@/types";

interface ClientPdfSummaryProps {
  client: Client | undefined;
}

/** Same pattern as CompanyPdfSummary, for the currently selected client. Renders nothing until a client is picked. */
export function ClientPdfSummary({ client }: ClientPdfSummaryProps) {
  const { t } = useTranslation(["common", "invoice"]);
  if (!client) return null;

  const allRows: { key: keyof InvoicePdfVisibility; label: string; value?: string }[] = [
    { key: "showClientEmail", label: t("invoice:visibility.showClientEmail"), value: client.email },
    { key: "showClientPhone", label: t("invoice:visibility.showClientPhone"), value: client.phone },
    { key: "showClientVatId", label: t("invoice:visibility.showClientVatId"), value: client.vatId },
    { key: "showClientTaxNumber", label: t("invoice:visibility.showClientTaxNumber"), value: client.taxNumber }
  ];
  const rows = allRows.filter((row) => row.value);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-line p-3.5">
      <p className="mb-2 text-xs font-medium uppercase text-ink-faint">{t("invoice:form.pdfVisibilityClient")}</p>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm text-ink">{row.value}</p>
              <p className="text-[11px] text-ink-faint">{row.label}</p>
            </div>
            <PdfVisibilitySwitch visKey={row.key} />
          </div>
        ))}
      </div>
    </div>
  );
}
