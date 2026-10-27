import { recentExportRepository, invoiceRepository } from "@/storage/repositories";
import { nowIso } from "@/utils/date";
import type { Invoice } from "@/types";

export interface RecentExportEntry {
  invoice: Invoice;
  exportedAt: string;
}

/** Beyond this many tracked invoices, the oldest-exported drop off — this is just a quick-access shortcut list, not an archive. */
const RETENTION_CAP = 30;

export const recentExportService = {
  /** Call this whenever a PDF is downloaded or shared — upserts the invoice to the top of the list. */
  async recordExport(invoiceId: string): Promise<void> {
    await recentExportRepository.record(invoiceId, nowIso());
    await pruneToCap();
  },

  /**
   * Most-recently-exported invoices, newest first, joined with their
   * current invoice data (so the Dashboard always shows up-to-date
   * numbers/status even if the invoice changed since it was exported —
   * only the "when" is remembered, never a snapshot of the PDF itself).
   * An export record whose invoice no longer exists is silently skipped
   * (normally cleaned up via removeForInvoice on delete, but this is a
   * defensive fallback either way).
   */
  async listRecent(limit = 6): Promise<RecentExportEntry[]> {
    const records = await recentExportRepository.list();
    const entries: RecentExportEntry[] = [];
    for (const record of records) {
      if (entries.length >= limit) break;
      const invoice = await invoiceRepository.getById(record.invoiceId);
      if (invoice) entries.push({ invoice, exportedAt: record.exportedAt });
    }
    return entries;
  },

  /** Called when an invoice is deleted, so its export record doesn't linger as an orphan. */
  async removeForInvoice(invoiceId: string): Promise<void> {
    await recentExportRepository.remove(invoiceId);
  }
};

async function pruneToCap(): Promise<void> {
  const all = await recentExportRepository.list();
  if (all.length <= RETENTION_CAP) return;
  for (const record of all.slice(RETENTION_CAP)) {
    await recentExportRepository.remove(record.invoiceId);
  }
}
