import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { InvoicePdfTemplateProps } from "../types";
import { InvoiceHeader } from "../components/InvoiceHeader";
import { InvoiceParties } from "../components/InvoiceParties";
import { InvoiceItemsTable } from "../components/InvoiceItemsTable";
import { InvoiceVatSummaryTable } from "../components/InvoiceVatSummaryTable";
import { InvoiceTotals } from "../components/InvoiceTotals";
import { InvoiceFooter } from "../components/InvoiceFooter";
import { formatMoney } from "@/utils/money";
import { PDF_FONT_FAMILY } from "../fonts";

const ACCENT = "#c9634f";

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: PDF_FONT_FAMILY, fontSize: 10, color: "#111" },
  banner: {
    backgroundColor: ACCENT,
    marginHorizontal: -32,
    marginTop: -32,
    marginBottom: 20,
    padding: 24,
    color: "#fff"
  },
  bannerTotal: { fontSize: 22 },
  bannerNumber: { fontSize: 10, opacity: 0.85, marginTop: 4 }
});

/**
 * Modern — leads with a colored banner surfacing the total and invoice
 * number up front, prioritizing visual hierarchy over tradition.
 */
export function ModernInvoiceTemplate({ invoice, labels }: InvoicePdfTemplateProps) {
  const locale = invoice.pdfLanguage === "de" ? "de-DE" : "en-US";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.banner}>
          <Text style={styles.bannerTotal}>{formatMoney(invoice.totalCents, invoice.currency, locale)}</Text>
          <Text style={styles.bannerNumber}>
            {labels.invoiceNumber} {invoice.invoiceNumber}
          </Text>
        </View>
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
