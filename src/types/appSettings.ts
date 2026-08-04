import type { InvoiceTemplateId } from "./invoiceTemplate";
import type { InvoiceLanguage, InvoicePdfVisibility } from "./invoice";

export interface AppSettings {
  id: "app-settings";
  interfaceLanguage: InvoiceLanguage;
  defaultInvoiceTemplateId: InvoiceTemplateId;
  defaultInvoiceLanguage: InvoiceLanguage;
  defaultCurrency: string;
  /** e.g. "INV-{YYYY}-{seq:4}" — parsed by utils/invoiceNumber.ts. */
  invoiceNumberFormat: string;
  nextInvoiceSequence: number;
  /**
   * The "Show in PDF" switch state last used on any saved invoice — new
   * invoices start from this instead of always resetting to all-visible,
   * so a preference like "hide my phone number" sticks around. Not shown
   * in the Settings form; invoiceService updates it automatically on save.
   */
  lastInvoicePdfVisibility?: InvoicePdfVisibility;
  updatedAt: string;
}
