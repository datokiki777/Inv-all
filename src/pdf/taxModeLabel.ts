import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "./types";

/**
 * What appears in the VAT Summary's rate column for Reverse Charge /
 * Tax-free invoices, in place of a percentage — the invoice's own typed
 * explanation if there is one, otherwise a short default label. Shared so
 * the summary table is the single place this shows (no separate footer
 * note duplicating it).
 */
export function taxModeLabel(invoice: Invoice, labels: InvoicePdfLabels): string {
  if (invoice.taxSettings.explanationText) return invoice.taxSettings.explanationText;
  if (invoice.taxSettings.mode === "reverseCharge") return labels.reverseChargeNote;
  if (invoice.taxSettings.mode === "taxFree") return labels.taxFreeNote;
  return "";
}
