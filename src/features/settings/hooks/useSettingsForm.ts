import { useCallback, useEffect, useState } from "react";
import { settingsService } from "@/features/settings/services/settingsService";
import type { AppSettings } from "@/types";
import type { AppSettingsFormValues } from "@/schemas";

type Status = "loading" | "ready" | "error";

/** Read-write access to AppSettings for the Settings page (the read-only useAppSettings hook is for other features). */
export function useSettingsForm() {
  const [settings, setSettings] = useState<AppSettings | undefined>();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    settingsService
      .load()
      .then((loaded) => {
        if (!cancelled) {
          setSettings(loaded);
          setStatus("ready");
        }
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (values: AppSettingsFormValues) => {
    const saved = await settingsService.save(values);
    setSettings(saved);
    return saved;
  }, []);

  return { settings, status, save };
}
