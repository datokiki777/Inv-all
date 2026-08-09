import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import type { InvoicePdfTemplateProps } from "../types";
import { InvoiceHeader } from "../components/InvoiceHeader";
import { InvoiceParties } from "../components/InvoiceParties";
import { InvoiceItemsTable } from "../components/InvoiceItemsTable";
import { InvoiceVatSummaryTable } from "../components/InvoiceVatSummaryTable";
import { InvoiceTotals } from "../components/InvoiceTotals";
import { InvoiceFooter } from "../components/InvoiceFooter";
import { PDF_FONT_FAMILY } from "../fonts";

const ACCENT = "#A67C52"; // muted warm taupe, used sparingly — distinct from Classic's navy, Modern's coral, and Compact's teal

// Generous whitespace, no rules or fills anywhere, no table header line,
// no row dividers (see InvoiceItemsTable's "plain" variant) — content
// carries the design instead of borders or color blocks.
const styles = StyleSheet.create({
  page: { padding: 54, fontFamily: PDF_FONT_FAMILY, fontSize: 10, color: "#222" }
});

/** Minimal — airy, decoration-free layout: no rules, no fills, no table borders, wide margins. */
export function MinimalInvoiceTemplate({ invoice, labels }: InvoicePdfTemplateProps) {
  const locale = invoice.pdfLanguage === "de" ? "de-DE" : "en-US";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <InvoiceHeader invoice={invoice} labels={labels} accentColor={ACCENT} />
        <InvoiceParties invoice={invoice} labels={labels} />
        <InvoiceItemsTable invoice={invoice} labels={labels} accentColor={ACCENT} locale={locale} variant="plain" />
        <InvoiceVatSummaryTable invoice={invoice} labels={labels} locale={locale} />
        <InvoiceTotals invoice={invoice} labels={labels} accentColor={ACCENT} locale={locale} />
        <InvoiceFooter invoice={invoice} labels={labels} />
      </Page>
    </Document>
  );
}
