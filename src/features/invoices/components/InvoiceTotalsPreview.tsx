import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { computeInvoiceTotals, formatMoney } from "@/utils/money";
import { resolveItemsForTaxMode } from "@/utils/invoiceTax";
import { formDiscountToDiscount, formItemsToInvoiceItems } from "@/utils/invoiceFormMapping";
import { localeForLanguage } from "@/features/settings/hooks/useAppSettings";
import type { InvoiceFormValues } from "@/schemas";

/**
 * Live totals, recomputed on every keystroke from the exact same pure
 * functions (resolveItemsForTaxMode + computeInvoiceTotals) that
 * invoiceService uses on save — so what the user sees while typing is
 * guaranteed to match what gets persisted.
 */
export function InvoiceTotalsPreview() {
  const { t } = useTranslation(["common", "invoice"]);
  const { control } = useFormContext<InvoiceFormValues>();
  const values = useWatch({ control });

  const items = formItemsToInvoiceItems(values.items ?? []);
  const taxSettings = { mode: values.taxMode ?? "standard", ratePercent: values.taxRatePercent, explanationText: values.taxExplanationText };
  const resolvedItems = resolveItemsForTaxMode(items, taxSettings);
  const discount = formDiscountToDiscount(values.discountType ?? "none", values.discountValue);
  const paidAmountCents = Math.round((values.paidAmount || 0) * 100);
  const totals = computeInvoiceTotals(resolvedItems, discount, paidAmountCents);

  const currency = values.currency || "EUR";
  const locale = localeForLanguage(values.pdfLanguage as "de" | "en" | undefined);
  const fmt = (cents: number) => formatMoney(cents, currency, locale);

  return (
    <div className="space-y-1.5 rounded-lg border border-line bg-surface-raised p-4 text-sm">
      <Row label={t("invoice:fields.subtotal", { ns: "invoice" })} value={fmt(totals.subtotalCents)} />
      {totals.discountCents > 0 ? <Row label={t("invoice:fields.discount", { ns: "invoice" })} value={`-${fmt(totals.discountCents)}`} /> : null}
      {taxSettings.mode !== "reverseCharge" && taxSettings.mode !== "taxFree" ? (
        <Row label={t("invoice:fields.vat", { ns: "invoice" })} value={fmt(totals.vatCents)} />
      ) : null}
      <div className="my-1.5 border-t border-line" />
      <Row label={t("invoice:fields.total", { ns: "invoice" })} value={fmt(totals.totalCents)} emphasize />
      {paidAmountCents > 0 ? (
        <>
          <Row label={t("invoice:fields.paid", { ns: "invoice" })} value={fmt(paidAmountCents)} />
          <Row label={t("invoice:fields.remaining", { ns: "invoice" })} value={fmt(totals.remainingAmountCents)} />
        </>
      ) : null}
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={`flex justify-between ${emphasize ? "text-base font-medium text-ink" : "text-ink-muted"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
