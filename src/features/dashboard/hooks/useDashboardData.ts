import { useCallback, useEffect, useMemo, useState } from "react";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { computeDashboardMetrics } from "@/utils/dashboardMetrics";
import { todayDateOnly } from "@/utils/date";
import type { Invoice, InvoiceStatus } from "@/types";

type Status = "loading" | "ready" | "error";

export function useDashboardData() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

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

  // Every company an invoice currently exists for — the "jump to a
  // company" chip row on the Dashboard only shows up once there's more
  // than one, same rule as the Invoices list.
  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const invoice of invoices) {
      if (!map.has(invoice.company.id)) map.set(invoice.company.id, invoice.company.name);
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [invoices]);

  const filteredInvoices = useMemo(
    () => (companyFilter === "all" ? invoices : invoices.filter((i) => i.company.id === companyFilter)),
    [invoices, companyFilter]
  );

  // Recomputed from `filteredInvoices`, so a quick status change on the
  // Dashboard (updateStatus below) immediately updates the
  // outstanding/overdue totals and the recent-invoices badges without a
  // full page reload, and switching the company filter instantly narrows
  // every number to that company alone.
  const metrics = useMemo(() => computeDashboardMetrics(filteredInvoices, todayDateOnly()), [filteredInvoices]);

  const updateStatus = useCallback(async (id: string, newStatus: InvoiceStatus, paidAmountCents?: number) => {
    const updated = await invoiceService.updateStatus(id, newStatus, paidAmountCents);
    setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await invoiceService.remove(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { metrics, status, updateStatus, remove, companyOptions, companyFilter, setCompanyFilter };
}
