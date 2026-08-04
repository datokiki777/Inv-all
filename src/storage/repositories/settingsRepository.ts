import { getDb, STORE } from "@/storage/db";
import type { AppSettings } from "@/types";

const SETTINGS_ID = "app-settings" as const;

export const defaultAppSettings: AppSettings = {
  id: SETTINGS_ID,
  interfaceLanguage: "en",
  defaultInvoiceTemplateId: "modern",
  defaultInvoiceLanguage: "en",
  defaultCurrency: "EUR",
  invoiceNumberFormat: "INV-{YYYY}-{seq:4}",
  nextInvoiceSequence: 1,
  updatedAt: new Date().toISOString()
};

export const settingsRepository = {
  async get(): Promise<AppSettings> {
    const db = await getDb();
    const existing = await db.get(STORE.settings, SETTINGS_ID);
    return existing ?? defaultAppSettings;
  },

  async save(settings: AppSettings): Promise<void> {
    const db = await getDb();
    await db.put(STORE.settings, settings);
  }
};
