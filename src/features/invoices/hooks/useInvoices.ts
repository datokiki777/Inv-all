import { useCallback, useEffect, useMemo, useState } from "react";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { matchesInvoiceFilters, defaultInvoiceFilters, type InvoiceFilters } from "@/utils/invoiceSearch";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import type { Invoice } from "@/types";

type Status = "loading" | "ready" | "error";

/** Loads all invoices, exposes filter state and duplicate/remove mutators. */
export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [filters, setFilters] = useState<InvoiceFilters>(defaultInvoiceFilters);

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await invoiceService.list();
      setInvoices(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = useMemo(
    () => invoices.filter((invoice) => matchesInvoiceFilters(invoice, filters)).sort((a, b) => b.createdDate.localeCompare(a.createdDate)),
    [invoices, filters]
  );

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const invoice of invoices) {
      if (!map.has(invoice.client.id)) map.set(invoice.client.id, getClientDisplayName(invoice.client));
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [invoices]);

  const duplicate = useCallback(async (invoice: Invoice) => {
    const created = await invoiceService.duplicate(invoice);
    setInvoices((prev) => [...prev, created]);
    return created;
  }, []);

  const remove = useCallback(async (id: string) => {
    await invoiceService.remove(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateStatus = useCallback(async (id: string, newStatus: Invoice["status"]) => {
    const updated = await invoiceService.updateStatus(id, newStatus);
    setInvoices((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    return updated;
  }, []);

  return {
    invoices: filtered,
    allCount: invoices.length,
    status,
    filters,
    setFilters,
    clientOptions,
    duplicate,
    remove,
    updateStatus
  };
}
