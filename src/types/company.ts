import type { BankDetails } from "./bankDetails";

export interface Company {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
  email?: string;
  phone?: string;
  website?: string;
  vatId?: string;
  taxNumber?: string;
  logoDataUrl?: string;
  bankDetails?: BankDetails;
  /** ISO code, e.g. "de" | "en". Used as the default PDF language for new invoices. */
  defaultInvoiceLanguage: "de" | "en";
  /** ISO 4217 code, e.g. "EUR" | "USD" | "GEL". Used as the default currency for new invoices issued by this company — each company can bill in its own currency. */
  defaultCurrency: string;
  /**
   * Each company has its own invoice numbering — otherwise switching to a
   * company that's never had an invoice would start at whatever number the
   * previously-active company had reached. e.g. "INV-{YYYY}-{seq:4}",
   * parsed by utils/invoiceNumber.ts.
   */
  invoiceNumberFormat: string;
  nextInvoiceSequence: number;
  createdAt: string;
  updatedAt: string;
}
