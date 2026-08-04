import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { formatMoney } from "@/utils/money";

interface Props {
  invoice: Invoice;
  labels: InvoicePdfLabels;
  accentColor: string;
  locale: string;
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "flex-end", marginTop: 10 },
  line: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 2, fontSize: 9 },
  totalLine: { flexDirection: "row", width: 220, justifyContent: "space-between", marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderColor: "#ccc" }
});

/** Right-aligned totals block: subtotal → discount → VAT → total → paid → remaining. */
export function InvoiceTotals({ invoice, labels, accentColor, locale }: Props) {
  const fmt = (cents: number) => formatMoney(cents, invoice.currency, locale);

  // Spells out what kind of discount this is — a flat "Discount" line
  // with just a number doesn't say whether it's e.g. 10% or a flat €50
  // off, which matters for anyone checking the math.
  const discountExplanation = invoice.discount
    ? invoice.discount.type === "percent"
      ? `${labels.discount} (${invoice.discount.value}%)`
      : `${labels.discount} (${labels.discountFixedLabel})`
    : labels.discount;

  return (
    <View style={styles.wrapper}>
      <View style={styles.line}>
        <Text>{labels.subtotal}</Text>
        <Text>{fmt(invoice.subtotalCents)}</Text>
      </View>
      {invoice.discountCents > 0 ? (
        <View style={styles.line}>
          <Text>{discountExplanation}</Text>
          <Text>-{fmt(invoice.discountCents)}</Text>
        </View>
      ) : null}
      {invoice.taxSettings.mode !== "reverseCharge" && invoice.taxSettings.mode !== "taxFree" ? (
        <View style={styles.line}>
          <Text>{labels.vatTotal}</Text>
          <Text>{fmt(invoice.vatCents)}</Text>
        </View>
      ) : null}
      <View style={styles.totalLine}>
        <Text style={{ fontSize: 11, color: accentColor }}>{labels.total}</Text>
        <Text style={{ fontSize: 11, color: accentColor }}>{fmt(invoice.totalCents)}</Text>
      </View>
      {invoice.paidAmountCents > 0 ? (
        <>
          <View style={styles.line}>
            <Text>{labels.paid}</Text>
            <Text>{fmt(invoice.paidAmountCents)}</Text>
          </View>
          <View style={styles.line}>
            <Text>{labels.remaining}</Text>
            <Text>{fmt(invoice.remainingAmountCents)}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}
