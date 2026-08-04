import { getDb, STORE, type InvoiceDraftRecord } from "@/storage/db";

/**
 * Scratch storage for in-progress Invoice forms, separate from the real
 * invoices store. Written on a debounce while typing, read once on form
 * mount to offer "restore your unsaved draft?", and cleared on submit.
 */
export const invoiceDraftRepository = {
  async get(key: string): Promise<InvoiceDraftRecord | undefined> {
    const db = await getDb();
    return db.get(STORE.invoiceDrafts, key);
  },

  async save(key: string, values: unknown, savedAt: string): Promise<void> {
    const db = await getDb();
    await db.put(STORE.invoiceDrafts, { key, values, savedAt });
  },

  async remove(key: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE.invoiceDrafts, key);
  }
};
