import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Copy, Pencil, Trash2 } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import { formatMoney } from "@/utils/money";
import { localeForLanguage } from "@/features/settings/hooks/useAppSettings";
import { StatusPicker } from "./StatusPicker";

interface InvoiceListItemProps {
  invoice: Invoice;
  onDuplicate: () => void;
  onDelete: () => void;
  onStatusChange: (status: InvoiceStatus) => void;
}

export function InvoiceListItem({ invoice, onDuplicate, onDelete, onStatusChange }: InvoiceListItemProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const locale = localeForLanguage(invoice.pdfLanguage);

  return (
    <div className="rounded-lg border border-line bg-surface-raised p-4">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/invoices/${invoice.id}/preview`} className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{invoice.invoiceNumber}</p>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{getClientDisplayName(invoice.client)}</p>
        </Link>
        {/* Outside the Link on purpose — a <select> nested inside an anchor can still trigger navigation on some mobile browsers. */}
        <StatusPicker status={invoice.status} onChange={onStatusChange} />
      </div>
      <Link to={`/invoices/${invoice.id}/preview`} className="mt-2 flex items-baseline justify-between">
        <p className="text-xs text-ink-faint">{invoice.createdDate}</p>
        <p className="font-display text-lg text-ink">{formatMoney(invoice.totalCents, invoice.currency, locale)}</p>
      </Link>
      <div className="mt-3 flex justify-end gap-1 border-t border-line pt-2.5">
        <Link
          to={`/invoices/${invoice.id}/edit`}
          className="rounded p-2 text-ink-faint hover:bg-surface-sunken hover:text-ink"
          aria-label={t("actions.edit")}
        >
          <Pencil size={16} />
        </Link>
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded p-2 text-ink-faint hover:bg-surface-sunken hover:text-ink"
          aria-label={t("actions.duplicate")}
        >
          <Copy size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded p-2 text-ink-faint hover:bg-surface-sunken hover:text-danger"
          aria-label={t("actions.delete")}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
