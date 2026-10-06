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

/**
 * Widened to accept "ka" too (not just invoice.pdfLanguage's "de" | "en")
 * since this is also used for UI-level date/number formatting driven by
 * interfaceLanguage (e.g. the Dashboard), which now has a third option.
 * Every existing caller passing "de" | "en" (PDF language) remains valid
 * — a narrower-typed value fits a wider-typed parameter just fine.
 */
export function localeForLanguage(language: "de" | "en" | "ka" | undefined): string {
  if (language === "de") return "de-DE";
  if (language === "ka") return "ka-GE";
  return "en-US";
}
