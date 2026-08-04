import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/types";
import type { InvoicePdfLabels } from "../types";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";

interface Props {
  invoice: Invoice;
  labels: InvoicePdfLabels;
}

const styles = StyleSheet.create({
  footer: { position: "absolute", bottom: 24, left: 32, right: 32, fontSize: 8, color: "#888" },
  notes: { fontSize: 9, marginTop: 14, color: "#333" },
  payment: { fontSize: 9, marginTop: 10, color: "#333" },
  reverseCharge: { fontSize: 8, marginTop: 8, color: "#555", fontStyle: "italic" },
  pageNumber: { position: "absolute", bottom: 24, right: 32, fontSize: 8, color: "#888" }
});

/**
 * Payment details, notes, the optional Reverse Charge note, and the
 * page-number stamp. Page numbers use react-pdf's render-prop so they stay
 * correct regardless of how many pages the item table produces.
 */
export function InvoiceFooter({ invoice, labels }: Props) {
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);

  return (
    <>
      <View>
        {visibility.showBankDetails && invoice.paymentDetails.bankDetails ? (
          <View style={styles.payment}>
            <Text>{labels.paymentDetails}</Text>
            {invoice.paymentDetails.bankDetails.iban ? <Text>IBAN: {invoice.paymentDetails.bankDetails.iban}</Text> : null}
            {invoice.paymentDetails.bankDetails.bic ? <Text>BIC: {invoice.paymentDetails.bankDetails.bic}</Text> : null}
          </View>
        ) : null}
        {visibility.showNotes && invoice.note ? (
          <View style={styles.notes}>
            <Text>{labels.notes}</Text>
            <Text>{invoice.note}</Text>
          </View>
        ) : null}
        {invoice.taxSettings.mode === "reverseCharge" ? (
          <Text style={styles.reverseCharge}>{invoice.taxSettings.explanationText || labels.reverseChargeNote}</Text>
        ) : null}
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`}
        fixed
      />
    </>
  );
}
