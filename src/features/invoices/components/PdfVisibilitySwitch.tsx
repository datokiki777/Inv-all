import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/Switch";
import type { InvoiceFormValues } from "@/schemas";
import type { InvoicePdfVisibility } from "@/types";

interface PdfVisibilitySwitchProps {
  visKey: keyof InvoicePdfVisibility;
  label?: string;
}

/** Thin binding between one InvoicePdfVisibility flag and the shared Switch UI — used inline, right next to whatever field it controls. */
export function PdfVisibilitySwitch({ visKey, label }: PdfVisibilitySwitchProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const { control, setValue } = useFormContext<InvoiceFormValues>();
  const visibility = useWatch({ control, name: "pdfVisibility" });
  const checked = visibility?.[visKey] ?? true;

  return (
    <Switch
      id={visKey}
      checked={checked}
      onCheckedChange={(v) => setValue(`pdfVisibility.${visKey}`, v, { shouldDirty: true })}
      label={label ?? t("invoice:form.showInPdf")}
    />
  );
}
