import { pdf } from "@react-pdf/renderer";
import { getTemplate } from "./templateRegistry";
import { getPdfLabels } from "./labels";
import type { Invoice } from "@/types";

/** Always generated fresh from the invoice's CURRENT data — never cached, so it can never go stale. */
export async function generateInvoicePdfBlob(invoice: Invoice): Promise<Blob> {
  const { Component: Template } = getTemplate(invoice.templateId);
  const labels = getPdfLabels(invoice.pdfLanguage);
  return pdf(<Template invoice={invoice} labels={labels} />).toBlob();
}

export function invoicePdfFileName(invoice: Invoice): string {
  return `${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
}

export async function generateInvoicePdfFile(invoice: Invoice): Promise<File> {
  const blob = await generateInvoicePdfBlob(invoice);
  return new File([blob], invoicePdfFileName(invoice), { type: "application/pdf" });
}
