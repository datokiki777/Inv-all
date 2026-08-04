import type { Invoice, InvoiceStatus } from "@/types";
import { getClientDisplayName } from "./clientDisplayName";

export interface InvoiceFilters {
  query: string;
  status: InvoiceStatus | "all";
  clientId: string | "all";
  dateFrom: string;
  dateTo: string;
}

export const defaultInvoiceFilters: InvoiceFilters = {
  query: "",
  status: "all",
  clientId: "all",
  dateFrom: "",
  dateTo: ""
};

/** Pure predicate so filtering can be unit-tested independently of the React hook that uses it. */
export function matchesInvoiceFilters(invoice: Invoice, filters: InvoiceFilters): boolean {
  const needle = filters.query.trim().toLowerCase();
  if (needle) {
    const haystack = [invoice.invoiceNumber, getClientDisplayName(invoice.client)].join(" ").toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  if (filters.status !== "all" && invoice.status !== filters.status) return false;
  if (filters.clientId !== "all" && invoice.client.id !== filters.clientId) return false;
  if (filters.dateFrom && invoice.createdDate < filters.dateFrom) return false;
  if (filters.dateTo && invoice.createdDate > filters.dateTo) return false;
  return true;
}
