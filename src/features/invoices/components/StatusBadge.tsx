import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";
import { INVOICE_STATUS_COLORS } from "@/utils/invoiceStatusColors";
import type { InvoiceStatus } from "@/types";

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation("invoice");
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", INVOICE_STATUS_COLORS[status])}>
      {t(`status.${status}`)}
    </span>
  );
}
