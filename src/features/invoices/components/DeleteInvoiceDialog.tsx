import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { Invoice } from "@/types";

interface DeleteInvoiceDialogProps {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteInvoiceDialog({ invoice, onOpenChange, onConfirm }: DeleteInvoiceDialogProps) {
  const { t } = useTranslation(["common", "invoice"]);

  return (
    <Dialog open={!!invoice} onOpenChange={onOpenChange}>
      {invoice ? (
        <DialogContent title={t("invoice:list.deleteTitle")}>
          <p className="text-sm text-ink-muted">{t("invoice:list.deleteConfirm", { number: invoice.invoiceNumber })}</p>
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
