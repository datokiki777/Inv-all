import { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { blankInvoiceFormItem } from "@/utils/invoiceFormMapping";
import { InvoiceItemRow } from "./InvoiceItemRow";
import { ClientItemTemplatePicker } from "./ClientItemTemplatePicker";
import type { InvoiceFormValues } from "@/schemas";
import type { Client, ProductOrService } from "@/types";

interface InvoiceItemsEditorProps {
  products: ProductOrService[];
  client: Client | undefined;
  onClientUpdated: (client: Client) => void;
}

/**
 * Editable line-item table, backed by useFieldArray. Each row can start
 * from a saved product (copied in, not referenced) or be typed manually.
 * VAT is set once for the whole invoice (TaxSettingsEditor's "VAT rate"),
 * so every item's vatPercent is kept in lockstep with it here — there's
 * no per-item VAT input.
 */
export function InvoiceItemsEditor({ products, client, onClientUpdated }: InvoiceItemsEditorProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const {
    control,
    setValue,
    getValues,
    formState: { errors }
  } = useFormContext<InvoiceFormValues>();
  const { fields, append, remove, replace } = useFieldArray({ control, name: "items" });
  const taxRatePercent = useWatch({ control, name: "taxRatePercent" });
  const taxMode = useWatch({ control, name: "taxMode" });
  const hasVatRate = taxMode === "standard" || taxMode === "custom";

  useEffect(() => {
    if (!hasVatRate) return;
    const items = getValues("items");
    items.forEach((_, index) => {
      setValue(`items.${index}.vatPercent`, taxRatePercent ?? 0, { shouldDirty: false });
    });
    // Only re-sync when the shared rate (or how many rows exist) changes —
    // not on every keystroke elsewhere in the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxRatePercent, hasVatRate, fields.length]);

  const itemsError = errors.items?.message ? t(`validation.${errors.items.message}`) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{t("invoice:form.items")}</p>
      </div>
      {itemsError ? <p className="text-xs text-danger">{itemsError}</p> : null}

      <ClientItemTemplatePicker client={client} replace={replace} onClientUpdated={onClientUpdated} />

      <div className="space-y-3">
        {fields.map((field, index) => (
          <InvoiceItemRow
            key={field.id}
            index={index}
            products={products}
            showVisibilityToggles={index === 0}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={() => append(blankInvoiceFormItem(taxRatePercent ?? 19))}>
        <Plus size={16} /> {t("invoice:form.addItem")}
      </Button>
    </div>
  );
}
