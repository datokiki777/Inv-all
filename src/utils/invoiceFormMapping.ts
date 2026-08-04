import { generateId } from "@/utils/id";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";
import type { Discount, Invoice, InvoiceItem, Unit } from "@/types";
import type { InvoiceFormValues, InvoiceItemFormValues } from "@/schemas";

/**
 * Pure mapping helpers shared by invoiceService (final save) and
 * InvoiceTotalsPreview (live preview while typing), so the two can never
 * compute totals from a subtly different shape of the same form data.
 */

type DiscountFormType = "none" | "percent" | "fixed";

export function formDiscountToDiscount(type: DiscountFormType, value: number | undefined): Discount | undefined {
  if (type === "none") return undefined;
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

function discountToFormDiscount(discount: Discount | undefined): Pick<InvoiceItemFormValues, "discountType" | "discountValue"> {
  if (!discount) return { discountType: "none", discountValue: undefined };
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
