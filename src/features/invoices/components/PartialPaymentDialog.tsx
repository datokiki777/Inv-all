import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/utils/money";
import { localeForLanguage } from "@/features/settings/hooks/useAppSettings";
import type { Invoice } from "@/types";

interface PartialPaymentDialogProps {
  invoice: Invoice | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paidAmountCents: number) => void;
}

/**
 * Prompts for how much has been paid when an invoice is marked "Partially
 * paid" — the invoice form no longer has a Paid Amount field, so this is
 * the only place that number can be entered. Marking "Paid" instead just
 * assumes full payment automatically, no prompt needed.
 */
export function PartialPaymentDialog({ invoice, onOpenChange, onConfirm }: PartialPaymentDialogProps) {
  const { t, i18n } = useTranslation(["common", "invoice"]);
  const [amount, setAmount] = useState("");

  function handleOpenChange(open: boolean) {
    if (open && invoice) {
      setAmount(invoice.paidAmountCents > 0 ? String(invoice.paidAmountCents / 100) : "");
    }
    onOpenChange(open);
  }

  function handleConfirm() {
    const paidAmountCents = Math.max(0, Math.round(parseFloat(amount || "0") * 100));
    onConfirm(paidAmountCents);
  }

  const locale = localeForLanguage(i18n.language === "de" ? "de" : "en");

  return (
    <Dialog open={!!invoice} onOpenChange={handleOpenChange}>
      {invoice ? (
        <DialogContent title={t("invoice:list.partialPaymentTitle")}>
          <p className="mb-4 text-sm text-ink-muted">
            {t("invoice:list.partialPaymentHint", { total: formatMoney(invoice.totalCents, invoice.currency, locale) })}
          </p>
          <FormField label={t("invoice:list.partialPaymentLabel")} htmlFor="partialPaymentAmount">
            <Input
              id="partialPaymentAmount"
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormField>
          <div className="mt-5 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("actions.cancel")}
            </Button>
            <Button type="button" className="flex-1" onClick={handleConfirm}>
              {t("actions.save")}
            </Button>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
