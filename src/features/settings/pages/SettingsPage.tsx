import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight, Building2, DatabaseBackup } from "lucide-react";
import i18n from "@/i18n";
import { useSettingsForm } from "@/features/settings/hooks/useSettingsForm";
import { SettingsForm } from "@/features/settings/components/SettingsForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/ui/toast";
import type { AppSettingsFormValues } from "@/schemas";

export function SettingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { settings, status, save } = useSettingsForm();

  // Keep the running UI in sync with the persisted interface-language
  // setting (i18next's browser-locale detection alone wouldn't know about it).
  useEffect(() => {
    if (settings && settings.interfaceLanguage !== i18n.language) {
      i18n.changeLanguage(settings.interfaceLanguage);
    }
  }, [settings]);

  async function handleSubmit(values: AppSettingsFormValues) {
    try {
      await save(values);
      await i18n.changeLanguage(values.interfaceLanguage);
      toast.success(t("settings.saveSuccess"));
    } catch {
      toast.error(t("settings.saveError"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.settings")}</h1>

      <div className="space-y-2">
        <Link
          to="/company"
          className="flex items-center gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3.5 text-sm text-ink"
        >
          <Building2 size={18} className="shrink-0 text-ink-faint" />
          <span className="flex-1">{t("pages.company")}</span>
          <ChevronRight size={18} className="text-ink-faint" />
        </Link>

        <Link
          to="/settings/backup"
          className="flex items-center gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3.5 text-sm text-ink"
        >
          <DatabaseBackup size={18} className="shrink-0 text-ink-faint" />
          <span className="flex-1">{t("pages.backupRestore")}</span>
          <ChevronRight size={18} className="text-ink-faint" />
        </Link>
      </div>

      {status === "loading" ? <LoadingSpinner label={t("settings.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("settings.loadError")} description={t("settings.loadErrorHint")} />
      ) : null}

      {status === "ready" && settings ? <SettingsForm settings={settings} onSubmit={handleSubmit} /> : null}
    </div>
  );
}
