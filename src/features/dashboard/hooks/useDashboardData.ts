import { useCallback, useEffect, useMemo, useState } from "react";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { computeDashboardMetrics } from "@/utils/dashboardMetrics";
import { todayDateOnly } from "@/utils/date";
import type { Invoice, InvoiceStatus } from "@/types";

type Status = "loading" | "ready" | "error";

export function useDashboardData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    invoiceService
      .list()
      .then((loaded) => {
        if (cancelled) return;
        setInvoices(loaded);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Recomputed from `invoices`, so a quick status change on the Dashboard
  // (updateStatus below) immediately updates the outstanding/overdue totals
  // and the recent-invoices badges without a full page reload.
  const metrics = useMemo(() => computeDashboardMetrics(invoices, todayDateOnly()), [invoices]);

  const updateStatus = useCallback(async (id: string, newStatus: InvoiceStatus, paidAmountCents?: number) => {
    const updated = await invoiceService.updateStatus(id, newStatus, paidAmountCents);
    setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    return updated;
  }, []);

  return { metrics, status, updateStatus };
}
