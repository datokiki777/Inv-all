import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { InvoiceFormValues } from "@/schemas";
import type { ProductOrService, Unit } from "@/types";

const UNITS: Unit[] = ["hour", "day", "piece", "kg", "unit", "flatRate"];

interface InvoiceItemRowProps {
  index: number;
  products: ProductOrService[];
  showVatColumn: boolean;
  onRemove: () => void;
}

/**
 * One line-item's fields, as its own component (not inlined in a .map)
 * so each row can call useWatch for its own discountType — conditionally
 * rendering hooks inside a .map callback would break React's rules of
 * hooks the moment rows are added/removed.
 */
export function InvoiceItemRow({ index, products, showVatColumn, onRemove }: InvoiceItemRowProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const {
    control,
    register,
    setValue,
    formState: { errors }
  } = useFormContext<InvoiceFormValues>();

  const discountType = useWatch({ control, name: `items.${index}.discountType` });
  const rowErrors = errors.items?.[index];

  function applyProduct(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setValue(`items.${index}.productId`, product.id, { shouldDirty: true });
    setValue(`items.${index}.name`, product.name, { shouldDirty: true });
    setValue(`items.${index}.description`, product.description ?? "", { shouldDirty: true });
    setValue(`items.${index}.unit`, product.unit, { shouldDirty: true });
    setValue(`items.${index}.unitPrice`, product.unitPriceCents / 100, { shouldDirty: true });
    setValue(`items.${index}.vatPercent`, product.defaultVatPercent, { shouldDirty: true });
  }

  return (
    <div className="space-y-2.5 rounded-lg border border-line bg-surface-raised p-3.5">
      {products.length > 0 ? (
        <Select aria-label={t("invoice:form.pickProduct")} defaultValue="" onChange={(e) => e.target.value && applyProduct(e.target.value)}>
          <option value="">{t("invoice:form.pickProduct")}</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
      ) : null}

      <Input placeholder={t("invoice:form.itemName")} invalid={!!rowErrors?.name} {...register(`items.${index}.name`)} />
      {rowErrors?.name ? <p className="text-xs text-danger">{t(`validation.${rowErrors.name.message}`)}</p> : null}

      <Input placeholder={t("invoice:form.itemDescription")} {...register(`items.${index}.description`)} />

      <div className="grid grid-cols-3 gap-2">
        <Input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          aria-label={t("invoice:fields.quantity", { ns: "invoice" })}
          invalid={!!rowErrors?.quantity}
          {...register(`items.${index}.quantity`)}
        />
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

      <div className="grid grid-cols-3 gap-2">
        <Select aria-label={t("invoice:form.itemDiscount")} {...register(`items.${index}.discountType`)}>
          <option value="none">{t("invoice:form.discountNone")}</option>
          <option value="percent">{t("invoice:form.discountPercent")}</option>
          <option value="fixed">{t("invoice:form.discountFixed")}</option>
        </Select>
        {discountType !== "none" ? (
          <Input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            aria-label={t("invoice:form.discountValue")}
            placeholder={t("invoice:form.discountValue")}
            {...register(`items.${index}.discountValue`)}
          />
        ) : null}
        {showVatColumn ? (
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            inputMode="decimal"
            aria-label={t("invoice:fields.vat", { ns: "invoice" })}
            placeholder={`${t("invoice:fields.vat", { ns: "invoice" })} %`}
            {...register(`items.${index}.vatPercent`)}
          />
        ) : null}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-ink-faint hover:text-danger"
        >
          <Trash2 size={14} /> {t("invoice:form.removeItem")}
        </button>
      </div>
    </div>
  );
}
