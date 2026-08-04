import { getDb, STORE } from "@/storage/db";
import type { Invoice, InvoiceStatus } from "@/types";

export const invoiceRepository = {
  async getAll(): Promise<Invoice[]> {
    const db = await getDb();
    return db.getAllFromIndex(STORE.invoices, "by-createdDate");
  },

  async getById(id: string): Promise<Invoice | undefined> {
    const db = await getDb();
    return db.get(STORE.invoices, id);
  },

  async getByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    const db = await getDb();
    return db.getAllFromIndex(STORE.invoices, "by-status", status);
  },

  async getByClientId(clientId: string): Promise<Invoice[]> {
    const db = await getDb();
    return db.getAllFromIndex(STORE.invoices, "by-clientId", clientId);
  },

  async save(invoice: Invoice): Promise<void> {
    const db = await getDb();
    await db.put(STORE.invoices, invoice);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE.invoices, id);
  },

  /** Used by Backup & Restore's "replace" import mode. */
  async clear(): Promise<void> {
    const db = await getDb();
    await db.clear(STORE.invoices);
  }
};
