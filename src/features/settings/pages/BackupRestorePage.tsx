import { useTranslation } from "react-i18next";

// Stage 1 skeleton. Real export/import (JSON, validated with Zod before
// writing anything, with a replace-vs-merge choice) lands in a later stage.
export function BackupRestorePage() {
  const { t } = useTranslation();
  return <h1 className="font-display text-2xl text-ink">{t("pages.backupRestore")}</h1>;
}
