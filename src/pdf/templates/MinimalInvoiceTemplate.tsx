import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import type { InvoicePdfTemplateProps } from "../types";
import { InvoiceHeader } from "../components/InvoiceHeader";
import { InvoiceParties } from "../components/InvoiceParties";
import { InvoiceItemsTable } from "../components/InvoiceItemsTable";
import { InvoiceVatSummaryTable } from "../components/InvoiceVatSummaryTable";
import { InvoiceTotals } from "../components/InvoiceTotals";
import { InvoiceFooter } from "../components/InvoiceFooter";

const ACCENT = "#111111";

// Generous whitespace, no rules or fills — content carries the design.
const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#111" }
});

/** Minimal — light, decoration-free layout for short, simple invoices. */
export function MinimalInvoiceTemplate({ invoice, labels }: InvoicePdfTemplateProps) {
  const locale = invoice.pdfLanguage === "de" ? "de-DE" : "en-US";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <InvoiceHeader invoice={invoice} labels={labels} accentColor={ACCENT} />
        <InvoiceParties invoice={invoice} labels={labels} />
        <InvoiceItemsTable invoice={invoice} labels={labels} accentColor={ACCENT} locale={locale} />
        <InvoiceVatSummaryTable invoice={invoice} labels={labels} locale={locale} />
        <InvoiceTotals invoice={invoice} labels={labels} accentColor={ACCENT} locale={locale} />
        <InvoiceFooter invoice={invoice} labels={labels} />
      </Page>
    </Document>
  );
}
