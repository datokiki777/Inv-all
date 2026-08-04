import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { productFormSchema, type ProductFormValues } from "@/schemas";
import type { ProductOrService, Unit } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const UNITS: Unit[] = ["hour", "day", "piece", "kg", "unit", "flatRate"];

interface ProductFormProps {
  product?: ProductOrService;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}

function toDefaultValues(product: ProductOrService | undefined): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    unitPrice: product ? product.unitPriceCents / 100 : 0,
    unit: product?.unit ?? "hour",
    defaultVatPercent: product?.defaultVatPercent ?? 19,
    category: product?.category ?? ""
  };
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: toDefaultValues(product)
  });

  function err(key: keyof ProductFormValues) {
    const message = errors[key]?.message;
    return message ? t(`validation.${message}`) : undefined;
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <FormField label={t("products.name")} htmlFor="name" required error={err("name")}>
        <Input id="name" invalid={!!errors.name} {...register("name")} />
      </FormField>

      <FormField label={t("products.description")} htmlFor="description">
        <Textarea id="description" {...register("description")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("products.unitPrice")} htmlFor="unitPrice" required error={err("unitPrice")}>
          <Input id="unitPrice" type="number" step="0.01" min="0" inputMode="decimal" invalid={!!errors.unitPrice} {...register("unitPrice")} />
        </FormField>
        <FormField label={t("products.unit")} htmlFor="unit">
          <Controller
            control={control}
            name="unit"
            render={({ field }) => (
              <Select
                id="unit"
                value={field.value}
                onChange={field.onChange}
                options={UNITS.map((unit) => ({ value: unit, label: t(`products.units.${unit}`) }))}
              />
            )}
          />
        </FormField>
      </div>

      <FormField label={t("products.defaultVatPercent")} htmlFor="defaultVatPercent" error={err("defaultVatPercent")}>
        <Input
          id="defaultVatPercent"
          type="number"
          step="0.1"
          min="0"
          max="100"
          inputMode="decimal"
          invalid={!!errors.defaultVatPercent}
          {...register("defaultVatPercent")}
        />
      </FormField>

      <FormField label={t("products.category")} htmlFor="category">
        <Input id="category" {...register("category")} />
      </FormField>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? t("actions.saving") : t("actions.save")}
        </Button>
      </div>
    </form>
  );
}
