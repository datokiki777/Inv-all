import { useTranslation } from "react-i18next";
import { PdfVisibilitySwitch } from "./PdfVisibilitySwitch";
import type { Company } from "@/types";
import type { InvoicePdfVisibility } from "@/types";

interface CompanyPdfSummaryProps {
  company: Company | undefined;
}

/**
 * Read-only summary of the optional company fields that CAN appear on the
 * PDF, each with its own "Show in PDF" switch right beside it — instead of
 * a separate grouped settings panel. Only rows the company actually has a
 * value for are shown (nothing to toggle for a field that's empty anyway).
 * Editing the value itself still happens on the Company page. Scrolls
 * internally past a handful of rows so this box doesn't push the rest of
 * the form further down as more fields become toggleable here.
 */
export function CompanyPdfSummary({ company }: CompanyPdfSummaryProps) {
  const { t } = useTranslation(["common", "invoice"]);
  if (!company) return null;

  const allTextRows: { key: keyof InvoicePdfVisibility; label: string; value?: string }[] = [
    { key: "showCompanyEmail", label: t("invoice:form.visibility.showCompanyEmail"), value: company.email },
    { key: "showCompanyPhone", label: t("invoice:form.visibility.showCompanyPhone"), value: company.phone },
    { key: "showCompanyWebsite", label: t("invoice:form.visibility.showCompanyWebsite"), value: company.website },
    { key: "showCompanyVatId", label: t("invoice:form.visibility.showCompanyVatId"), value: company.vatId },
    { key: "showCompanyTaxNumber", label: t("invoice:form.visibility.showCompanyTaxNumber"), value: company.taxNumber }
  ];
  const textRows = allTextRows.filter((row) => row.value);

  const hasLogo = !!company.logoDataUrl;

  if (textRows.length === 0 && !hasLogo) return null;

  return (
    <div className="rounded-lg border border-line p-3.5">
      <p className="mb-2 text-xs font-medium uppercase text-ink-faint">{t("invoice:form.pdfVisibilityCompany")}</p>
      <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
        {hasLogo ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={company.logoDataUrl} alt="" className="h-8 w-8 rounded object-contain" />
              <p className="text-[11px] text-ink-faint">{t("invoice:form.visibility.showCompanyLogo")}</p>
            </div>
            <PdfVisibilitySwitch visKey="showCompanyLogo" />
          </div>
        ) : null}
        {textRows.map((row) => (
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
