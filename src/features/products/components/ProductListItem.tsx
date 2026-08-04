import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProductOrService } from "@/types";
import { formatMoney } from "@/utils/money";

interface ProductListItemProps {
  product: ProductOrService;
  currency: string;
  locale: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductListItem({ product, currency, locale, onEdit, onDelete }: ProductListItemProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3.5">
      <button type="button" onClick={onEdit} className="flex-1 text-left">
        <p className="text-sm font-medium text-ink">{product.name}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {formatMoney(product.unitPriceCents, currency, locale)} / {t(`products.units.${product.unit}`)}
          {product.category ? ` · ${product.category}` : ""}
        </p>
      </button>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={t("actions.edit")}
          className="rounded p-2 text-ink-faint hover:bg-surface-sunken hover:text-ink"
        >
          <Pencil size={17} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={t("actions.delete")}
          className="rounded p-2 text-ink-faint hover:bg-surface-sunken hover:text-danger"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}
