import { invoiceRepository, settingsRepository } from "@/storage/repositories";
import { generateId } from "@/utils/id";
import { nowIso, todayDateOnly, addDays } from "@/utils/date";
import { generateInvoiceNumber } from "@/utils/invoiceNumber";
import { computeInvoiceTotals } from "@/utils/money";
import { resolveItemsForTaxMode } from "@/utils/invoiceTax";
import { formDiscountToDiscount, formItemsToInvoiceItems } from "@/utils/invoiceFormMapping";
import type { Invoice, Company, Client, ClientSnapshot, TaxSettings } from "@/types";
import type { InvoiceFormValues } from "@/schemas";

function toClientSnapshot(client: Client): ClientSnapshot {
  const { createdAt: _createdAt, updatedAt: _updatedAt, notes: _notes, ...snapshot } = client;
  return snapshot;
}

function toTaxSettings(values: InvoiceFormValues): TaxSettings {
  return {
    mode: values.taxMode,
    ratePercent: values.taxMode === "reverseCharge" || values.taxMode === "taxFree" ? undefined : values.taxRatePercent,
    explanationText: values.taxExplanationText
  };
}

interface InvoiceContext {
  company: Company;
  client: Client;
}

/**
 * Orchestration between the Invoice form and invoiceRepository. This is
 * the one place that: resolves the client snapshot, converts decimal
 * amounts to cents, applies the tax-mode rule (resolveItemsForTaxMode),
 * and runs the pure computeInvoiceTotals(). The form and the PDF layer
 * never duplicate this logic.
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
    const taxSettings = toTaxSettings(values);
    const items = resolveItemsForTaxMode(formItemsToInvoiceItems(values.items), taxSettings);
    const discount = formDiscountToDiscount(values.discountType, values.discountValue);
    const paidAmountCents = Math.round(values.paidAmount * 100);
    const totals = computeInvoiceTotals(items, discount, paidAmountCents);

    const invoice: Invoice = {
      id: generateId(),
      invoiceNumber: values.invoiceNumber,
      createdDate: values.createdDate,
      serviceDate: values.serviceDate ?? "",
      dueDate: values.dueDate ?? "",
      company: context.company,
      client: toClientSnapshot(context.client),
      items,
      taxSettings,
      discount,
      currency: values.currency,
      ...totals,
      paidAmountCents,
      note: values.note,
      paymentDetails: {
        method: values.paymentMethod,
        bankDetails: values.paymentMethod === "bankTransfer" ? context.company.bankDetails : undefined,
        paymentTermsText: values.paymentTermsText
      },
      status: values.status,
      templateId: values.templateId,
      pdfLanguage: values.pdfLanguage,
      pdfVisibility: values.pdfVisibility,
      createdAt: now,
      updatedAt: now
    };

    await invoiceRepository.save(invoice);
    await reserveInvoiceNumberIfMatchingSuggestion(values.invoiceNumber);
    await rememberLastPdfVisibility(values.pdfVisibility);
    return invoice;
  },

  async update(existing: Invoice, values: InvoiceFormValues, context: InvoiceContext): Promise<Invoice> {
    const taxSettings = toTaxSettings(values);
    const items = resolveItemsForTaxMode(formItemsToInvoiceItems(values.items), taxSettings);
    const discount = formDiscountToDiscount(values.discountType, values.discountValue);
    const paidAmountCents = Math.round(values.paidAmount * 100);
    const totals = computeInvoiceTotals(items, discount, paidAmountCents);

    const invoice: Invoice = {
      ...existing,
      invoiceNumber: values.invoiceNumber,
      createdDate: values.createdDate,
      serviceDate: values.serviceDate ?? "",
      dueDate: values.dueDate ?? "",
      company: context.company,
      client: toClientSnapshot(context.client),
      items,
      taxSettings,
      discount,
      currency: values.currency,
      ...totals,
      paidAmountCents,
      note: values.note,
      paymentDetails: {
        method: values.paymentMethod,
        bankDetails: values.paymentMethod === "bankTransfer" ? context.company.bankDetails : undefined,
        paymentTermsText: values.paymentTermsText
      },
      status: values.status,
      templateId: values.templateId,
      pdfLanguage: values.pdfLanguage,
      pdfVisibility: values.pdfVisibility,
      updatedAt: nowIso()
    };

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
