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

/**
 * Natural-order comparison for invoice numbers ("INV-2026-9" < "INV-2026-10"),
 * not plain string comparison — a numberFormat without zero-padding, or a
 * manually-typed custom number, would otherwise sort "10" before "9". Splits
 * into digit / non-digit runs and compares digit runs numerically.
 */
export function compareInvoiceNumbers(a: string, b: string): number {
  const chunk = (s: string) => s.match(/\d+|\D+/g) ?? [];
  const chunksA = chunk(a);
  const chunksB = chunk(b);
  const len = Math.max(chunksA.length, chunksB.length);

  for (let i = 0; i < len; i++) {
    const partA = chunksA[i] ?? "";
    const partB = chunksB[i] ?? "";
    if (partA === partB) continue;

    const numA = /^\d+$/.test(partA) ? Number(partA) : NaN;
    const numB = /^\d+$/.test(partB) ? Number(partB) : NaN;
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
      if (numA !== numB) return numA - numB;
      continue;
    }
    return partA < partB ? -1 : 1;
  }
  return 0;
}
