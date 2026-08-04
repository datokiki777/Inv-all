import type { InvoiceTemplateId } from "./invoiceTemplate";
import type { InvoiceLanguage } from "./invoice";

export interface AppSettings {
  id: "app-settings";
  interfaceLanguage: InvoiceLanguage;
  defaultInvoiceTemplateId: InvoiceTemplateId;
  defaultInvoiceLanguage: InvoiceLanguage;
  defaultCurrency: string;
  /** e.g. "INV-{YYYY}-{seq:4}" — parsed by utils/invoiceNumber.ts. */
  invoiceNumberFormat: string;
  nextInvoiceSequence: number;
  updatedAt: string;
}
