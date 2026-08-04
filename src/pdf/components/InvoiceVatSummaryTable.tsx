import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { computeVatBreakdown } from "@/utils/money";
import { formatMoney } from "@/utils/money";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";

interface Props {
  invoice: Invoice;
  labels: InvoicePdfLabels;
  locale: string;
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 12, width: 260 },
  title: { fontSize: 8, color: "#888", textTransform: "uppercase", marginBottom: 4 },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc", paddingBottom: 3, marginBottom: 2 },
  row: { flexDirection: "row", paddingVertical: 2 },
  colRate: { flex: 1, fontSize: 8, color: "#333" },
  colAmount: { flex: 1.3, fontSize: 8, color: "#333", textAlign: "right" },
  headerText: { fontSize: 7.5, color: "#888", textTransform: "uppercase" }
});

/**
 * Per-VAT-rate breakdown (rate / net / VAT / total), computed by the same
 * pure computeVatBreakdown() used nowhere else — never re-derived from
 * scratch in the template. Renders nothing for Reverse Charge / tax-free
 * invoices (there's no rate to break down) or when toggled off.
 */
export function InvoiceVatSummaryTable({ invoice, labels, locale }: Props) {
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  if (!visibility.showVatSummaryTable) return null;
  if (invoice.taxSettings.mode === "reverseCharge" || invoice.taxSettings.mode === "taxFree") return null;

  const rows = computeVatBreakdown(invoice.items, invoice.discount);
  if (rows.length === 0) return null;

  const fmt = (cents: number) => formatMoney(cents, invoice.currency, locale);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{labels.vatSummaryTitle}</Text>
      <View style={styles.headerRow}>
        <Text style={[styles.colRate, styles.headerText]}>{labels.vatSummaryRate}</Text>
        <Text style={[styles.colAmount, styles.headerText]}>{labels.vatSummaryNet}</Text>
        <Text style={[styles.colAmount, styles.headerText]}>{labels.vatSummaryVat}</Text>
        <Text style={[styles.colAmount, styles.headerText]}>{labels.vatSummaryTotal}</Text>
      </View>
      {rows.map((row) => (
        <View key={row.vatPercent} style={styles.row}>
          <Text style={styles.colRate}>{row.vatPercent}%</Text>
          <Text style={styles.colAmount}>{fmt(row.netCents)}</Text>
          <Text style={styles.colAmount}>{fmt(row.vatCents)}</Text>
          <Text style={styles.colAmount}>{fmt(row.netCents + row.vatCents)}</Text>
        </View>
      ))}
    </View>
  );
}
