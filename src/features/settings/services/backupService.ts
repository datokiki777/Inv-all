import {
  companyRepository,
  clientRepository,
  productRepository,
  invoiceRepository,
  settingsRepository
} from "@/storage/repositories";
import { backupSchema, CURRENT_BACKUP_VERSION, type Backup } from "@/schemas/backup.schema";
import { nowIso } from "@/utils/date";

export type ImportMode = "replace" | "merge";

export interface ImportSummary {
  companies: number;
  clients: number;
  products: number;
  invoices: number;
}

/**
 * Reads every store into one JSON-serializable snapshot. Backup logic
 * stays entirely outside the UI: BackupRestorePage only calls export/
 * validate/import and renders the result.
 */
export const backupService = {
  async exportAll(): Promise<Backup> {
    const [companies, clients, products, invoices, settings] = await Promise.all([
      companyRepository.getAll(),
      clientRepository.getAll(),
      productRepository.getAll(),
      invoiceRepository.getAll(),
      settingsRepository.get()
    ]);

    return {
      version: CURRENT_BACKUP_VERSION,
      exportedAt: nowIso(),
      data: { companies, clients, products, invoices, settings }
    };
  },

  /**
   * Parses + validates untrusted JSON text against backupSchema. Never
   * throws a raw parse/validation error to the caller — returns a
   * discriminated result so the UI can show a safe, specific message
   * instead of crashing on a corrupted or hand-edited file.
   */
  parse(text: string): { success: true; backup: Backup } | { success: false; error: string } {
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return { success: false, error: "invalidJson" };
    }

    const result = backupSchema.safeParse(json);
    if (!result.success) {
      return { success: false, error: "invalidBackupStructure" };
    }
    if (result.data.version > CURRENT_BACKUP_VERSION) {
      return { success: false, error: "unsupportedVersion" };
    }
    return { success: true, backup: result.data };
  },

  /**
   * "replace" clears every data store first, then writes the backup's
   * records. "merge" writes the backup's records on top of what's already
   * there (same-id records are overwritten by the backup; anything not in
   * the backup is left untouched). Settings are always upserted — there's
   * only ever one settings record, so "merge" vs "replace" doesn't apply to it.
   */
  async importAll(backup: Backup, mode: ImportMode): Promise<ImportSummary> {
    if (mode === "replace") {
      await Promise.all([
        companyRepository.clear(),
        clientRepository.clear(),
        productRepository.clear(),
        invoiceRepository.clear()
      ]);
    }

    await Promise.all([
      ...backup.data.companies.map((c) => companyRepository.save(c)),
      ...backup.data.clients.map((c) => clientRepository.save(c)),
      ...backup.data.products.map((p) => productRepository.save(p)),
      ...backup.data.invoices.map((i) => invoiceRepository.save(i)),
      settingsRepository.save(backup.data.settings)
    ]);

    return {
      companies: backup.data.companies.length,
      clients: backup.data.clients.length,
      products: backup.data.products.length,
      invoices: backup.data.invoices.length
    };
  }
};
