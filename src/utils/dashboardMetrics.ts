import type { Invoice } from "@/types";

export interface CurrencyAmount {
  currency: string;
  cents: number;
}

export interface DashboardMetrics {
  /** Sum of remainingAmountCents for invoices that are sent/partiallyPaid/overdue, grouped by currency. */
  outstanding: CurrencyAmount[];
  /** Same set, but restricted to invoices whose due date has passed. */
  overdue: CurrencyAmount[];
  overdueCount: number;
  draftCount: number;
  /** Most recently created invoices, newest first. */
  recentInvoices: Invoice[];
}

const OUTSTANDING_STATUSES = new Set<Invoice["status"]>(["sent", "partiallyPaid", "overdue"]);

function isPastDue(invoice: Invoice, todayDateOnly: string): boolean {
  return invoice.status !== "paid" && invoice.status !== "cancelled" && invoice.dueDate < todayDateOnly;
}

function groupByCurrency(invoices: Invoice[]): CurrencyAmount[] {
  const totals = new Map<string, number>();
  for (const invoice of invoices) {
    totals.set(invoice.currency, (totals.get(invoice.currency) ?? 0) + invoice.remainingAmountCents);
  }
  return Array.from(totals.entries()).map(([currency, cents]) => ({ currency, cents }));
}

/**
 * Pure aggregation so the Dashboard's numbers can be unit-tested without
 * rendering anything. "Overdue" combines the explicit `overdue` status
 * with any sent/partially-paid invoice whose due date has already passed,
 * since a person may not have manually flipped the status yet.
 */
export function computeDashboardMetrics(invoices: Invoice[], todayDateOnly: string, recentCount = 5): DashboardMetrics {
  const outstandingInvoices = invoices.filter((i) => OUTSTANDING_STATUSES.has(i.status));
  const overdueInvoices = outstandingInvoices.filter((i) => i.status === "overdue" || isPastDue(i, todayDateOnly));

  const recentInvoices = [...invoices].sort((a, b) => b.createdDate.localeCompare(a.createdDate)).slice(0, recentCount);

  return {
    outstanding: groupByCurrency(outstandingInvoices),
    overdue: groupByCurrency(overdueInvoices),
    overdueCount: overdueInvoices.length,
    draftCount: invoices.filter((i) => i.status === "draft").length,
    recentInvoices
  };
}
