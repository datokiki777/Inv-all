/**
 * Parses a simple template like "INV-{YYYY}-{seq:4}" into a concrete
 * invoice number. Kept deliberately tiny — no locale/date library needed.
 */
export function generateInvoiceNumber(format: string, sequence: number, date = new Date()): string {
  return format
    .replace("{YYYY}", String(date.getFullYear()))
    .replace("{MM}", String(date.getMonth() + 1).padStart(2, "0"))
    .replace(/\{seq:(\d+)\}/, (_match, width: string) => String(sequence).padStart(Number(width), "0"))
    .replace("{seq}", String(sequence));
}
