import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Upload, TriangleAlert } from "lucide-react";
import { backupService, type ImportMode } from "@/features/settings/services/backupService";
import type { Backup } from "@/schemas/backup.schema";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/toast";
import { downloadTextFile } from "@/utils/downloadFile";
import { formatDate } from "@/utils/date";

export function BackupRestorePage() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<Backup | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [importing, setImporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const backup = await backupService.exportAll();
      const stamp = backup.exportedAt.slice(0, 10);
      downloadTextFile(`invoice-app-backup-${stamp}.json`, JSON.stringify(backup, null, 2));
      toast.success(t("backup.exportSuccess"));
    } catch {
      toast.error(t("backup.exportError"));
    } finally {
      setExporting(false);
    }
  }

  async function handleFileChosen(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const result = backupService.parse(text);
    if (!result.success) {
      toast.error(t(`backup.errors.${result.error}`));
    } else {
      setImportMode("merge");
      setPendingBackup(result.backup);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleConfirmImport() {
    if (!pendingBackup) return;
    setImporting(true);
    try {
      const summary = await backupService.importAll(pendingBackup, importMode);
      toast.success(
        t("backup.importSuccess", {
          companies: summary.companies,
          clients: summary.clients,
          products: summary.products,
          invoices: summary.invoices
        })
      );
      setPendingBackup(null);
      // A lot of app state changed underneath every page's hooks at once —
      // reloading is the simplest way to guarantee everything reflects it.
      window.location.reload();
    } catch {
      toast.error(t("backup.importError"));
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.backupRestore")}</h1>

      <div className="space-y-2 rounded-lg border border-line bg-surface-raised p-4">
        <p className="text-sm font-medium text-ink">{t("backup.exportTitle")}</p>
        <p className="text-xs text-ink-muted">{t("backup.exportHint")}</p>
        <Button className="mt-2 w-full" variant="secondary" onClick={handleExport} disabled={exporting}>
          <Download size={16} /> {exporting ? t("backup.exporting") : t("backup.exportButton")}
        </Button>
      </div>

      <div className="space-y-2 rounded-lg border border-line bg-surface-raised p-4">
        <p className="text-sm font-medium text-ink">{t("backup.importTitle")}</p>
        <p className="text-xs text-ink-muted">{t("backup.importHint")}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => handleFileChosen(e.target.files?.[0])}
        />
        <Button className="mt-2 w-full" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} /> {t("backup.importButton")}
        </Button>
      </div>

      <Dialog open={!!pendingBackup} onOpenChange={(open) => !open && setPendingBackup(null)}>
        {pendingBackup ? (
          <DialogContent title={t("backup.confirmTitle")}>
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                <p>{t("backup.confirmWarning")}</p>
              </div>

              <div className="space-y-1 text-sm text-ink-muted">
                <p>{t("backup.backupDate", { date: formatDate(pendingBackup.exportedAt, i18n.language === "de" ? "de-DE" : "en-US") })}</p>
                <p>
                  {t("backup.backupCounts", {
                    companies: pendingBackup.data.companies.length,
                    clients: pendingBackup.data.clients.length,
                    products: pendingBackup.data.products.length,
                    invoices: pendingBackup.data.invoices.length
                  })}
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-ink">{t("backup.importMode")}</p>
                <SegmentedControl
                  value={importMode}
                  onChange={setImportMode}
                  options={[
                    { value: "merge", label: t("backup.importModeMerge") },
                    { value: "replace", label: t("backup.importModeReplace") }
                  ]}
                />
                <p className="mt-1.5 text-xs text-ink-faint">
                  {importMode === "replace" ? t("backup.importModeReplaceHint") : t("backup.importModeMergeHint")}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setPendingBackup(null)}>
                  {t("actions.cancel")}
                </Button>
                <Button type="button" variant="danger" className="flex-1" onClick={handleConfirmImport} disabled={importing}>
                  {importing ? t("backup.importing") : t("backup.confirmImport")}
                </Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
