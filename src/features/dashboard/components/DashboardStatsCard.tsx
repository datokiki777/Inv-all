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

/** Drops zero-value currency entries — a row with nothing but €0.00 in it isn't meaningfully different from having no entry at all. */
function nonZero(amounts: CurrencyAmount[]): CurrencyAmount[] {
  return amounts.filter((a) => a.cents !== 0);
}

/** Sums a set of monthly breakdowns into one total per currency, for the "VAT collected by month" section's own header total. */
function sumAmounts(groups: CurrencyAmount[][]): CurrencyAmount[] {
  const totals = new Map<string, number>();
  for (const amounts of groups) {
    for (const { currency, cents } of amounts) {
      totals.set(currency, (totals.get(currency) ?? 0) + cents);
    }
  }
  return Array.from(totals.entries()).map(([currency, cents]) => ({ currency, cents }));
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

function formatMonthLabel(month: string, locale: string): string {
  // month is "YYYY-MM" — construct a date on the 1st so Intl can format it as a month/year label.
  const date = new Date(`${month}-01T00:00:00`);
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(date);
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
            {t("dashboard.outstanding")}: <AmountValue amounts={nonZero(metrics.outstanding)} locale={locale} emptyLabel="—" />
          </p>
        </div>
        <ChevronDown size={18} className={cn("shrink-0 text-ink-faint transition-transform", expanded ? "rotate-180" : "")} />
      </button>

      {expanded ? (
        <div className="divide-y divide-line border-t border-line px-4">
          {/* Outstanding/Overdue/Paid/Total invoiced only render when
              there's actually a non-zero amount — a row that can only
              ever say "—" isn't informative, it's just clutter, and once
              a company genuinely has nothing owed it reads oddly to keep
              being told so explicitly every time the card is opened. */}
          {nonZero(metrics.outstanding).length > 0 ? (
            <StatRow label={t("dashboard.outstanding")}>
              <AmountValue amounts={nonZero(metrics.outstanding)} locale={locale} emptyLabel="—" />
            </StatRow>
          ) : null}
          {nonZero(metrics.overdue).length > 0 ? (
            <StatRow label={`${t("dashboard.overdue")}${metrics.overdueCount > 0 ? ` (${metrics.overdueCount})` : ""}`}>
              <AmountValue amounts={nonZero(metrics.overdue)} locale={locale} emptyLabel="—" />
            </StatRow>
          ) : null}
          {nonZero(metrics.paid).length > 0 ? (
            <StatRow label={t("dashboard.paid")}>
              <AmountValue amounts={nonZero(metrics.paid)} locale={locale} emptyLabel="—" />
            </StatRow>
          ) : null}
          {nonZero(metrics.totalInvoiced).length > 0 ? (
            <StatRow label={t("dashboard.totalInvoiced")}>
              <AmountValue amounts={nonZero(metrics.totalInvoiced)} locale={locale} emptyLabel="—" />
            </StatRow>
          ) : null}
          {/* Same zero-hiding rule extended to the two count rows — a
              freshly-created company with no invoices at all yet has
              nothing meaningful to say with "Total invoices: 0" or
              "Drafts: 0" either; once there's at least one invoice,
              these become genuinely informative again. */}
          {metrics.totalCount > 0 ? <StatRow label={t("dashboard.totalCount")}>{metrics.totalCount}</StatRow> : null}
          {metrics.draftCount > 0 ? <StatRow label={t("dashboard.draftCountLabel")}>{metrics.draftCount}</StatRow> : null}
        </div>
      ) : null}

      {expanded && metrics.paidVatByMonth.some((entry) => nonZero(entry.amounts).length > 0) ? (
        <div className="border-t border-line px-4 py-3">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <p className="text-xs font-medium uppercase text-ink-faint">{t("dashboard.paidVatByMonth")}</p>
            {/* The section's own running total, so you don't have to add
                up the visible rows yourself once the list is long enough
                to scroll. */}
            <p className="shrink-0 text-xs font-medium text-ink">
              <AmountValue amounts={sumAmounts(metrics.paidVatByMonth.map((e) => e.amounts))} locale={locale} emptyLabel="—" />
            </p>
          </div>
          {/* Internally scrollable with a fixed cap, not unbounded — a
              long-running business can accumulate many months of paid
              invoices here, and without this the card (and the whole
              Dashboard under it) would just keep stretching taller the
              more months there are. max-h-40 keeps this section itself
              compact, showing roughly 3 rows before it scrolls on its own. */}
          <div className="max-h-40 divide-y divide-line overflow-y-auto">
            {/* A month with nothing collected (€0.00) is dropped entirely
                rather than shown as a zero row, same rule as everywhere
                else in this card. */}
            {metrics.paidVatByMonth
              .filter((entry) => nonZero(entry.amounts).length > 0)
              .map((entry) => (
                <StatRow key={entry.month} label={formatMonthLabel(entry.month, locale)}>
                  <AmountValue amounts={nonZero(entry.amounts)} locale={locale} emptyLabel="—" />
                </StatRow>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
