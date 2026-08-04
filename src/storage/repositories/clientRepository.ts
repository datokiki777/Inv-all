import { getDb, STORE } from "@/storage/db";
import type { Client } from "@/types";
import { getClientDisplayName } from "@/utils/clientDisplayName";

export const clientRepository = {
  /** Sorted in-memory by display name since there's no single indexable "name" field. */
  async getAll(): Promise<Client[]> {
    const db = await getDb();
    const all = await db.getAll(STORE.clients);
    return all.sort((a, b) => getClientDisplayName(a).localeCompare(getClientDisplayName(b)));
  },

  async getById(id: string): Promise<Client | undefined> {
    const db = await getDb();
    return db.get(STORE.clients, id);
  },

  async save(client: Client): Promise<void> {
    const db = await getDb();
    await db.put(STORE.clients, client);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE.clients, id);
  }
};
