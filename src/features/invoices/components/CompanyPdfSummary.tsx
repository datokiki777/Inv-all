import { useTranslation } from "react-i18next";
import { PdfVisibilitySwitch } from "./PdfVisibilitySwitch";
import type { Company } from "@/types";
import type { InvoicePdfVisibility } from "@/types";

interface CompanyPdfSummaryProps {
  company: Company;
}

/**
 * Read-only summary of the optional company fields that CAN appear on the
 * PDF, each with its own "Show in PDF" switch right beside it — instead of
 * a separate grouped settings panel. Only rows the company actually has a
 * value for are shown (nothing to toggle for a field that's empty anyway).
 * Editing the value itself still happens on the Company page.
 */
export function CompanyPdfSummary({ company }: CompanyPdfSummaryProps) {
  const { t } = useTranslation(["common", "invoice"]);

  const allRows: { key: keyof InvoicePdfVisibility; label: string; value?: string }[] = [
    { key: "showCompanyEmail", label: t("invoice:form.visibility.showCompanyEmail"), value: company.email },
    { key: "showCompanyPhone", label: t("invoice:form.visibility.showCompanyPhone"), value: company.phone },
    { key: "showCompanyWebsite", label: t("invoice:form.visibility.showCompanyWebsite"), value: company.website },
    { key: "showCompanyVatId", label: t("invoice:form.visibility.showCompanyVatId"), value: company.vatId },
    { key: "showCompanyTaxNumber", label: t("invoice:form.visibility.showCompanyTaxNumber"), value: company.taxNumber }
  ];
  const rows = allRows.filter((row) => row.value);

  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-line p-3.5">
      <p className="mb-2 text-xs font-medium uppercase text-ink-faint">{t("invoice:form.pdfVisibilityCompany")}</p>
      {/* Scrolls internally once there are more rows than fit comfortably,
          instead of pushing the rest of the form further down the page. */}
      <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
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
