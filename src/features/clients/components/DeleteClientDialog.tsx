import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { Client } from "@/types";
import { getClientDisplayName } from "@/utils/clientDisplayName";

interface DeleteClientDialogProps {
  client: Client | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** Confirmation dialog shown before a client is permanently deleted. */
export function DeleteClientDialog({ client, onOpenChange, onConfirm }: DeleteClientDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!client} onOpenChange={onOpenChange}>
      {client ? (
        <DialogContent title={t("clients.deleteTitle")}>
          <p className="text-sm text-ink-muted">
            {t("clients.deleteConfirm", { name: getClientDisplayName(client) })}
          </p>
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
