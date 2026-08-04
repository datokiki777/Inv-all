import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";

interface Props {
  invoice: Invoice;
  labels: InvoicePdfLabels;
  accentColor: string;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  logo: { width: 90, height: 90, objectFit: "contain" },
  companyBlock: { fontSize: 9, color: "#333" },
  metaBlock: { alignItems: "flex-end" },
  metaLine: { fontSize: 9, flexDirection: "row", gap: 4, marginBottom: 2 }
});

/** Logo + company block on the left, invoice number/dates on the right. Reused by every template. */
export function InvoiceHeader({ invoice, labels, accentColor }: Props) {
  return (
    <View style={styles.row}>
      <View>
        {invoice.company.logoDataUrl ? <Image src={invoice.company.logoDataUrl} style={styles.logo} /> : null}
        <View style={styles.companyBlock}>
          <Text>{invoice.company.name}</Text>
          <Text>{invoice.company.addressLine1}</Text>
          <Text>
            {invoice.company.postalCode} {invoice.company.city}, {invoice.company.country}
          </Text>
        </View>
      </View>
      <View style={styles.metaBlock}>
        <Text style={{ fontSize: 14, color: accentColor, marginBottom: 6 }}>
          {labels.invoiceNumber}: {invoice.invoiceNumber}
        </Text>
        <Text style={styles.metaLine}>
          {labels.createdDate}: {invoice.createdDate}
        </Text>
        <Text style={styles.metaLine}>
          {labels.serviceDate}: {invoice.serviceDate}
        </Text>
        <Text style={styles.metaLine}>
          {labels.dueDate}: {invoice.dueDate}
        </Text>
      </View>
    </View>
  );
}
