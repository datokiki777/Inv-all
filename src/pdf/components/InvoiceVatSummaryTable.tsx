import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { computeVatBreakdown, formatMoney } from "@/utils/money";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";
import { taxModeLabel } from "../taxModeLabel";

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
  colRate: { flex: 1.7, fontSize: 8, color: "#333" },
  colAmount: { flex: 1.1, fontSize: 8, color: "#333", textAlign: "right" },
  headerText: { fontSize: 7.5, color: "#888", textTransform: "uppercase" },
  customCaption: { fontSize: 7.5, color: "#888", marginTop: 3 }
});

/**
 * Per-VAT-rate breakdown (rate / net / VAT / total). For Standard/Custom,
 * each row's numbers come from the same pure computeVatBreakdown() used
 * nowhere else. For Reverse Charge / Tax-free — where every item's VAT is
 * forced to 0% (see resolveItemsForTaxMode) — this still renders using
 * the exact same table shape, but with the tax treatment itself
 * (explanation text, or a short default label) in the rate column instead
 * of a percentage. That's the ONE place this ever shows now; there's no
 * separate footer note duplicating it.
 */
export function InvoiceVatSummaryTable({ invoice, labels, locale }: Props) {
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  if (!visibility.showVatSummaryTable) return null;

  const fmt = (cents: number) => formatMoney(cents, invoice.currency, locale);
  const mode = invoice.taxSettings.mode;

  const rows =
    mode === "reverseCharge" || mode === "taxFree"
      ? [{ label: taxModeLabel(invoice, labels), netCents: invoice.taxableAmountCents, vatCents: 0 }]
      : computeVatBreakdown(invoice.items, invoice.discount).map((row) => ({
          label: `${row.vatPercent}%`,
          netCents: row.netCents,
          vatCents: row.vatCents
        }));

  if (rows.length === 0) return null;

  // "custom" mode can carry BOTH a real rate (already shown per-row above)
  // and free-typed context — a small caption line is enough for that,
  // not a whole separate box.
  const customCaption = mode === "custom" ? invoice.taxSettings.explanationText : undefined;

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
        <View key={row.label} style={styles.row}>
          <Text style={styles.colRate}>{row.label}</Text>
          <Text style={styles.colAmount}>{fmt(row.netCents)}</Text>
          <Text style={styles.colAmount}>{fmt(row.vatCents)}</Text>
          <Text style={styles.colAmount}>{fmt(row.netCents + row.vatCents)}</Text>
        </View>
      ))}
      {customCaption ? <Text style={styles.customCaption}>{customCaption}</Text> : null}
    </View>
  );
}
