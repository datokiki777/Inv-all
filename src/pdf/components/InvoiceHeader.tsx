import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";

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
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  const company = invoice.company;

  return (
    <View style={styles.row}>
      <View>
        {company.logoDataUrl ? <Image src={company.logoDataUrl} style={styles.logo} /> : null}
        <View style={styles.companyBlock}>
          <Text>{company.name}</Text>
          <Text>{company.addressLine1}</Text>
          <Text>
            {company.postalCode} {company.city}, {company.country}
          </Text>
          {visibility.showCompanyEmail && company.email ? (
            <Text>
              {labels.email}: {company.email}
            </Text>
          ) : null}
          {visibility.showCompanyPhone && company.phone ? (
            <Text>
              {labels.phone}: {company.phone}
            </Text>
          ) : null}
          {visibility.showCompanyVatId && company.vatId ? (
            <Text>
              {labels.vatId}: {company.vatId}
            </Text>
          ) : null}
          {visibility.showCompanyTaxNumber && company.taxNumber ? (
            <Text>
              {labels.taxNumber}: {company.taxNumber}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.metaBlock}>
        <Text style={{ fontSize: 14, color: accentColor, marginBottom: 6 }}>
          {labels.invoiceNumber}: {invoice.invoiceNumber}
        </Text>
        <Text style={styles.metaLine}>
          {labels.createdDate}: {invoice.createdDate}
        </Text>
        {visibility.showServiceDate && invoice.serviceDate ? (
          <Text style={styles.metaLine}>
            {labels.serviceDate}: {invoice.serviceDate}
          </Text>
        ) : null}
        {visibility.showDueDate && invoice.dueDate ? (
          <Text style={styles.metaLine}>
            {labels.dueDate}: {invoice.dueDate}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
