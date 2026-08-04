import { useTranslation } from "react-i18next";

// Stage 1 skeleton — real KPIs (open amount, overdue count, recent
// invoices) land once invoiceRepository has write traffic to summarize.
export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.dashboard")}</h1>
      <div className="rounded-lg border border-line bg-surface-raised p-5 text-sm text-ink-muted">
        Overview widgets (outstanding total, overdue invoices, recent activity) will appear here.
      </div>
    </div>
  );
}
