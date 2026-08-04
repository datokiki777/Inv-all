import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import type { InvoicePdfTemplateProps } from "../types";
import { InvoiceHeader } from "../components/InvoiceHeader";
import { InvoiceParties } from "../components/InvoiceParties";
import { InvoiceItemsTable } from "../components/InvoiceItemsTable";
import { InvoiceVatSummaryTable } from "../components/InvoiceVatSummaryTable";
import { InvoiceTotals } from "../components/InvoiceTotals";
import { InvoiceFooter } from "../components/InvoiceFooter";
import { PDF_FONT_FAMILY } from "../fonts";

const ACCENT = "#3a3a3a";

// Tighter padding and smaller base font than the other templates —
// optimized for invoices with many line items.
const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: PDF_FONT_FAMILY, fontSize: 8.5, color: "#111" }
});

/** Compact — minimal whitespace, maximum line items per page. */
export function CompactInvoiceTemplate({ invoice, labels }: InvoicePdfTemplateProps) {
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
