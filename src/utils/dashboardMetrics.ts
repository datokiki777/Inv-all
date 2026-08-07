import { compareInvoiceNumbers } from "@/utils/invoiceNumber";
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
  /** Sum of paidAmountCents across every non-cancelled invoice — actual money collected, including partial payments. */
  paid: CurrencyAmount[];
  /** Sum of totalCents across every non-cancelled invoice — everything ever issued, paid or not. */
  totalInvoiced: CurrencyAmount[];
  /** Count of every invoice regardless of status. */
  totalCount: number;
  /** Most recently created invoices, highest invoice number first. */
  recentInvoices: Invoice[];
}

const OUTSTANDING_STATUSES = new Set<Invoice["status"]>(["sent", "partiallyPaid", "overdue"]);

function isPastDue(invoice: Invoice, todayDateOnly: string): boolean {
  return (
    invoice.status !== "paid" && invoice.status !== "cancelled" && !!invoice.dueDate && invoice.dueDate < todayDateOnly
  );
}

function groupByCurrency(invoices: Invoice[], amountOf: (invoice: Invoice) => number): CurrencyAmount[] {
  const totals = new Map<string, number>();
  for (const invoice of invoices) {
    totals.set(invoice.currency, (totals.get(invoice.currency) ?? 0) + amountOf(invoice));
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
  const activeInvoices = invoices.filter((i) => i.status !== "cancelled");

  const recentInvoices = [...invoices]
    .sort((a, b) => compareInvoiceNumbers(b.invoiceNumber, a.invoiceNumber))
    .slice(0, recentCount);

  return {
    outstanding: groupByCurrency(outstandingInvoices, (i) => i.remainingAmountCents),
    overdue: groupByCurrency(overdueInvoices, (i) => i.remainingAmountCents),
    overdueCount: overdueInvoices.length,
    draftCount: invoices.filter((i) => i.status === "draft").length,
    paid: groupByCurrency(activeInvoices, (i) => i.paidAmountCents),
    totalInvoiced: groupByCurrency(activeInvoices, (i) => i.totalCents),
    totalCount: invoices.length,
    recentInvoices
  };
}
