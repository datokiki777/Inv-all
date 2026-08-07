import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChartColumn, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatMoney } from "@/utils/money";
import type { CurrencyAmount, DashboardMetrics } from "@/utils/dashboardMetrics";

interface DashboardStatsCardProps {
  metrics: DashboardMetrics;
  locale: string;
}

function AmountValue({ amounts, locale, emptyLabel }: { amounts: CurrencyAmount[]; locale: string; emptyLabel: string }) {
  if (amounts.length === 0) return <span>{emptyLabel}</span>;
  return (
    <span className="text-right">
      {amounts.map((a, i) => (
        <span key={a.currency}>
          {i > 0 ? ", " : ""}
          {formatMoney(a.cents, a.currency, locale)}
        </span>
      ))}
    </span>
  );
}

function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="text-sm font-medium text-ink">{children}</p>
    </div>
  );
}

/**
 * Replaces the old fixed Outstanding/Overdue pair with a single tile that
 * expands to a fuller statistics breakdown — outstanding, overdue, paid,
 * total invoiced, invoice count, and drafts — instead of the Dashboard
 * needing a new box every time another number is worth showing.
 */
export function DashboardStatsCard({ metrics, locale }: DashboardStatsCardProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-line bg-surface-raised">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <ChartColumn size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{t("dashboard.statistics")}</p>
          <p className="truncate text-xs text-ink-muted">
            {t("dashboard.outstanding")}: <AmountValue amounts={metrics.outstanding} locale={locale} emptyLabel="—" />
          </p>
        </div>
        <ChevronDown size={18} className={cn("shrink-0 text-ink-faint transition-transform", expanded ? "rotate-180" : "")} />
      </button>

      {expanded ? (
        <div className="divide-y divide-line border-t border-line px-4">
          <StatRow label={t("dashboard.outstanding")}>
            <AmountValue amounts={metrics.outstanding} locale={locale} emptyLabel="—" />
          </StatRow>
          <StatRow label={`${t("dashboard.overdue")}${metrics.overdueCount > 0 ? ` (${metrics.overdueCount})` : ""}`}>
            <AmountValue amounts={metrics.overdue} locale={locale} emptyLabel="—" />
          </StatRow>
          <StatRow label={t("dashboard.paid")}>
            <AmountValue amounts={metrics.paid} locale={locale} emptyLabel="—" />
          </StatRow>
          <StatRow label={t("dashboard.totalInvoiced")}>
            <AmountValue amounts={metrics.totalInvoiced} locale={locale} emptyLabel="—" />
          </StatRow>
          <StatRow label={t("dashboard.totalCount")}>{metrics.totalCount}</StatRow>
          <StatRow label={t("dashboard.draftCountLabel")}>{metrics.draftCount}</StatRow>
        </div>
      ) : null}
    </div>
  );
}
