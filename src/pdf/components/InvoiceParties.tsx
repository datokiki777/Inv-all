import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";

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
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  const client = invoice.client;

  return (
    <View style={styles.block}>
      <Text style={styles.label}>{labels.billTo}</Text>
      <Text>{getClientDisplayName(client)}</Text>
      <Text>{client.addressLine1}</Text>
      <Text>
        {client.postalCode} {client.city}, {client.country}
      </Text>
      {visibility.showClientEmail && client.email ? (
        <Text>
          {labels.email}: {client.email}
        </Text>
      ) : null}
      {visibility.showClientPhone && client.phone ? (
        <Text>
          {labels.phone}: {client.phone}
        </Text>
      ) : null}
      {visibility.showClientVatId && client.vatId ? (
        <Text>
          {labels.vatId}: {client.vatId}
        </Text>
      ) : null}
      {visibility.showClientTaxNumber && client.taxNumber ? (
        <Text>
          {labels.taxNumber}: {client.taxNumber}
        </Text>
      ) : null}
    </View>
  );
}
