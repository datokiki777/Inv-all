import type { InvoiceItem, TaxSettings } from "@/types";

/**
 * Country-agnostic tax rule, kept as a pure function next to money.ts:
 * Reverse Charge and tax-free invoices always compute with 0% VAT
 * regardless of what's stored on each line, no matter which country or
 * tax regime the mode represents. "standard"/"custom" use each item's own
 * vatPercent as-is (already supports per-item mixed rates).
 */
export function resolveItemsForTaxMode(items: InvoiceItem[], taxSettings: TaxSettings): InvoiceItem[] {
  if (taxSettings.mode === "reverseCharge" || taxSettings.mode === "taxFree") {
    return items.map((item) => ({ ...item, vatPercent: 0 }));
  }
  return items;
}
