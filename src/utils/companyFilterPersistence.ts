import { settingsRepository } from "@/storage/repositories";
import { nowIso } from "@/utils/date";

/**
 * Reads/writes AppSettings.lastCompanyFilterId — the company chip
 * currently selected on the Dashboard/Invoices list. Shared by both
 * screens' hooks so picking a company on either one persists across app
 * restarts and stays in sync between them, instead of resetting to "All"
 * every time you navigate away.
 */
export async function loadLastCompanyFilterId(): Promise<string> {
  const settings = await settingsRepository.get();
  return settings.lastCompanyFilterId ?? "all";
}

export async function saveLastCompanyFilterId(companyId: string): Promise<void> {
  const settings = await settingsRepository.get();
  await settingsRepository.save({ ...settings, lastCompanyFilterId: companyId, updatedAt: nowIso() });
}
