import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";
import { INVOICE_STATUS_COLORS, INVOICE_STATUSES } from "@/utils/invoiceStatusColors";
import type { InvoiceStatus } from "@/types";

interface StatusPickerProps {
  status: InvoiceStatus;
  onChange: (status: InvoiceStatus) => void;
}

/**
 * A native <select> styled to look exactly like StatusBadge, so a person
 * can change an invoice's status right from the Dashboard or Invoices list
 * without opening the full edit form. Always render this OUTSIDE any
 * wrapping <Link> — a <select> nested inside an anchor can still trigger
 * the link's navigation on some mobile browsers.
 */
export function StatusPicker({ status, onChange }: StatusPickerProps) {
  const { t } = useTranslation("invoice");

  return (
    <select
      value={status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        onChange(e.target.value as InvoiceStatus);
      }}
      aria-label={t("form.status")}
      className={cn(
        "appearance-none rounded-full border px-2.5 py-0.5 text-xs font-medium",
        "focus:outline-none focus:ring-1 focus:ring-accent",
        INVOICE_STATUS_COLORS[status]
      )}
    >
      {INVOICE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {t(`status.${s}`)}
        </option>
      ))}
    </select>
  );
}
