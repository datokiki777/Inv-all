import type { InvoiceStatus } from "@/types";

/** Shared between the read-only StatusBadge and the interactive StatusPicker so their colors never drift apart. */
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "bg-surface-sunken text-ink-muted border-line",
  sent: "bg-accent/15 text-accent border-accent/30",
  paid: "bg-success/15 text-success border-success/30",
  partiallyPaid: "bg-warning/15 text-warning border-warning/30",
  overdue: "bg-danger/15 text-danger border-danger/30",
  cancelled: "bg-surface-sunken text-ink-faint border-line line-through"
};

export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "partiallyPaid", "overdue", "cancelled"];
