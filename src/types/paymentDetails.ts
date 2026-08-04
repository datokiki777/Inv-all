import type { BankDetails } from "./bankDetails";

export type PaymentMethod = "bankTransfer" | "cash" | "paypal" | "other";

export interface PaymentDetails {
  method: PaymentMethod;
  bankDetails?: BankDetails;
  /** e.g. "Payment due within 14 days, no discount." Rendered verbatim on the PDF. */
  paymentTermsText?: string;
}
