import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PdfVisibilitySwitch } from "./PdfVisibilitySwitch";
import type { InvoiceFormValues } from "@/schemas";
import type { ProductOrService, Unit } from "@/types";

const UNITS: Unit[] = ["hour", "day", "piece", "kg", "unit", "flatRate"];

interface InvoiceItemRowProps {
  index: number;
  products: ProductOrService[];
  /** Show the "Show in PDF" switches for Discount/Unit on this row — these are
   *  whole-table settings, not per-item, so only the first row renders them. */
  showVisibilityToggles: boolean;
  onRemove: () => void;
}

/**
 * One line-item's fields, as its own component (not inlined in a .map)
 * so each row can call useWatch for its own discountType — conditionally
 * rendering hooks inside a .map callback would break React's rules of
 * hooks the moment rows are added/removed.
 *
 * VAT is set once for the whole invoice (see TaxSettingsEditor's "VAT
 * rate") rather than per item — InvoiceItemsEditor keeps every row's
 * vatPercent in sync with that single rate, so there's no VAT input here.
 */
export function InvoiceItemRow({ index, products, showVisibilityToggles, onRemove }: InvoiceItemRowProps) {
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

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-[10px] uppercase text-ink-faint">{t("invoice:fields.quantity", { ns: "invoice" })}</p>
          <Input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            invalid={!!rowErrors?.quantity}
            {...register(`items.${index}.quantity`)}
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] uppercase text-ink-faint">{t("invoice:fields.unitPrice", { ns: "invoice" })}</p>
          <Input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            invalid={!!rowErrors?.unitPrice}
            {...register(`items.${index}.unitPrice`)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[10px] uppercase text-ink-faint">{t("invoice:fields.discount", { ns: "invoice" })}</p>
            {showVisibilityToggles ? <PdfVisibilitySwitch visKey="showItemDiscount" /> : null}
          </div>
          <Select {...register(`items.${index}.discountType`)}>
            <option value="none">{t("invoice:form.discountNone")}</option>
            <option value="percent">{t("invoice:form.discountPercent")}</option>
            <option value="fixed">{t("invoice:form.discountFixed")}</option>
          </Select>
        </div>
        {discountType !== "none" ? (
          <div>
            <p className="mb-1 text-[10px] uppercase text-ink-faint">{t("invoice:form.discountValue")}</p>
            <Input type="number" step="0.01" min="0" inputMode="decimal" {...register(`items.${index}.discountValue`)} />
          </div>
        ) : null}
        {/* col-start-3 pins Unit to the rightmost slot regardless of whether Discount Value (the middle slot) is rendered. */}
        <div className="col-start-3">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[10px] uppercase text-ink-faint">{t("invoice:fields.unit", { ns: "invoice" })}</p>
            {showVisibilityToggles ? <PdfVisibilitySwitch visKey="showItemUnitColumn" /> : null}
          </div>
          <Select {...register(`items.${index}.unit`)}>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t(`products.units.${unit}`)}
              </option>
            ))}
          </Select>
        </div>
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
