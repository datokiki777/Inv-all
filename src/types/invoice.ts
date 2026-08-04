import type { Company } from "./company";
import type { ClientSnapshot } from "./client";
import type { TaxSettings } from "./taxSettings";
import type { PaymentDetails } from "./paymentDetails";
import type { InvoiceTemplateId } from "./invoiceTemplate";
import type { Unit } from "./product";

export type DiscountType = "percent" | "fixed";

export interface Discount {
  type: DiscountType;
  /** Percent as e.g. 10 for 10%, or a fixed amount in cents, depending on `type`. */
  value: number;
}

export interface InvoiceItem {
  id: string;
  /** Set when the item originated from a saved product; the row itself is a frozen copy. */
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: Unit;
  unitPriceCents: number;
  discount?: Discount;
  /** Per-item VAT percent, used when the invoice allows mixed rates. */
  vatPercent: number;
}

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partiallyPaid"
  | "overdue"
  | "cancelled";

export type InvoiceLanguage = "de" | "en";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdDate: string;
  /** Date the service/delivery was performed — distinct from createdDate. */
  serviceDate: string;
  dueDate: string;

  company: Company;
  client: ClientSnapshot;

  items: InvoiceItem[];

  taxSettings: TaxSettings;
  discount?: Discount;

  currency: string;

  /** All monetary totals in the smallest currency unit (cents). Derived by
   *  pure functions in utils/money.ts, never computed inline in the UI. */
  subtotalCents: number;
  discountCents: number;
  taxableAmountCents: number;
  vatCents: number;
  totalCents: number;
  paidAmountCents: number;
  remainingAmountCents: number;

  note?: string;
  paymentDetails: PaymentDetails;
  status: InvoiceStatus;
  templateId: InvoiceTemplateId;
  pdfLanguage: InvoiceLanguage;

  createdAt: string;
  updatedAt: string;
}
