import { useEffect, useState } from "react";
import { settingsRepository } from "@/storage/repositories";
import type { AppSettings } from "@/types";

/**
 * Read-only accessor other features (Products, later Invoices) use to get
 * the default currency / language without importing settingsRepository
 * directly. The full read-write Settings form lives in its own feature.
 */
export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | undefined>();

  useEffect(() => {
    let cancelled = false;
    settingsRepository.get().then((loaded) => {
      if (!cancelled) setSettings(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}

export function localeForLanguage(language: "de" | "en" | undefined): string {
  return language === "de" ? "de-DE" : "en-US";
}
