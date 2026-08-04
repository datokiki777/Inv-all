import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { itemTotal, formatMoney } from "@/utils/money";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";

interface Props {
  invoice: Invoice;
  labels: InvoicePdfLabels;
  accentColor: string;
  locale: string;
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc", paddingBottom: 4, marginBottom: 4 },
  row: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 0.5, borderColor: "#eee" },
  colDesc: { flex: 4, fontSize: 9 },
  colQty: { flex: 0.8, fontSize: 9, textAlign: "right" },
  colUnit: { flex: 1, fontSize: 9, textAlign: "right" },
  colPrice: { flex: 1.4, fontSize: 9, textAlign: "right" },
  colVat: { flex: 1, fontSize: 9, textAlign: "right" },
  colTotal: { flex: 1.4, fontSize: 9, textAlign: "right" },
  headerText: { fontSize: 8, color: "#888", textTransform: "uppercase" }
});

/**
 * Line-items table. `fixed` + `wrap` (react-pdf defaults for View rows) let
 * @react-pdf/renderer break the table across pages and repeat this header
 * automatically — no manual pagination logic lives here. The "Unit" column
 * is optional (pdfVisibility.showItemUnitColumn) — flex-based widths mean
 * the remaining columns simply reflow to fill the space when it's hidden.
 */
export function InvoiceItemsTable({ invoice, labels, accentColor, locale }: Props) {
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  const showUnit = visibility.showItemUnitColumn;

  return (
    <View>
      <View style={styles.headerRow} fixed>
        <Text style={[styles.colDesc, styles.headerText]}>{labels.description}</Text>
        <Text style={[styles.colQty, styles.headerText]}>{labels.quantity}</Text>
        {showUnit ? <Text style={[styles.colUnit, styles.headerText]}>{labels.unit}</Text> : null}
        <Text style={[styles.colPrice, styles.headerText]}>{labels.unitPrice}</Text>
        <Text style={[styles.colVat, styles.headerText]}>{labels.vat}</Text>
        <Text style={[styles.colTotal, styles.headerText, { color: accentColor }]}>{labels.lineTotal}</Text>
      </View>
      {invoice.items.map((item) => (
        <View key={item.id} style={styles.row} wrap={false}>
          <Text style={styles.colDesc}>{item.name}</Text>
          <Text style={styles.colQty}>{item.quantity}</Text>
          {showUnit ? <Text style={styles.colUnit}>{labels.units[item.unit]}</Text> : null}
          <Text style={styles.colPrice}>{formatMoney(item.unitPriceCents, invoice.currency, locale)}</Text>
          <Text style={styles.colVat}>{item.vatPercent}%</Text>
          <Text style={styles.colTotal}>{formatMoney(itemTotal(item), invoice.currency, locale)}</Text>
        </View>
      ))}
    </View>
  );
}
