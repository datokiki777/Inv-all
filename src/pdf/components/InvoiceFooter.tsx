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
  pageNumber: { position: "absolute", bottom: 24, right: 32, fontSize: 8, color: "#888" }
});

/**
 * Payment details, notes, and the page-number stamp. The non-standard-VAT
 * explanation (Reverse Charge / Tax-free / Custom) no longer has its own
 * box here — it's folded into InvoiceVatSummaryTable's rate column
 * instead, right next to the numbers it explains, rather than duplicated
 * in a separate note further down the page. Page numbers use react-pdf's
 * render-prop so they stay correct regardless of how many pages the item
 * table produces.
 */
export function InvoiceFooter({ invoice, labels }: Props) {
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  const hasPaymentTerms = !!invoice.paymentDetails.paymentTermsText;
  const hasBankBlock = visibility.showBankDetails && invoice.paymentDetails.bankDetails;

  return (
    <>
      <View>
        {hasBankBlock || hasPaymentTerms ? (
          <View style={styles.payment}>
            <Text>{labels.paymentDetails}</Text>
            <Text>
              {labels.paymentMethod}: {labels.paymentMethods[invoice.paymentDetails.method]}
            </Text>
            {hasBankBlock ? (
              <>
                {invoice.paymentDetails.bankDetails!.bankName ? (
                  <Text>
                    {labels.bankName}: {invoice.paymentDetails.bankDetails!.bankName}
                  </Text>
                ) : null}
                {invoice.paymentDetails.bankDetails!.accountHolder ? (
                  <Text>
                    {labels.accountHolder}: {invoice.paymentDetails.bankDetails!.accountHolder}
                  </Text>
                ) : null}
                {invoice.paymentDetails.bankDetails!.iban ? <Text>IBAN: {invoice.paymentDetails.bankDetails!.iban}</Text> : null}
                {invoice.paymentDetails.bankDetails!.bic ? <Text>BIC: {invoice.paymentDetails.bankDetails!.bic}</Text> : null}
              </>
            ) : null}
            {hasPaymentTerms ? (
              <Text>
                {labels.paymentTerms}: {invoice.paymentDetails.paymentTermsText}
              </Text>
            ) : null}
          </View>
        ) : null}
        {visibility.showNotes && invoice.note ? (
          <View style={styles.notes}>
            <Text>{labels.notes}</Text>
            <Text>{invoice.note}</Text>
          </View>
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
