import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { ProductOrService } from "@/types";

interface DeleteProductDialogProps {
  product: ProductOrService | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProductDialog({ product, onOpenChange, onConfirm }: DeleteProductDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      {product ? (
        <DialogContent title={t("products.deleteTitle")}>
          <p className="text-sm text-ink-muted">{t("products.deleteConfirm", { name: product.name })}</p>
          <div className="mt-5 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("actions.cancel")}
            </Button>
            <Button type="button" variant="danger" className="flex-1" onClick={onConfirm}>
              {t("actions.delete")}
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
