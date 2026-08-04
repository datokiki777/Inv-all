import { productRepository } from "@/storage/repositories";
import { generateId } from "@/utils/id";
import { nowIso } from "@/utils/date";
import type { ProductOrService } from "@/types";
import type { ProductFormValues } from "@/schemas";

/**
 * Orchestration between the Product form/list and productRepository.
 * The only place that converts the form's decimal `unitPrice` into the
 * integer `unitPriceCents` that gets persisted and used by money.ts.
 */
export const productService = {
  async list(): Promise<ProductOrService[]> {
    return productRepository.getAll();
  },

  async create(values: ProductFormValues): Promise<ProductOrService> {
    const now = nowIso();
    const product: ProductOrService = {
      id: generateId(),
      name: values.name,
      description: values.description,
      unitPriceCents: Math.round(values.unitPrice * 100),
      unit: values.unit,
      defaultVatPercent: values.defaultVatPercent,
      category: values.category,
      createdAt: now,
      updatedAt: now
    };
    await productRepository.save(product);
    return product;
  },

  async update(existing: ProductOrService, values: ProductFormValues): Promise<ProductOrService> {
    const product: ProductOrService = {
      id: existing.id,
      name: values.name,
      description: values.description,
      unitPriceCents: Math.round(values.unitPrice * 100),
      unit: values.unit,
      defaultVatPercent: values.defaultVatPercent,
      category: values.category,
      createdAt: existing.createdAt,
      updatedAt: nowIso()
    };
    await productRepository.save(product);
    return product;
  },

  async remove(id: string): Promise<void> {
    await productRepository.remove(id);
  }
};
