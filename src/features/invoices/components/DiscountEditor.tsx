import { useFormContext, useWatch } from "react-hook-form";
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
        <Select id="discountType" {...register("discountType")}>
          <option value="none">{t("invoice:form.discountNone")}</option>
          <option value="percent">{t("invoice:form.discountPercent")}</option>
          <option value="fixed">{t("invoice:form.discountFixed")}</option>
        </Select>
      </FormField>
      {discountType !== "none" ? (
        <FormField label={t("invoice:form.discountValue")} htmlFor="discountValue">
          <Input id="discountValue" type="number" step="0.01" min="0" inputMode="decimal" {...register("discountValue")} />
        </FormField>
      ) : null}
    </div>
  );
}
