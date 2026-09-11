import type { Invoice, Unit } from "@/types";
import type { PaymentMethod } from "@/types/paymentDetails";

/**
 * Contract every PDF template must implement. Templates receive only the
 * finished Invoice (already fully calculated) plus the resolved PDF
 * translation dictionary — never raw form state, and never a calculation
 * function. This is what keeps rendering fully decoupled from business logic.
 */
export interface InvoicePdfTemplateProps {
  invoice: Invoice;
  labels: InvoicePdfLabels;
}

export interface InvoicePdfLabels {
  invoiceNumber: string;
  createdDate: string;
  serviceDate: string;
  dueDate: string;
  billTo: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  vat: string;
  lineTotal: string;
  subtotal: string;
  discount: string;
  discountFixedLabel: string;
  vatTotal: string;
  total: string;
  paid: string;
  remaining: string;
  paymentDetails: string;
  paymentMethod: string;
  paymentMethods: Record<PaymentMethod, string>;
  paymentTerms: string;
  bankName: string;
  accountHolder: string;
  notes: string;
  page: string;
  of: string;
  reverseChargeNote: string;
  taxFreeNote: string;
  email: string;
  phone: string;
  vatId: string;
  taxNumber: string;
  vatSummaryTitle: string;
  vatSummaryRate: string;
  vatSummaryNet: string;
  vatSummaryVat: string;
  vatSummaryTotal: string;
  units: Record<Unit, string>;
}

export type InvoicePdfTemplateComponent = (props: InvoicePdfTemplateProps) => JSX.Element;
