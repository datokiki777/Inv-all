import { getDb, STORE } from "@/storage/db";
import type { Company } from "@/types";

/**
 * There is only ever zero or one Company record in this app (single-user,
 * single-business). We still store it keyed by id for consistency with the
 * other stores and to make a future multi-company mode a non-breaking change.
 */
export const companyRepository = {
  /** Convenience accessor for the single active company Stage 2's UI uses. */
  async get(): Promise<Company | undefined> {
    const all = await this.getAll();
    return all[0];
  },

  /** Already multi-company-ready: the store is keyed by id, not fixed to one row. */
  async getAll(): Promise<Company[]> {
    const db = await getDb();
    return db.getAll(STORE.companies);
  },

  async getById(id: string): Promise<Company | undefined> {
    const db = await getDb();
    return db.get(STORE.companies, id);
  },

  async save(company: Company): Promise<void> {
    const db = await getDb();
    await db.put(STORE.companies, company);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE.companies, id);
  },

  /** Used by Backup & Restore's "replace" import mode. */
  async clear(): Promise<void> {
    const db = await getDb();
    await db.clear(STORE.companies);
  }
};
