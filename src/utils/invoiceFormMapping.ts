import { generateId } from "@/utils/id";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";
import { computeInvoiceTotals } from "@/utils/money";
import { resolveItemsForTaxMode } from "@/utils/invoiceTax";
import type { Client, ClientSnapshot, Company, Discount, Invoice, InvoiceItem, TaxSettings, Unit } from "@/types";
import type { InvoiceFormValues, InvoiceItemFormValues } from "@/schemas";

/**
 * Pure mapping helpers shared by invoiceService (final save) and
 * InvoiceTotalsPreview (live preview while typing), so the two can never
 * compute totals from a subtly different shape of the same form data.
 */

type DiscountFormType = "none" | "percent" | "fixed";

/**
 * Fixed-amount discount values are entered in the form as decimal major
 * currency units (e.g. 100 meaning €100), but `Discount.value` for a
 * "fixed" discount is defined in cents everywhere else (money.ts applies
 * it directly against amountCents) — so it must be converted here, the
 * one place a form value turns into a Discount. Percent discounts need
 * no conversion; the number IS the percentage.
 */
export function formDiscountToDiscount(type: DiscountFormType, value: number | undefined): Discount | undefined {
  if (type === "none") return undefined;
  if (type === "fixed") return { type, value: Math.round((value ?? 0) * 100) };
  return { type, value: value ?? 0 };
}

export function formItemToInvoiceItem(item: Partial<InvoiceItemFormValues>): InvoiceItem {
  return {
    id: item.rowId ?? generateId(),
    productId: item.productId,
    name: item.name ?? "",
    description: item.description,
    quantity: item.quantity || 0,
    unit: item.unit ?? "unit",
    unitPriceCents: Math.round((item.unitPrice || 0) * 100),
    discount: formDiscountToDiscount(item.discountType ?? "none", item.discountValue),
    vatPercent: item.vatPercent || 0
  };
}

export function formItemsToInvoiceItems(items: Partial<InvoiceItemFormValues>[]): InvoiceItem[] {
  return items.map(formItemToInvoiceItem);
}

/** Reverse of formDiscountToDiscount — converts a fixed discount's cents back to decimal major units for display. */
function discountToFormDiscount(discount: Discount | undefined): Pick<InvoiceItemFormValues, "discountType" | "discountValue"> {
  if (!discount) return { discountType: "none", discountValue: undefined };
  if (discount.type === "fixed") return { discountType: "fixed", discountValue: discount.value / 100 };
  return { discountType: discount.type, discountValue: discount.value };
}

function invoiceItemToFormItem(item: InvoiceItem): InvoiceItemFormValues {
  return {
    rowId: item.id,
    productId: item.productId,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPriceCents / 100,
    vatPercent: item.vatPercent,
    ...discountToFormDiscount(item.discount)
  };
}

/** Reverse of the create/update mapping — used to prefill the form in edit mode. */
export function invoiceToFormValues(invoice: Invoice): InvoiceFormValues {
  return {
    invoiceNumber: invoice.invoiceNumber,
    createdDate: invoice.createdDate,
    serviceDate: invoice.serviceDate,
    dueDate: invoice.dueDate,
    clientId: invoice.client.id,
    companyId: invoice.company.id,
    items: invoice.items.map(invoiceItemToFormItem),
    taxMode: invoice.taxSettings.mode,
    taxRatePercent: invoice.taxSettings.ratePercent,
    taxExplanationText: invoice.taxSettings.explanationText,
    ...discountToFormDiscount(invoice.discount),
    currency: invoice.currency,
    paidAmount: invoice.paidAmountCents / 100,
    note: invoice.note,
    paymentMethod: invoice.paymentDetails.method,
    paymentTermsText: invoice.paymentDetails.paymentTermsText,
    status: invoice.status,
    templateId: invoice.templateId,
    pdfLanguage: invoice.pdfLanguage,
    pdfVisibility: resolvePdfVisibility(invoice.pdfVisibility)
  };
}

/** Default values for a freshly-appended row (also used for the form's initial single row). */
export function blankInvoiceFormItem(defaultVatPercent = 19, defaultUnit: Unit = "hour"): InvoiceItemFormValues {
  return {
    rowId: generateId(),
    productId: undefined,
    name: "",
    description: "",
    quantity: 1,
    unit: defaultUnit,
    unitPrice: 0,
    discountType: "none",
    discountValue: undefined,
    vatPercent: defaultVatPercent
  };
}

function toClientSnapshot(client: Client): ClientSnapshot {
  const { createdAt: _createdAt, updatedAt: _updatedAt, notes: _notes, ...snapshot } = client;
  return snapshot;
}

function toTaxSettings(values: Pick<InvoiceFormValues, "taxMode" | "taxRatePercent" | "taxExplanationText">): TaxSettings {
  return {
    mode: values.taxMode,
    ratePercent: values.taxMode === "reverseCharge" || values.taxMode === "taxFree" ? undefined : values.taxRatePercent,
    explanationText: values.taxExplanationText
  };
}

interface InvoiceIdentity {
  id: string;
  createdAt: string;
}

/**
 * The single place that turns form values + the selected Company/Client
 * into a fully-computed Invoice: resolves the client snapshot, converts
 * decimal amounts to cents, applies the tax-mode rule
 * (resolveItemsForTaxMode), and runs computeInvoiceTotals(). Used by
 * invoiceService for the real save AND by the in-form live PDF preview
 * (InvoiceLivePreview) for an unsaved draft — so what you see in the
 * preview tab is guaranteed to match what actually gets saved, computed
 * by the exact same function either way.
 */
export function buildInvoiceFromForm(
  values: InvoiceFormValues,
  identity: InvoiceIdentity,
  company: Company,
  client: Client,
  updatedAt: string
): Invoice {
  const taxSettings = toTaxSettings(values);
  const items = resolveItemsForTaxMode(formItemsToInvoiceItems(values.items), taxSettings);
  const discount = formDiscountToDiscount(values.discountType, values.discountValue);
  const paidAmountCents = Math.round((values.paidAmount || 0) * 100);
  const totals = computeInvoiceTotals(items, discount, paidAmountCents);

  return {
    id: identity.id,
    invoiceNumber: values.invoiceNumber,
    createdDate: values.createdDate,
    serviceDate: values.serviceDate ?? "",
    dueDate: values.dueDate ?? "",
    company,
    client: toClientSnapshot(client),
    items,
    taxSettings,
    discount,
    currency: values.currency,
    ...totals,
    paidAmountCents,
    note: values.note,
    paymentDetails: {
      method: values.paymentMethod,
      bankDetails: values.paymentMethod === "bankTransfer" ? company.bankDetails : undefined,
      paymentTermsText: values.paymentTermsText
    },
    status: values.status,
    templateId: values.templateId,
    pdfLanguage: values.pdfLanguage,
    pdfVisibility: values.pdfVisibility,
    createdAt: identity.createdAt,
    updatedAt
  };
}
