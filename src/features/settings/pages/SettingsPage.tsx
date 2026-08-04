import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Stage 1 skeleton. Will hold: interface language, default PDF template,
// default PDF language, default currency, invoice number format.
export function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.settings")}</h1>
      <Link
        to="/settings/backup"
        className="flex items-center justify-between rounded-lg border border-line bg-surface-raised px-4 py-3.5 text-sm text-ink"
      >
        {t("pages.backupRestore")}
        <ChevronRight size={18} className="text-ink-faint" />
      </Link>
    </div>
  );
}
