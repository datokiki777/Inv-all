import { useCallback, useEffect, useMemo, useState } from "react";
import { productService } from "@/features/products/services/productService";
import type { ProductOrService } from "@/types";
import type { ProductFormValues } from "@/schemas";

type Status = "loading" | "ready" | "error";

/** Loads all products/services, exposes search + create/update/remove mutators. */
export function useProducts() {
  const [products, setProducts] = useState<ProductOrService[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await productService.list();
      setProducts(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.name, product.description, product.category].filter(Boolean).join(" ").toLowerCase().includes(needle)
    );
  }, [products, query]);

  const create = useCallback(async (values: ProductFormValues) => {
    const created = await productService.create(values);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (existing: ProductOrService, values: ProductFormValues) => {
    const updated = await productService.update(existing, values);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await productService.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { products: filtered, allCount: products.length, status, query, setQuery, create, update, remove, reload };
}
