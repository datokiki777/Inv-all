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
    const settings: AppSettings = { ...values, id: "app-settings", updatedAt: nowIso() };
    await settingsRepository.save(settings);
    return settings;
  }
};
