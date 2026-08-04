import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { getClientDisplayName } from "@/utils/clientDisplayName";

interface Props {
  invoice: Invoice;
  labels: InvoicePdfLabels;
}

const styles = StyleSheet.create({
  block: { marginBottom: 16, fontSize: 9 },
  label: { fontSize: 8, color: "#888", marginBottom: 3, textTransform: "uppercase" }
});

/** "Bill to" client block, shared across all templates. */
export function InvoiceParties({ invoice, labels }: Props) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{labels.billTo}</Text>
      <Text>{getClientDisplayName(invoice.client)}</Text>
      <Text>{invoice.client.addressLine1}</Text>
      <Text>
        {invoice.client.postalCode} {invoice.client.city}, {invoice.client.country}
      </Text>
      {invoice.client.vatId ? <Text>{invoice.client.vatId}</Text> : null}
    </View>
  );
}
