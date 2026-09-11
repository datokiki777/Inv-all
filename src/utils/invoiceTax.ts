import type { InvoiceItem, TaxSettings } from "@/types";

/**
 * Country-agnostic tax rule, kept as a pure function next to money.ts:
 * Reverse Charge and tax-free invoices always compute with 0% VAT
 * regardless of what's stored on each line, no matter which country or
 * tax regime the mode represents. "standard"/"custom" force every item to
 * the invoice-wide rate (taxSettings.ratePercent) — this used to rely
 * entirely on a React effect in InvoiceItemsEditor keeping items in sync
 * as the rate field changed, which meant a stale per-item vatPercent
 * (e.g. left over from switching out of Reverse Charge, where it's forced
 * to 0) could slip through if that effect didn't fire for any reason.
 * Enforcing it here too — the one place buildInvoiceFromForm always calls
 * through, for both save and live preview — makes "one shared VAT rate"
 * an actual guarantee instead of a UI-only best effort.
 */
export function resolveItemsForTaxMode(items: InvoiceItem[], taxSettings: TaxSettings): InvoiceItem[] {
  if (taxSettings.mode === "reverseCharge" || taxSettings.mode === "taxFree") {
    return items.map((item) => ({ ...item, vatPercent: 0 }));
  }
  if (taxSettings.ratePercent !== undefined) {
    return items.map((item) => ({ ...item, vatPercent: taxSettings.ratePercent! }));
  }
  return items;
}
