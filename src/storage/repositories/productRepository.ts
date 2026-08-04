import { getDb, STORE } from "@/storage/db";
import type { ProductOrService } from "@/types";

export const productRepository = {
  async getAll(): Promise<ProductOrService[]> {
    const db = await getDb();
    return db.getAllFromIndex(STORE.products, "by-name");
  },

  async getById(id: string): Promise<ProductOrService | undefined> {
    const db = await getDb();
    return db.get(STORE.products, id);
  },

  async save(product: ProductOrService): Promise<void> {
    const db = await getDb();
    await db.put(STORE.products, product);
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(STORE.products, id);
  }
};
