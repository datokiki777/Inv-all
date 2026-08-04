import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useAppSettings, localeForLanguage } from "@/features/settings/hooks/useAppSettings";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/features/invoices/components/StatusBadge";
import { formatMoney } from "@/utils/money";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import type { CurrencyAmount } from "@/utils/dashboardMetrics";

function AmountList({ amounts, locale, emptyLabel }: { amounts: CurrencyAmount[]; locale: string; emptyLabel: string }) {
  if (amounts.length === 0) return <p className="font-display text-2xl text-ink">{emptyLabel}</p>;
  return (
    <div className="space-y-0.5">
      {amounts.map((a) => (
        <p key={a.currency} className="font-display text-2xl text-ink">
          {formatMoney(a.cents, a.currency, locale)}
        </p>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation(["common", "invoice"]);
  const { metrics, status } = useDashboardData();
  const settings = useAppSettings();
  const locale = localeForLanguage(settings?.interfaceLanguage);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.dashboard")}</h1>

      {status === "loading" ? <LoadingSpinner label={t("dashboard.loading")} /> : null}
      {status === "error" ? <EmptyState title={t("dashboard.loadError")} /> : null}

      {status === "ready" && metrics ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-line bg-surface-raised p-4">
              <p className="text-xs text-ink-muted">{t("dashboard.outstanding")}</p>
              <div className="mt-1">
                <AmountList amounts={metrics.outstanding} locale={locale} emptyLabel="—" />
              </div>
            </div>
            <div className="rounded-lg border border-line bg-surface-raised p-4">
              <p className="text-xs text-ink-muted">
                {t("dashboard.overdue")} {metrics.overdueCount > 0 ? `(${metrics.overdueCount})` : ""}
              </p>
              <div className="mt-1">
                <AmountList amounts={metrics.overdue} locale={locale} emptyLabel="—" />
              </div>
            </div>
          </div>

          {metrics.draftCount > 0 ? (
            <Link
              to="/invoices"
              className="block rounded-lg border border-line bg-surface-raised px-4 py-3 text-sm text-ink-muted"
            >
              {t("dashboard.draftCount", { count: metrics.draftCount })}
            </Link>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium text-ink">{t("dashboard.recentInvoices")}</p>
            {metrics.recentInvoices.length === 0 ? (
              <EmptyState
                title={t("empty.invoices")}
                description={t("empty.invoicesHint")}
              />
            ) : (
              <div className="space-y-2">
                {metrics.recentInvoices.map((invoice) => (
                  <Link
                    key={invoice.id}
                    to={`/invoices/${invoice.id}/preview`}
                    className="flex items-center justify-between rounded-lg border border-line bg-surface-raised px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-ink-muted">{getClientDisplayName(invoice.client)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink">{formatMoney(invoice.totalCents, invoice.currency, locale)}</span>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
