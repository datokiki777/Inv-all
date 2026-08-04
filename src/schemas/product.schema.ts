import { z } from "zod";

export const unitSchema = z.enum(["hour", "day", "piece", "kg", "unit", "flatRate"]);

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "productNameRequired"),
  description: z.string().optional(),
  unitPriceCents: z.number().int().min(0),
  unit: unitSchema,
  defaultVatPercent: z.number().min(0).max(100),
  category: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

/**
 * Form-input schema: the user types a decimal price ("unitPrice", e.g.
 * 45.5) rather than integer cents. productService is the one place that
 * converts it to unitPriceCents before it ever reaches storage.
 */
export const productFormSchema = z.object({
  name: z.string().min(1, "productNameRequired"),
  description: z.string().optional(),
  unitPrice: z.coerce.number({ invalid_type_error: "unitPriceRequired" }).min(0, "unitPriceRequired"),
  unit: unitSchema,
  defaultVatPercent: z.coerce.number().min(0, "vatPercentInvalid").max(100, "vatPercentInvalid"),
  category: z.string().optional()
});
