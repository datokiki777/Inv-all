import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/toast";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductForm } from "@/features/products/components/ProductForm";
import { ProductListItem } from "@/features/products/components/ProductListItem";
import { DeleteProductDialog } from "@/features/products/components/DeleteProductDialog";
import { useAppSettings, localeForLanguage } from "@/features/settings/hooks/useAppSettings";
import type { ProductOrService } from "@/types";
import type { ProductFormValues } from "@/schemas";

export function ProductsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const settings = useAppSettings();
  const { products, allCount, status, query, setQuery, create, update, remove } = useProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductOrService | undefined>();
  const [deletingProduct, setDeletingProduct] = useState<ProductOrService | null>(null);

  const currency = settings?.defaultCurrency ?? "EUR";
  const locale = localeForLanguage(settings?.interfaceLanguage);

  function openCreate() {
    setEditingProduct(undefined);
    setFormOpen(true);
  }

  function openEdit(product: ProductOrService) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleSubmit(values: ProductFormValues) {
    try {
      if (editingProduct) {
        await update(editingProduct, values);
      } else {
        await create(values);
      }
      setFormOpen(false);
      toast.success(t("products.saveSuccess"));
    } catch {
      toast.error(t("products.saveError"));
    }
  }

  async function handleDelete() {
    if (!deletingProduct) return;
    try {
      await remove(deletingProduct.id);
      toast.success(t("products.deleteSuccess"));
    } catch {
      toast.error(t("products.deleteError"));
    } finally {
      setDeletingProduct(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("pages.products")}</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} /> {t("actions.add")}
        </Button>
      </div>

      {allCount > 0 ? (
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("products.searchPlaceholder")}
            className="pl-9"
          />
        </div>
      ) : null}

      {status === "loading" ? <LoadingSpinner label={t("products.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("products.loadError")} description={t("products.loadErrorHint")} />
      ) : null}

      {status === "ready" && allCount === 0 ? <EmptyState title={t("empty.products")} /> : null}

      {status === "ready" && allCount > 0 && products.length === 0 ? (
        <EmptyState title={t("products.noSearchResults")} />
      ) : null}

      {status === "ready" && products.length > 0 ? (
        <div className="space-y-2">
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              currency={currency}
              locale={locale}
              onEdit={() => openEdit(product)}
              onDelete={() => setDeletingProduct(product)}
            />
          ))}
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent title={editingProduct ? t("products.editTitle") : t("products.addTitle")}>
          <ProductForm product={editingProduct} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <DeleteProductDialog
        product={deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
