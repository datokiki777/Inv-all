import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";
import type { InvoiceStatus } from "@/types";

const COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-surface-sunken text-ink-muted border-line",
  sent: "bg-accent/15 text-accent border-accent/30",
  paid: "bg-success/15 text-success border-success/30",
  partiallyPaid: "bg-warning/15 text-warning border-warning/30",
  overdue: "bg-danger/15 text-danger border-danger/30",
  cancelled: "bg-surface-sunken text-ink-faint border-line line-through"
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation("invoice");
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", COLORS[status])}>
      {t(`status.${status}`)}
    </span>
  );
}
