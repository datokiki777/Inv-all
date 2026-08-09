import type { InvoiceTemplateId } from "./invoiceTemplate";
import type { InvoiceLanguage, InvoicePdfVisibility } from "./invoice";

export interface AppSettings {
  id: "app-settings";
  interfaceLanguage: InvoiceLanguage;
  defaultInvoiceTemplateId: InvoiceTemplateId;
  defaultInvoiceLanguage: InvoiceLanguage;
  defaultCurrency: string;
  /**
   * The most recently used company — new invoices default to this one
   * instead of always falling back to "the first company", so multi-company
   * use feels like it "remembers where you left off". Not shown in the
   * Settings form; invoiceService updates it automatically on save.
   */
  lastUsedCompanyId?: string;
  /**
   * The "Show in PDF" switch state last used on any saved invoice — new
   * invoices start from this instead of always resetting to all-visible,
   * so a preference like "hide my phone number" sticks around. Not shown
   * in the Settings form; invoiceService updates it automatically on save.
   */
  lastInvoicePdfVisibility?: InvoicePdfVisibility;
  /** Last note text used on a saved invoice — new invoices start from this so a recurring note doesn't need retyping. */
  lastNoteText?: string;
  updatedAt: string;
}
