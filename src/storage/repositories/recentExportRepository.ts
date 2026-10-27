import { getDb, STORE } from "@/storage/db";
import type { RecentExportRecord } from "@/storage/db";

export const recentExportRepository = {
  /** Most-recently-exported first. */
  async list(): Promise<RecentExportRecord[]> {
    const db = await getDb();
    const all = await db.getAllFromIndex(STORE.recentExports, "by-exportedAt");
    return all.reverse();
  },

  /** Upserts in place (keyed by invoiceId) — re-exporting the same invoice just bumps its timestamp. */
  async record(invoiceId: string, exportedAt: string): Promise<void> {
    const db = await getDb();
    await db.put(STORE.recentExports, { invoiceId, exportedAt });
  },

  async remove(invoiceId: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE.recentExports, invoiceId);
  },

  /** Used by Backup & Restore's "replace" import mode, and to prune beyond the retention cap. */
  async clear(): Promise<void> {
    const db = await getDb();
    await db.clear(STORE.recentExports);
  }
};
