import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { blankInvoiceFormItem } from "@/utils/invoiceFormMapping";
import type { InvoiceFormValues } from "@/schemas";
import type { ProductOrService, Unit } from "@/types";

const UNITS: Unit[] = ["hour", "day", "piece", "kg", "unit", "flatRate"];

interface InvoiceItemsEditorProps {
  products: ProductOrService[];
}

/** Editable line-item table, backed by useFieldArray. Each row can start from a saved product (copied in, not referenced) or be typed manually. */
export function InvoiceItemsEditor({ products }: InvoiceItemsEditorProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const {
    control,
    register,
    setValue,
    formState: { errors }
  } = useFormContext<InvoiceFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const taxRatePercent = useWatch({ control, name: "taxRatePercent" });
  const taxMode = useWatch({ control, name: "taxMode" });
  const showVatColumn = taxMode !== "reverseCharge" && taxMode !== "taxFree";

  function applyProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setValue(`items.${index}.productId`, product.id, { shouldDirty: true });
    setValue(`items.${index}.name`, product.name, { shouldDirty: true });
    setValue(`items.${index}.description`, product.description ?? "", { shouldDirty: true });
    setValue(`items.${index}.unit`, product.unit, { shouldDirty: true });
    setValue(`items.${index}.unitPrice`, product.unitPriceCents / 100, { shouldDirty: true });
    setValue(`items.${index}.vatPercent`, product.defaultVatPercent, { shouldDirty: true });
  }

  const itemsError = errors.items?.message ? t(`validation.${errors.items.message}`) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">{t("invoice:form.items")}</p>
      </div>
      {itemsError ? <p className="text-xs text-danger">{itemsError}</p> : null}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const rowErrors = errors.items?.[index];
          return (
            <div key={field.id} className="space-y-2.5 rounded-lg border border-line bg-surface-raised p-3.5">
              {products.length > 0 ? (
                <Select
                  aria-label={t("invoice:form.pickProduct")}
                  defaultValue=""
                  onChange={(e) => e.target.value && applyProduct(index, e.target.value)}
                >
                  <option value="">{t("invoice:form.pickProduct")}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              ) : null}

              <Input
                placeholder={t("invoice:form.itemName")}
                invalid={!!rowErrors?.name}
                {...register(`items.${index}.name`)}
              />
              {rowErrors?.name ? <p className="text-xs text-danger">{t(`validation.${rowErrors.name.message}`)}</p> : null}

              <Input placeholder={t("invoice:form.itemDescription")} {...register(`items.${index}.description`)} />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    aria-label={t("invoice:fields.quantity", { ns: "invoice" })}
                    invalid={!!rowErrors?.quantity}
                    {...register(`items.${index}.quantity`)}
                  />
                </div>
                <Select aria-label={t("invoice:fields.unit", { ns: "invoice" })} {...register(`items.${index}.unit`)}>
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {t(`products.units.${unit}`)}
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  aria-label={t("invoice:fields.unitPrice", { ns: "invoice" })}
                  invalid={!!rowErrors?.unitPrice}
                  {...register(`items.${index}.unitPrice`)}
                />
              </div>

              {showVatColumn ? (
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  inputMode="decimal"
                  aria-label={t("invoice:fields.vat", { ns: "invoice" })}
                  className="w-28"
                  {...register(`items.${index}.vatPercent`)}
                />
              ) : null}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-ink-faint hover:text-danger"
                >
                  <Trash2 size={14} /> {t("invoice:form.removeItem")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => append(blankInvoiceFormItem(taxRatePercent ?? 19))}
      >
        <Plus size={16} /> {t("invoice:form.addItem")}
      </Button>
    </div>
  );
}
