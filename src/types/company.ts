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
  createdAt: string;
  updatedAt: string;
}
