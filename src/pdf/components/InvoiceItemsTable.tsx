import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { itemTotal, formatMoney } from "@/utils/money";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";

export type ItemsTableVariant = "default" | "zebra" | "plain";

interface Props {
  invoice: Invoice;
  labels: InvoicePdfLabels;
  accentColor: string;
  locale: string;
  /**
   * Purely visual — never affects what's computed or which fields show.
   * "default": ruled header + hairline row dividers (Classic, Modern).
   * "zebra": solid tinted header band + alternating row shading, no
   *   dividers — a denser "ledger" look (Compact).
   * "plain": no header rule, no row dividers, generous row spacing — an
   *   airy, decoration-free look (Minimal).
   */
  variant?: ItemsTableVariant;
}

const styles = StyleSheet.create({
  headerRowDefault: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc", paddingBottom: 4, marginBottom: 4 },
  headerRowPlain: { flexDirection: "row", paddingBottom: 6, marginBottom: 6 },
  rowDefault: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 0.5, borderColor: "#eee" },
  rowPlain: { flexDirection: "row", paddingVertical: 7 },
  colDesc: { flex: 4, fontSize: 9 },
  itemName: { fontSize: 9 },
  itemDescription: { fontSize: 8, color: "#888", marginTop: 1 },
  colQty: { flex: 0.8, fontSize: 9, textAlign: "right" },
  colUnit: { flex: 1, fontSize: 9, textAlign: "right" },
  colPrice: { flex: 1.4, fontSize: 9, textAlign: "right" },
  colTotal: { flex: 1.4, fontSize: 9, textAlign: "right" },
  headerText: { fontSize: 8, color: "#888", textTransform: "uppercase" },
  headerTextOnFill: { fontSize: 8, color: "#fff", textTransform: "uppercase", opacity: 0.9 }
});

/**
 * Line-items table. `fixed` + `wrap` (react-pdf defaults for View rows) let
 * @react-pdf/renderer break the table across pages and repeat this header
 * automatically — no manual pagination logic lives here. The "Unit" column
 * is optional (pdfVisibility.showItemUnitColumn) — flex-based widths mean
 * the remaining columns simply reflow when it's hidden. There is no
 * per-item discount column — discounts are invoice-level only (see
 * InvoiceTotals). There is also no per-item VAT column: every item shares
 * one invoice-wide VAT rate (see TaxSettingsEditor), so repeating the same
 * percentage on every row would be redundant — the rate (and, if enabled,
 * a per-rate breakdown) already appears once in InvoiceVatSummaryTable and
 * the VAT total in InvoiceTotals.
 *
 * `variant` only changes borders/fills/spacing here — every number still
 * comes from the same itemTotal()/formatMoney() calls regardless of which
 * template renders it, so the four templates can never disagree on math.
 */
export function InvoiceItemsTable({ invoice, labels, accentColor, locale, variant = "default" }: Props) {
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  const showUnit = visibility.showItemUnitColumn;

  if (variant === "zebra") {
    return (
      <View>
        <View style={{ flexDirection: "row", backgroundColor: accentColor, paddingVertical: 5, paddingHorizontal: 4 }} fixed>
          <Text style={[styles.colDesc, styles.headerTextOnFill]}>{labels.description}</Text>
          <Text style={[styles.colQty, styles.headerTextOnFill]}>{labels.quantity}</Text>
          {showUnit ? <Text style={[styles.colUnit, styles.headerTextOnFill]}>{labels.unit}</Text> : null}
          <Text style={[styles.colPrice, styles.headerTextOnFill]}>{labels.unitPrice}</Text>
          <Text style={[styles.colTotal, styles.headerTextOnFill]}>{labels.lineTotal}</Text>
        </View>
        {invoice.items.map((item, index) => (
          <View
            key={item.id}
            style={{
              flexDirection: "row",
              paddingVertical: 4,
              paddingHorizontal: 4,
              backgroundColor: index % 2 === 1 ? "#f4f4f4" : "transparent"
            }}
            wrap={false}
          >
            <View style={styles.colDesc}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
            </View>
            <Text style={styles.colQty}>{item.quantity}</Text>
            {showUnit ? <Text style={styles.colUnit}>{labels.units[item.unit]}</Text> : null}
            <Text style={styles.colPrice}>{formatMoney(item.unitPriceCents, invoice.currency, locale)}</Text>
            <Text style={styles.colTotal}>{formatMoney(itemTotal(item), invoice.currency, locale)}</Text>
          </View>
        ))}
      </View>
    );
  }

  const headerRowStyle = variant === "plain" ? styles.headerRowPlain : styles.headerRowDefault;
  const rowStyle = variant === "plain" ? styles.rowPlain : styles.rowDefault;

  return (
    <View>
      <View style={headerRowStyle} fixed>
        <Text style={[styles.colDesc, styles.headerText]}>{labels.description}</Text>
        <Text style={[styles.colQty, styles.headerText]}>{labels.quantity}</Text>
        {showUnit ? <Text style={[styles.colUnit, styles.headerText]}>{labels.unit}</Text> : null}
        <Text style={[styles.colPrice, styles.headerText]}>{labels.unitPrice}</Text>
        <Text style={[styles.colTotal, styles.headerText, { color: accentColor }]}>{labels.lineTotal}</Text>
      </View>
      {invoice.items.map((item) => (
        <View key={item.id} style={rowStyle} wrap={false}>
          <View style={styles.colDesc}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.description ? <Text style={styles.itemDescription}>{item.description}</Text> : null}
          </View>
          <Text style={styles.colQty}>{item.quantity}</Text>
          {showUnit ? <Text style={styles.colUnit}>{labels.units[item.unit]}</Text> : null}
          <Text style={styles.colPrice}>{formatMoney(item.unitPriceCents, invoice.currency, locale)}</Text>
          <Text style={styles.colTotal}>{formatMoney(itemTotal(item), invoice.currency, locale)}</Text>
        </View>
      ))}
    </View>
  );
}
