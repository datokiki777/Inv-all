import { Document, Page, View, StyleSheet } from "@react-pdf/renderer";
import type { InvoicePdfTemplateProps } from "../types";
import { InvoiceHeader } from "../components/InvoiceHeader";
import { InvoiceParties } from "../components/InvoiceParties";
import { InvoiceItemsTable } from "../components/InvoiceItemsTable";
import { InvoiceVatSummaryTable } from "../components/InvoiceVatSummaryTable";
import { InvoiceTotals } from "../components/InvoiceTotals";
import { InvoiceFooter } from "../components/InvoiceFooter";
import { PDF_FONT_FAMILY } from "../fonts";

const ACCENT = "#2F6F5E"; // deep teal — deliberately distinct from Classic's navy and Modern's coral

// Tighter padding and smaller base font than the other templates —
// optimized for invoices with many line items. A left accent spine and a
// solid-fill zebra-striped items table (see InvoiceItemsTable variant)
// give this a dense "ledger" identity, visually distinct from Classic's
// ruled formality and Minimal's decoration-free openness.
const styles = StyleSheet.create({
  page: { paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 30, fontFamily: PDF_FONT_FAMILY, fontSize: 8.5, color: "#111" },
  spine: { position: "absolute", top: 0, left: 0, bottom: 0, width: 6, backgroundColor: ACCENT }
});

/** Compact — dense "ledger" layout: left accent spine, zebra-striped items table, minimal whitespace. */
export function CompactInvoiceTemplate({ invoice, labels }: InvoicePdfTemplateProps) {
  const locale = invoice.pdfLanguage === "de" ? "de-DE" : "en-US";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.spine} fixed />
        <InvoiceHeader invoice={invoice} labels={labels} accentColor={ACCENT} />
        <InvoiceParties invoice={invoice} labels={labels} />
        <InvoiceItemsTable invoice={invoice} labels={labels} accentColor={ACCENT} locale={locale} variant="zebra" />
        <InvoiceVatSummaryTable invoice={invoice} labels={labels} locale={locale} />
        <InvoiceTotals invoice={invoice} labels={labels} accentColor={ACCENT} locale={locale} />
        <InvoiceFooter invoice={invoice} labels={labels} />
      </Page>
    </Document>
  );
}
