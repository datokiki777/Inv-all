import type { Discount, InvoiceItem } from "@/types";

/**
 * All money math happens here, in integer cents, so floating-point drift
 * never enters the picture. Nothing in this file touches formatting,
 * storage, or React — it is pure input -> output.
 */

export function round(cents: number): number {
  return Math.round(cents);
}

export function itemGrossBeforeDiscount(item: Pick<InvoiceItem, "quantity" | "unitPriceCents">): number {
  return round(item.quantity * item.unitPriceCents);
}

export function applyDiscount(amountCents: number, discount?: Discount): number {
  if (!discount) return amountCents;
  if (discount.type === "percent") {
    return round(amountCents * (1 - discount.value / 100));
  }
  return Math.max(0, amountCents - round(discount.value));
}

export function discountAmount(amountCents: number, discount?: Discount): number {
  return amountCents - applyDiscount(amountCents, discount);
}

/** Net total for a single line, after its own per-item discount. */
export function itemTotal(item: InvoiceItem): number {
  return applyDiscount(itemGrossBeforeDiscount(item), item.discount);
}

/** Sum of all line totals, before any invoice-level discount. */
export function subtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + itemTotal(item), 0);
}

/** Invoice-level discount applied on top of the subtotal. */
export function invoiceDiscountAmount(subtotalCents: number, discount?: Discount): number {
  return discountAmount(subtotalCents, discount);
}

export function taxableAmount(subtotalCents: number, discount?: Discount): number {
  return applyDiscount(subtotalCents, discount);
}

/**
 * VAT is computed per line (so mixed rates are correct) proportionally to
 * how much of the invoice-level discount each line absorbed, then summed
 * and rounded once at the end to avoid cent drift across many lines.
 */
export function vatTotal(items: InvoiceItem[], invoiceLevelDiscount?: Discount): number {
  const rawSubtotal = subtotal(items);
  if (rawSubtotal === 0) return 0;

  const discountedSubtotal = taxableAmount(rawSubtotal, invoiceLevelDiscount);
  const factor = discountedSubtotal / rawSubtotal;

  const vat = items.reduce((sum, item) => {
    const lineTaxable = itemTotal(item) * factor;
    return sum + lineTaxable * (item.vatPercent / 100);
  }, 0);

  return round(vat);
}

export function grandTotal(taxableAmountCents: number, vatCents: number): number {
  return taxableAmountCents + vatCents;
}

export interface VatBreakdownRow {
  vatPercent: number;
  netCents: number;
  vatCents: number;
}

/**
 * Per-rate VAT breakdown (e.g. "19%: net 950.00 / VAT 180.50"), using the
 * exact same proportional-discount distribution as vatTotal() above, so
 * the rows always sum to the same overall VAT total shown elsewhere.
 */
export function computeVatBreakdown(items: InvoiceItem[], invoiceLevelDiscount?: Discount): VatBreakdownRow[] {
  const rawSubtotal = subtotal(items);
  if (rawSubtotal === 0) return [];

  const discountedSubtotal = taxableAmount(rawSubtotal, invoiceLevelDiscount);
  const factor = discountedSubtotal / rawSubtotal;

  const netByRate = new Map<number, number>();
  for (const item of items) {
    const lineTaxable = itemTotal(item) * factor;
    netByRate.set(item.vatPercent, (netByRate.get(item.vatPercent) ?? 0) + lineTaxable);
  }

  return Array.from(netByRate.entries())
    .sort(([a], [b]) => a - b)
    .map(([vatPercent, rawNetCents]) => {
      const netCents = round(rawNetCents);
      const vatCents = round(rawNetCents * (vatPercent / 100));
      return { vatPercent, netCents, vatCents };
    });
}

export function remainingAmount(totalCents: number, paidAmountCents: number): number {
  return totalCents - paidAmountCents;
}

export interface InvoiceTotals {
  subtotalCents: number;
  discountCents: number;
  taxableAmountCents: number;
  vatCents: number;
  totalCents: number;
  remainingAmountCents: number;
}

/** Single entry point the invoice form and repositories should call. */
export function computeInvoiceTotals(
  items: InvoiceItem[],
  invoiceLevelDiscount: Discount | undefined,
  paidAmountCents: number
): InvoiceTotals {
  const subtotalCents = subtotal(items);
  const discountCents = invoiceDiscountAmount(subtotalCents, invoiceLevelDiscount);
  const taxableAmountCents = taxableAmount(subtotalCents, invoiceLevelDiscount);
  const vatCents = vatTotal(items, invoiceLevelDiscount);
  const totalCents = grandTotal(taxableAmountCents, vatCents);
  const remainingAmountCents = remainingAmount(totalCents, paidAmountCents);

  return { subtotalCents, discountCents, taxableAmountCents, vatCents, totalCents, remainingAmountCents };
}

/** Format cents as a localized money string, e.g. formatMoney(129900, "EUR", "de") -> "1.299,00 €". */
export function formatMoney(cents: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}
