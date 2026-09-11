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
  // No fontStyle: "italic" here — @react-pdf/renderer can't synthesize
  // italics, it requires an actual registered italic font variant, and we
  // only ever registered NotoSansGeorgian's regular (upright) weight. Using
  // "italic" here without that variant registered crashed PDF generation
  // outright for every Reverse Charge invoice (this was a real, reproduced
  // bug — italic is now done with a border+background treatment instead).
  reverseCharge: {
    fontSize: 8,
    marginTop: 8,
    color: "#555",
    padding: 6,
    backgroundColor: "#f7f7f7",
    borderLeftWidth: 2,
    borderColor: "#ccc"
  },
  pageNumber: { position: "absolute", bottom: 24, right: 32, fontSize: 8, color: "#888" }
});

/** Text for the non-standard-VAT note box: the invoice's own explanation if typed, else a sensible default for Reverse Charge / Tax-free. "custom" has no default — with nothing typed, there's nothing meaningful to show automatically. */
function taxModeNoteText(invoice: Invoice, labels: InvoicePdfLabels): string {
  if (invoice.taxSettings.explanationText) return invoice.taxSettings.explanationText;
  if (invoice.taxSettings.mode === "reverseCharge") return labels.reverseChargeNote;
  if (invoice.taxSettings.mode === "taxFree") return labels.taxFreeNote;
  return "";
}

/**
 * Payment details, notes, the optional Reverse Charge note, and the
 * page-number stamp. Page numbers use react-pdf's render-prop so they stay
 * correct regardless of how many pages the item table produces.
 */
export function InvoiceFooter({ invoice, labels }: Props) {
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  const hasPaymentTerms = !!invoice.paymentDetails.paymentTermsText;
  const hasBankBlock = visibility.showBankDetails && invoice.paymentDetails.bankDetails;
  const taxModeNote = invoice.taxSettings.mode !== "standard" ? taxModeNoteText(invoice, labels) : "";

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
        {taxModeNote ? <Text style={styles.reverseCharge}>{taxModeNote}</Text> : null}
      </View>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`}
        fixed
      />
    </>
  );
}
