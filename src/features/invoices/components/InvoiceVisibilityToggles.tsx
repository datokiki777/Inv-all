import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/utils/cn";
import type { InvoiceFormValues } from "@/schemas";
import type { InvoicePdfVisibility } from "@/types";

/**
 * "Show in PDF" switches for optional fields/sections — inspired by
 * EasyInvoicePDF. Data stays in the form/Company/Client either way; these
 * only control what's printed, so the same filled-in email or VAT number
 * can be shown on one invoice and hidden on the next without re-entering
 * anything.
 */
export function InvoiceVisibilityToggles() {
  const { t } = useTranslation(["common", "invoice"]);
  const { control, setValue } = useFormContext<InvoiceFormValues>();
  const [expanded, setExpanded] = useState(false);
  const visibility = useWatch({ control, name: "pdfVisibility" });

  function toggle(key: keyof InvoicePdfVisibility, value: boolean) {
    setValue(`pdfVisibility.${key}`, value, { shouldDirty: true });
  }

  return (
    <div className="rounded-lg border border-line">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-ink">{t("invoice:form.pdfVisibility")}</span>
        <ChevronDown size={18} className={cn("text-ink-faint transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded ? (
        <div className="space-y-3 border-t border-line px-4 py-3.5">
          <div>
            <p className="mb-1 text-xs font-medium uppercase text-ink-faint">{t("invoice:form.pdfVisibilityCompany")}</p>
            {(["showCompanyEmail", "showCompanyPhone", "showCompanyVatId", "showCompanyTaxNumber"] as const).map((key) => (
              <Switch
                key={key}
                id={key}
                checked={visibility?.[key] ?? true}
                onCheckedChange={(v) => toggle(key, v)}
                label={t(`invoice:form.visibility.${key}`)}
              />
            ))}
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase text-ink-faint">{t("invoice:form.pdfVisibilityClient")}</p>
            {(["showClientEmail", "showClientPhone", "showClientVatId", "showClientTaxNumber"] as const).map((key) => (
              <Switch
                key={key}
                id={key}
                checked={visibility?.[key] ?? true}
                onCheckedChange={(v) => toggle(key, v)}
                label={t(`invoice:form.visibility.${key}`)}
              />
            ))}
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase text-ink-faint">{t("invoice:form.pdfVisibilityOther")}</p>
            {(["showBankDetails", "showNotes", "showItemUnitColumn", "showVatSummaryTable"] as const).map((key) => (
              <Switch
                key={key}
                id={key}
                checked={visibility?.[key] ?? true}
                onCheckedChange={(v) => toggle(key, v)}
                label={t(`invoice:form.visibility.${key}`)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
