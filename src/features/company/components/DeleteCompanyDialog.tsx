import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import type { Company } from "@/types";

interface DeleteCompanyDialogProps {
  company: Company | null;
  /** True when this is the only remaining company — deleting it would leave no company to issue invoices from. */
  isLast: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/** Confirmation dialog shown before a company is permanently deleted. Blocks deleting the last remaining one. */
export function DeleteCompanyDialog({ company, isLast, onOpenChange, onConfirm }: DeleteCompanyDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!company} onOpenChange={onOpenChange}>
      {company ? (
        <DialogContent title={t("company.deleteTitle")}>
          {isLast ? (
            <p className="text-sm text-ink-muted">{t("company.cannotDeleteLast")}</p>
          ) : (
            <p className="text-sm text-ink-muted">{t("company.deleteConfirm", { name: company.name })}</p>
          )}
          <div className="mt-5 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("actions.cancel")}
            </Button>
            {isLast ? null : (
              <Button type="button" variant="danger" className="flex-1" onClick={onConfirm}>
                {t("actions.delete")}
              </Button>
            )}
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
