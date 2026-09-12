import { Controller, useFormContext, useWatch } from "react-hook-form";
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
  const { register, control, setValue } = useFormContext<InvoiceFormValues>();
  const taxMode = useWatch({ control, name: "taxMode" });

  return (
    <div className="space-y-3 rounded-lg border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{t("invoice:form.taxSettings")}</p>
        {/* Shown for every mode now — the VAT Summary table always renders
            on the PDF (a percentage for Standard/Custom, the tax
            treatment itself for Reverse Charge/Tax-free), so whether to
            show it is a real choice regardless of which mode is active. */}
        <PdfVisibilitySwitch visKey="showVatSummaryTable" />
      </div>

      <FormField label={t("invoice:form.taxMode")} htmlFor="taxMode">
        <Controller
          control={control}
          name="taxMode"
          render={({ field }) => (
            <Select
              id="taxMode"
              value={field.value}
              onChange={(newMode) => {
                field.onChange(newMode);

                // The explanation textarea is only shown for reverseCharge/custom
                // — leaving whatever was typed there sitting in the form's
                // hidden state after switching to standard/taxFree meant it
                // could resurface later (e.g. re-appear as the VAT summary's
                // label text for Tax-free) even though it no longer applies
                // to the newly-selected mode. Clearing it here makes each
                // mode's display fully determined by ITS OWN inputs, not by
                // whatever a previous mode left behind.
                const explanationStillApplies = newMode === "reverseCharge" || newMode === "custom";
                if (!explanationStillApplies) {
                  setValue("taxExplanationText", "", { shouldDirty: true });
                }

                // Standard and Custom share the same taxRatePercent input,
                // but they're different VAT options — a rate typed while on
                // Standard silently carrying over to Custom (or vice versa)
                // made the two modes look identical whenever the number
                // happened to match. Reset it to the same default every
                // time the mode changes, so neither mode "inherits" a value
                // that was really entered for the other one.
                const rateApplies = newMode === "standard" || newMode === "custom";
                setValue("taxRatePercent", rateApplies ? 19 : undefined, { shouldDirty: true });
              }}
              options={MODES.map((mode) => ({ value: mode, label: t(`invoice:form.taxModes.${mode}`) }))}
            />
          )}
        />
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
