import { settingsRepository } from "@/storage/repositories";
import { nowIso } from "@/utils/date";
import type { AppSettings } from "@/types";
import type { AppSettingsFormValues } from "@/schemas";

/** Orchestration between the Settings form and settingsRepository. */
export const settingsService = {
  async load(): Promise<AppSettings> {
    return settingsRepository.get();
  },

  async save(values: AppSettingsFormValues): Promise<AppSettings> {
    // Merge onto the existing record rather than replacing it outright —
    // the Settings form doesn't have fields for everything AppSettings can
    // hold (e.g. lastInvoicePdfVisibility, tracked automatically by
    // invoiceService), and a plain overwrite would silently erase those.
    const existing = await settingsRepository.get();
    const settings: AppSettings = { ...existing, ...values, id: "app-settings", updatedAt: nowIso() };
    await settingsRepository.save(settings);
    return settings;
  }
};
