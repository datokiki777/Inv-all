import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { useInvoices } from "@/features/invoices/hooks/useInvoices";
import { InvoiceListItem } from "@/features/invoices/components/InvoiceListItem";
import { InvoiceFilters } from "@/features/invoices/components/InvoiceFilters";
import { DeleteInvoiceDialog } from "@/features/invoices/components/DeleteInvoiceDialog";
import { PartialPaymentDialog } from "@/features/invoices/components/PartialPaymentDialog";
import type { Invoice, InvoiceStatus } from "@/types";

export function InvoicesPage() {
  const { t } = useTranslation(["common", "invoice"]);
  const toast = useToast();
  const { invoices, allCount, status, filters, setFilters, clientOptions, duplicate, remove, updateStatus } = useInvoices();
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [partialPaymentInvoice, setPartialPaymentInvoice] = useState<Invoice | null>(null);

  async function handleDuplicate(invoice: Invoice) {
    try {
      await duplicate(invoice);
      toast.success(t("invoice:list.duplicateSuccess"));
    } catch {
      toast.error(t("invoice:list.duplicateError"));
    }
  }

  async function handleStatusChange(invoice: Invoice, newStatus: InvoiceStatus) {
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("pages.invoices")}</h1>
        <Link to="/invoices/new">
          <Button size="sm">
            <Plus size={16} /> {t("actions.add")}
          </Button>
        </Link>
      </div>

      {allCount > 0 ? <InvoiceFilters filters={filters} onChange={setFilters} clientOptions={clientOptions} /> : null}

      {status === "loading" ? <LoadingSpinner label={t("invoice:list.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("invoice:list.loadError")} description={t("invoice:list.loadErrorHint")} />
      ) : null}

      {status === "ready" && allCount === 0 ? (
        <EmptyState
          title={t("empty.invoices")}
          description={t("empty.invoicesHint")}
          action={
            <Link to="/invoices/new">
              <Button size="sm">{t("actions.add")}</Button>
            </Link>
          }
        />
      ) : null}

      {status === "ready" && allCount > 0 && invoices.length === 0 ? (
        <EmptyState title={t("invoice:list.noResults")} />
      ) : null}

      {status === "ready" && invoices.length > 0 ? (
        <div className="space-y-2.5">
          {invoices.map((invoice) => (
            <InvoiceListItem
              key={invoice.id}
              invoice={invoice}
              onDuplicate={() => handleDuplicate(invoice)}
              onDelete={() => setDeletingInvoice(invoice)}
              onStatusChange={(newStatus) => handleStatusChange(invoice, newStatus)}
            />
          ))}
        </div>
      ) : null}

      <DeleteInvoiceDialog
        invoice={deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(null)}
        onConfirm={handleDelete}
      />

      <PartialPaymentDialog
        invoice={partialPaymentInvoice}
        onOpenChange={(open) => !open && setPartialPaymentInvoice(null)}
        onConfirm={handlePartialPaymentConfirm}
      />
    </div>
  );
}
