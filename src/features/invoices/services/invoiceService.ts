import { invoiceRepository, settingsRepository } from "@/storage/repositories";
import { generateId } from "@/utils/id";
import { nowIso, todayDateOnly, addDays } from "@/utils/date";
import { generateInvoiceNumber } from "@/utils/invoiceNumber";
import { buildInvoiceFromForm } from "@/utils/invoiceFormMapping";
import type { Invoice, Company, Client } from "@/types";
import type { InvoiceFormValues } from "@/schemas";

interface InvoiceContext {
  company: Company;
  client: Client;
}

/**
 * Orchestration between the Invoice form and invoiceRepository. The
 * actual field mapping/calculation lives in the pure
 * buildInvoiceFromForm() (utils/invoiceFormMapping.ts), shared with the
 * in-form live preview — this layer only adds id/timestamp handling and
 * persistence side effects (sequence reservation, remembering visibility).
 */
export const invoiceService = {
  async list(): Promise<Invoice[]> {
    return invoiceRepository.getAll();
  },

  async getById(id: string): Promise<Invoice | undefined> {
    return invoiceRepository.getById(id);
  },

  /** Suggested next number, WITHOUT reserving it — used only to prefill the form. */
  async suggestNextInvoiceNumber(): Promise<string> {
    const settings = await settingsRepository.get();
    return generateInvoiceNumber(settings.invoiceNumberFormat, settings.nextInvoiceSequence);
  },

  async create(values: InvoiceFormValues, context: InvoiceContext): Promise<Invoice> {
    const now = nowIso();
    const invoice = buildInvoiceFromForm(values, { id: generateId(), createdAt: now }, context.company, context.client, now);

    await invoiceRepository.save(invoice);
    await reserveInvoiceNumberIfMatchingSuggestion(values.invoiceNumber);
    await rememberLastPdfVisibility(values.pdfVisibility);
    return invoice;
  },

  async update(existing: Invoice, values: InvoiceFormValues, context: InvoiceContext): Promise<Invoice> {
    const invoice = buildInvoiceFromForm(
      values,
      { id: existing.id, createdAt: existing.createdAt },
      context.company,
      context.client,
      nowIso()
    );

    await invoiceRepository.save(invoice);
    await rememberLastPdfVisibility(values.pdfVisibility);
    return invoice;
  },

  async remove(id: string): Promise<void> {
    await invoiceRepository.remove(id);
  },

  /**
   * Quick status change (Dashboard / Invoices list) without going through
   * the full edit form. Since "Paid amount" is no longer editable on the
   * invoice form, this is also the only place paidAmountCents can change:
   * marking "paid" assumes full payment; marking "partiallyPaid" requires
   * the caller to supply how much was actually paid (the UI prompts for
   * it). Any other status leaves the existing paid amount untouched.
   */
  async updateStatus(id: string, status: Invoice["status"], paidAmountCents?: number): Promise<Invoice> {
    const existing = await invoiceRepository.getById(id);
    if (!existing) throw new Error(`Invoice ${id} not found`);

    const nextPaidAmountCents =
      paidAmountCents !== undefined
        ? paidAmountCents
        : status === "paid"
          ? existing.totalCents
          : existing.paidAmountCents;

    const updated: Invoice = {
      ...existing,
      status,
      paidAmountCents: nextPaidAmountCents,
      remainingAmountCents: existing.totalCents - nextPaidAmountCents,
      updatedAt: nowIso()
    };
    await invoiceRepository.save(updated);
    return updated;
  },

  /**
   * Duplicates an invoice: same client/company/items/tax/discount, but a
   * fresh id, a newly-suggested invoice number (sequence reserved like any
   * other create), reset to draft/unpaid, and dates moved to today.
   */
  async duplicate(source: Invoice): Promise<Invoice> {
    const now = nowIso();
    const newNumber = await this.suggestNextInvoiceNumber();
    const today = todayDateOnly();

    const invoice: Invoice = {
      ...source,
      id: generateId(),
      invoiceNumber: newNumber,
      createdDate: today,
      serviceDate: today,
      dueDate: addDays(today, 14),
      status: "draft",
      paidAmountCents: 0,
      remainingAmountCents: source.totalCents,
      createdAt: now,
      updatedAt: now
    };

    await invoiceRepository.save(invoice);
    await reserveInvoiceNumberIfMatchingSuggestion(newNumber);
    return invoice;
  }
};

/**
 * Bumps AppSettings.nextInvoiceSequence only when the saved number matches
 * the auto-suggested one, so a manually-typed custom number doesn't burn a
 * sequence slot that was never actually used.
 */
async function reserveInvoiceNumberIfMatchingSuggestion(usedNumber: string): Promise<void> {
  const settings = await settingsRepository.get();
  const suggested = generateInvoiceNumber(settings.invoiceNumberFormat, settings.nextInvoiceSequence);
  if (usedNumber === suggested) {
    await settingsRepository.save({
      ...settings,
      nextInvoiceSequence: settings.nextInvoiceSequence + 1,
      updatedAt: nowIso()
    });
  }
}

/**
 * Remembers the "Show in PDF" state as the starting point for the next new
 * invoice, so a preference (e.g. always hiding a phone number) sticks
 * instead of resetting to all-visible every time.
 */
async function rememberLastPdfVisibility(pdfVisibility: InvoiceFormValues["pdfVisibility"]): Promise<void> {
  const settings = await settingsRepository.get();
  await settingsRepository.save({ ...settings, lastInvoicePdfVisibility: pdfVisibility, updatedAt: nowIso() });
}
