import type { Invoice } from "@/types";

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
  unitPrice: string;
  vat: string;
  lineTotal: string;
  subtotal: string;
  discount: string;
  vatTotal: string;
  total: string;
  paid: string;
  remaining: string;
  paymentDetails: string;
  notes: string;
  page: string;
  of: string;
  reverseChargeNote: string;
}

export type InvoicePdfTemplateComponent = (props: InvoicePdfTemplateProps) => JSX.Element;
