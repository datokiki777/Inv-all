import { invoiceRepository, settingsRepository, companyRepository } from "@/storage/repositories";
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
 * persistence side effects (sequence reservation, remembering defaults).
 *
 * Invoice numbering is per-company (Company.invoiceNumberFormat /
 * Company.nextInvoiceSequence) — every function here that touches
 * numbering takes a companyId and reads/writes that specific company's
 * counter, never a shared global one.
 */
export const invoiceService = {
  async list(): Promise<Invoice[]> {
    return invoiceRepository.getAll();
  },

  async getById(id: string): Promise<Invoice | undefined> {
    return invoiceRepository.getById(id);
  },

  /** Suggested next number for this company, WITHOUT reserving it — used only to prefill the form. */
  async suggestNextInvoiceNumber(companyId: string): Promise<string> {
    const company = await companyRepository.getById(companyId);
    if (!company) return generateInvoiceNumber("INV-{YYYY}-{seq:4}", 1);
    return generateInvoiceNumber(company.invoiceNumberFormat || "INV-{YYYY}-{seq:4}", company.nextInvoiceSequence || 1);
  },

  async create(values: InvoiceFormValues, context: InvoiceContext): Promise<Invoice> {
    const now = nowIso();
    const invoice = buildInvoiceFromForm(values, { id: generateId(), createdAt: now }, context.company, context.client, now);

    await invoiceRepository.save(invoice);
    await reserveInvoiceNumberIfMatchingSuggestion(context.company.id, values.invoiceNumber);
    await rememberFormDefaults(context.company.id, values);
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
    await rememberFormDefaults(context.company.id, values);
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
   * fresh id, a newly-suggested invoice number reserved against the same
   * company the source invoice belonged to, reset to draft/unpaid, and
   * dates moved to today.
   */
  async duplicate(source: Invoice): Promise<Invoice> {
    const now = nowIso();
    const newNumber = await this.suggestNextInvoiceNumber(source.company.id);
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
    await reserveInvoiceNumberIfMatchingSuggestion(source.company.id, newNumber);
    return invoice;
  }
};

/**
 * Bumps this company's nextInvoiceSequence only when the saved number
 * matches its auto-suggested one, so a manually-typed custom number
 * doesn't burn a sequence slot that was never actually used.
 */
async function reserveInvoiceNumberIfMatchingSuggestion(companyId: string, usedNumber: string): Promise<void> {
  const company = await companyRepository.getById(companyId);
  if (!company) return;
  const format = company.invoiceNumberFormat || "INV-{YYYY}-{seq:4}";
  const sequence = company.nextInvoiceSequence || 1;
  const suggested = generateInvoiceNumber(format, sequence);
  if (usedNumber === suggested) {
    await companyRepository.save({ ...company, invoiceNumberFormat: format, nextInvoiceSequence: sequence + 1, updatedAt: nowIso() });
  }
}

/**
 * Remembers which company, which "Show in PDF" state, and which Notes
 * text were last used, as the starting point for the next new invoice —
 * so preferences (a particular company, hiding a phone number, a
 * recurring note) stick instead of resetting every time. One settings
 * write for all three, rather than separate saves per invoice save.
 */
async function rememberFormDefaults(companyId: string, values: Pick<InvoiceFormValues, "pdfVisibility" | "note">): Promise<void> {
  const settings = await settingsRepository.get();
  await settingsRepository.save({
    ...settings,
    lastUsedCompanyId: companyId,
    lastInvoicePdfVisibility: values.pdfVisibility,
    lastNoteText: values.note,
    updatedAt: nowIso()
  });
}
