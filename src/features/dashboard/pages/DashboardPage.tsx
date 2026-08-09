import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { DashboardStatsCard } from "@/features/dashboard/components/DashboardStatsCard";
import { useAppSettings, localeForLanguage } from "@/features/settings/hooks/useAppSettings";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusPicker } from "@/features/invoices/components/StatusPicker";
import { PartialPaymentDialog } from "@/features/invoices/components/PartialPaymentDialog";
import { DeleteInvoiceDialog } from "@/features/invoices/components/DeleteInvoiceDialog";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/utils/money";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import type { Invoice, InvoiceStatus } from "@/types";

export function DashboardPage() {
  const { t } = useTranslation(["common", "invoice"]);
  const toast = useToast();
  const { metrics, status, updateStatus, remove } = useDashboardData();
  const settings = useAppSettings();
  const locale = localeForLanguage(settings?.interfaceLanguage);
  const [partialPaymentInvoice, setPartialPaymentInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  async function handleStatusChange(invoice: Invoice, newStatus: InvoiceStatus) {
    // "Partially paid" needs a payment amount we don't have yet — the
    // dialog collects it, then calls handlePartialPaymentConfirm below.
    if (newStatus === "partiallyPaid") {
      setPartialPaymentInvoice(invoice);
      return;
    }
    try {
      await updateStatus(invoice.id, newStatus);
      toast.success(t("invoice:list.statusUpdateSuccess"));
    } catch {
      toast.error(t("invoice:list.statusUpdateError"));
    }
  }

  async function handlePartialPaymentConfirm(paidAmountCents: number) {
    if (!partialPaymentInvoice) return;
    try {
      await updateStatus(partialPaymentInvoice.id, "partiallyPaid", paidAmountCents);
      toast.success(t("invoice:list.statusUpdateSuccess"));
    } catch {
      toast.error(t("invoice:list.statusUpdateError"));
    } finally {
      setPartialPaymentInvoice(null);
    }
  }

  async function handleDelete() {
    if (!deletingInvoice) return;
    try {
      await remove(deletingInvoice.id);
      toast.success(t("invoice:list.deleteSuccess"));
    } catch {
      toast.error(t("invoice:list.deleteError"));
    } finally {
      setDeletingInvoice(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.dashboard")}</h1>

      {status === "loading" ? <LoadingSpinner label={t("dashboard.loading")} /> : null}
      {status === "error" ? <EmptyState title={t("dashboard.loadError")} /> : null}

      {status === "ready" && metrics ? (
        <>
          <DashboardStatsCard metrics={metrics} locale={locale} />

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
              <EmptyState title={t("empty.invoices")} description={t("empty.invoicesHint")} />
            ) : (
              <div className="space-y-2">
                {metrics.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-lg border border-line bg-surface-raised px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/invoices/${invoice.id}/preview`} className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{invoice.invoiceNumber}</p>
                        <p className="truncate text-xs text-ink-muted">{getClientDisplayName(invoice.client)}</p>
                      </Link>
                      <StatusPicker status={invoice.status} onChange={(newStatus) => handleStatusChange(invoice, newStatus)} />
                      <button
                        type="button"
                        onClick={() => setDeletingInvoice(invoice)}
                        className="shrink-0 rounded p-1.5 text-ink-faint hover:text-danger"
                        aria-label={t("actions.delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Link to={`/invoices/${invoice.id}/preview`} className="mt-1.5 block text-right text-sm text-ink">
                      {formatMoney(invoice.totalCents, invoice.currency, locale)}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      <PartialPaymentDialog
        invoice={partialPaymentInvoice}
        onOpenChange={(open) => !open && setPartialPaymentInvoice(null)}
        onConfirm={handlePartialPaymentConfirm}
      />

      <DeleteInvoiceDialog
        invoice={deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
