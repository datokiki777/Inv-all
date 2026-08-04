import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import type { InvoiceFormValues } from "@/schemas";

/** Invoice-level discount: none, percent, or a fixed amount. */
export function DiscountEditor() {
  const { t } = useTranslation(["common", "invoice"]);
  const { register, control } = useFormContext<InvoiceFormValues>();
  const discountType = useWatch({ control, name: "discountType" });

  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label={t("invoice:fields.discount", { ns: "invoice" })} htmlFor="discountType">
        <Controller
          control={control}
          name="discountType"
          render={({ field }) => (
            <Select
              id="discountType"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "none", label: t("invoice:form.discountNone") },
                { value: "percent", label: t("invoice:form.discountPercent") },
                { value: "fixed", label: t("invoice:form.discountFixed") }
              ]}
            />
          )}
        />
      </FormField>
      {discountType !== "none" ? (
        <FormField label={t("invoice:form.discountValue")} htmlFor="discountValue">
          <Input id="discountValue" type="number" step="0.01" min="0" inputMode="decimal" {...register("discountValue")} />
        </FormField>
      ) : null}
    </div>
  );
}
