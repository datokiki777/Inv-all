import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { PdfVisibilitySwitch } from "./PdfVisibilitySwitch";
import type { InvoiceFormValues } from "@/schemas";
import type { TaxMode } from "@/types";

const MODES: TaxMode[] = ["standard", "reverseCharge", "taxFree", "custom"];

/** Country-agnostic tax mode picker: standard rate, reverse charge, tax-free, or a custom free-text explanation. */
export function TaxSettingsEditor() {
  const { t } = useTranslation(["common", "invoice"]);
  const { register, control } = useFormContext<InvoiceFormValues>();
  const taxMode = useWatch({ control, name: "taxMode" });
  const hasVatRate = taxMode !== "reverseCharge" && taxMode !== "taxFree";

  return (
    <div className="space-y-3 rounded-lg border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{t("invoice:form.taxSettings")}</p>
        {hasVatRate ? <PdfVisibilitySwitch visKey="showVatSummaryTable" /> : null}
      </div>

      <FormField label={t("invoice:form.taxMode")} htmlFor="taxMode">
        <Select id="taxMode" {...register("taxMode")}>
          {MODES.map((mode) => (
            <option key={mode} value={mode}>
              {t(`invoice:form.taxModes.${mode}`)}
            </option>
          ))}
        </Select>
      </FormField>

      {taxMode === "standard" || taxMode === "custom" ? (
        <FormField label={t("invoice:form.taxRatePercent")} htmlFor="taxRatePercent">
          <Input id="taxRatePercent" type="number" step="0.1" min="0" max="100" inputMode="decimal" {...register("taxRatePercent")} />
        </FormField>
      ) : null}

      {taxMode === "reverseCharge" || taxMode === "custom" ? (
        <FormField
          label={t("invoice:form.taxExplanationText")}
          htmlFor="taxExplanationText"
          hint={taxMode === "reverseCharge" ? t("invoice:form.reverseChargeHint") : undefined}
        >
          <Textarea
            id="taxExplanationText"
            placeholder={taxMode === "reverseCharge" ? t("invoice:reverseChargeNote") : ""}
            {...register("taxExplanationText")}
          />
        </FormField>
      ) : null}
    </div>
  );
}
