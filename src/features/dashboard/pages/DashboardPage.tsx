import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Trash2, Share2, FileDown } from "lucide-react";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { DashboardStatsCard } from "@/features/dashboard/components/DashboardStatsCard";
import { useAppSettings, localeForLanguage } from "@/features/settings/hooks/useAppSettings";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { CompanyFilterChips } from "@/components/common/CompanyFilterChips";
import { StatusPicker } from "@/features/invoices/components/StatusPicker";
import { PartialPaymentDialog } from "@/features/invoices/components/PartialPaymentDialog";
import { DeleteInvoiceDialog } from "@/features/invoices/components/DeleteInvoiceDialog";
import { useToast } from "@/components/ui/toast";
import { formatMoney } from "@/utils/money";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import { recentExportService, type RecentExportEntry } from "@/features/invoices/services/recentExportService";
import { canShareFiles, shareFile } from "@/utils/shareFile";
import type { Invoice, InvoiceStatus } from "@/types";

// Feature-detected once, generically — file-sharing support is a
// browser/device capability, not something that varies per invoice, so
// there's no need to re-check it for every card.
const SHARE_SUPPORTED = canShareFiles(new File([], "test.pdf", { type: "application/pdf" }));

export function DashboardPage() {
  const { t } = useTranslation(["common", "invoice"]);
  const toast = useToast();
  const { metrics, status, updateStatus, remove, companyOptions, companyFilter, setCompanyFilter } = useDashboardData();
  const settings = useAppSettings();
  const locale = localeForLanguage(settings?.interfaceLanguage);
  const [partialPaymentInvoice, setPartialPaymentInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [recentExports, setRecentExports] = useState<RecentExportEntry[]>([]);
  // Which invoice's PDF is currently being generated for a share tap —
  // only one at a time in practice, but tracked by id so the loading
  // state lands on the right card if several were somehow tapped in a row.
  const [sharingInvoiceId, setSharingInvoiceId] = useState<string | null>(null);

  function refreshRecentExports() {
    recentExportService.listRecent().then(setRecentExports);
  }

  useEffect(() => {
    refreshRecentExports();
  }, []);

  async function handleShare(invoice: Invoice) {
    setSharingInvoiceId(invoice.id);
    try {
      // Dynamically imported rather than a static top-level import —
      // generateInvoicePdfFile pulls in @react-pdf/renderer and every
      // registered template, which is a large dependency. Dashboard is
      // part of the main bundle (not route-split like the Preview page
      // already is), so a static import here would force that whole PDF
      // stack to load on every app start, not just when someone actually
      // taps Share. This way it's only fetched the first time it's needed.
      const { generateInvoicePdfFile } = await import("@/pdf/generateInvoicePdf");
      const file = await generateInvoicePdfFile(invoice);
      const shared = await shareFile(file, invoice.invoiceNumber);
      if (shared) {
        await recentExportService.recordExport(invoice.id);
        refreshRecentExports();
      }
    } catch {
      toast.error(t("actions.shareError"));
    } finally {
      setSharingInvoiceId(null);
    }
  }

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
      refreshRecentExports();
    } catch {
      toast.error(t("invoice:list.deleteError"));
    } finally {
      setDeletingInvoice(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.dashboard")}</h1>

      <CompanyFilterChips companies={companyOptions} value={companyFilter} onChange={setCompanyFilter} />

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
              // Internally scrollable (not the whole page) now that this
              // shows every invoice for the current filter instead of
              // capping at 5 — a fixed max-height keeps the Dashboard
              // itself compact regardless of how many there are.
              <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-0.5">
                {metrics.recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-lg border border-line bg-surface-raised px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/invoices/${invoice.id}/preview`} className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{invoice.invoiceNumber}</p>
                        <p className="truncate text-xs text-ink-muted">{getClientDisplayName(invoice.client)}</p>
                        {companyOptions.length > 1 ? (
                          <p className="truncate text-[11px] text-ink-faint">{invoice.company.name}</p>
                        ) : null}
                      </Link>
                      <StatusPicker status={invoice.status} onChange={(newStatus) => handleStatusChange(invoice, newStatus)} />
                      {SHARE_SUPPORTED ? (
                        <button
                          type="button"
                          onClick={() => handleShare(invoice)}
                          disabled={sharingInvoiceId === invoice.id}
                          className="shrink-0 rounded p-1.5 text-ink-faint hover:text-ink disabled:opacity-50"
                          aria-label={t("actions.share")}
                        >
                          <Share2 size={16} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setDeletingInvoice(invoice)}
                        className="shrink-0 rounded p-1.5 text-ink-faint hover:text-danger"
                        aria-label={t("actions.delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Link to={`/invoices/${invoice.id}/preview`} className="mt-1.5 block text-right">
                      {/* Net (pre-VAT) amount as the headline figure, VAT
                          itself as a small secondary line — see
                          InvoiceListItem for the same change and why. */}
                      <p className="text-sm text-ink">{formatMoney(invoice.taxableAmountCents, invoice.currency, locale)}</p>
                      {invoice.vatCents > 0 ? (
                        <p className="text-[10px] text-ink-faint">
                          + {t("invoice:fields.vat")}: {formatMoney(invoice.vatCents, invoice.currency, locale)}
                        </p>
                      ) : null}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentExports.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-ink">{t("dashboard.recentlyExported")}</p>
              {/* Compact horizontal shortcut row, not another full card
                  list — this is secondary, "where did I just send that"
                  convenience, not primary content. Tapping goes straight
                  to Preview, which regenerates the PDF fresh every time,
                  so it's never a stale copy of what was actually exported. */}
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {recentExports.map(({ invoice, exportedAt }) => (
                  <Link
                    key={invoice.id}
                    to={`/invoices/${invoice.id}/preview`}
                    className="flex w-40 shrink-0 flex-col gap-1 rounded-lg border border-line bg-surface-raised px-3 py-2.5"
                  >
                    <div className="flex items-center gap-1.5 text-ink-faint">
                      <FileDown size={13} />
                      <span className="truncate text-xs">{new Date(exportedAt).toLocaleDateString(locale)}</span>
                    </div>
                    <p className="truncate text-sm font-medium text-ink">{invoice.invoiceNumber}</p>
                    <p className="truncate text-xs text-ink-muted">{getClientDisplayName(invoice.client)}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
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
