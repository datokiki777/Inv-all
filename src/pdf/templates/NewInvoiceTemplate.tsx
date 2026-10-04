import { Document, Page, View, Text, Image, Svg, Defs, LinearGradient, Stop, Rect, StyleSheet } from "@react-pdf/renderer";
import type { InvoicePdfTemplateProps } from "../types";
import { InvoiceItemsTable } from "../components/InvoiceItemsTable";
import { taxModeLabel } from "../taxModeLabel";
import { formatMoney } from "@/utils/money";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import { resolvePdfVisibility } from "@/utils/invoicePdfVisibility";
import { PDF_FONT_FAMILY } from "../fonts";

const NAVY = "#1E3A6E";
const NAVY_LIGHT = "#5D7FB0"; // right-hand end of the banner's gradient — navy easing toward a lighter blue-white
const GOLD = "#F2B134";
const CARD_BG = "#F6F8FB"; // subtle blue-gray tint distinguishing cards from the page's white background

// IMPORTANT: only the regular (400, upright) weight of NotoSansGeorgian is
// ever registered (see ../fonts.ts) — @react-pdf/renderer can't synthesize
// bold or italic the way a browser does, and requesting a style that was
// never registered crashes the whole PDF render (this happened for real
// with fontStyle: "italic" once — see InvoiceFooter's git history). The
// "elegant banner" look here is built entirely from size, letterSpacing,
// and color on the one registered weight — never fontWeight, never
// fontStyle.
const styles = StyleSheet.create({
  page: { fontFamily: PDF_FONT_FAMILY, fontSize: 9.5, color: "#242424" },
  content: { paddingHorizontal: 32, paddingBottom: 32 },
  // The gradient itself is drawn by an absolutely-positioned <Svg> sibling
  // (bannerGradient below) sized to match this wrapper — react-pdf's
  // StyleSheet has no CSS linear-gradient equivalent, only solid
  // backgroundColor, so the gradient has to be an actual SVG shape layered
  // behind the text content rather than a style property.
  bannerWrapper: { position: "relative", marginBottom: 22 },
  bannerGradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  banner: {
    paddingHorizontal: 32,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  bannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  // White backing behind the logo — on a dark navy banner, a logo with a
  // transparent background (common) or dark artwork would otherwise be
  // partly or fully invisible, since we can't know the logo's own color
  // scheme in advance. A white chip guarantees it reads correctly either way.
  logoChip: { backgroundColor: "#FFFFFF", borderRadius: 4, padding: 5 },
  logo: { width: 62, height: 62, objectFit: "contain" },
  companyName: { color: "#FFFFFF", fontSize: 16, letterSpacing: 0.4, marginBottom: 7 },
  companyLine: { color: "#C7D2E6", fontSize: 8.5, marginBottom: 2 },
  invoiceTitle: { color: "#FFFFFF", fontSize: 24, letterSpacing: 3.5 },
  cardRow: { flexDirection: "row", gap: 12, marginBottom: 18 },
  card: { flex: 1, backgroundColor: CARD_BG, borderWidth: 1, borderColor: "#D9E0EC", borderRadius: 4, padding: 13 },
  cardTitle: { fontSize: 8, color: NAVY, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 9 },
  clientName: { fontSize: 12, marginBottom: 3 },
  clientLine: { fontSize: 9, color: "#555", marginBottom: 1 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderTopWidth: 1,
    borderColor: "#EEF1F6"
  },
  detailRowFirst: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 5 },
  detailLabel: { fontSize: 7.5, color: "#8A93A3", letterSpacing: 0.4, textTransform: "uppercase" },
  detailValue: { fontSize: 9.5, color: NAVY },
  totalsWrapper: { alignItems: "flex-end", marginTop: 4, marginBottom: 20 },
  totalsLine: { flexDirection: "row", width: 240, justifyContent: "space-between", marginBottom: 6, fontSize: 9.5, color: "#555" },
  totalBar: {
    flexDirection: "row",
    width: 240,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: GOLD,
    borderRadius: 4,
    paddingVertical: 11,
    paddingHorizontal: 15,
    marginTop: 6
  },
  totalBarLabel: { fontSize: 12, color: NAVY, letterSpacing: 0.5 },
  totalBarValue: { fontSize: 14, color: NAVY },
  cardText: { fontSize: 9, color: "#333", marginBottom: 2 },
  cardTextLabel: { fontSize: 9, color: "#8A93A3" },
  pageNumber: { position: "absolute", bottom: 24, right: 32, fontSize: 8, color: "#AAA" }
});

/**
 * "New" — navy banner with the company block and a large letter-spaced
 * "INVOICE" title, two bordered detail cards (Billed to / Invoice
 * details), a solid-header items table (reusing InvoiceItemsTable's
 * "zebra" variant), a right-aligned totals block topped by a gold TOTAL
 * bar, and a closing pair of cards (Bank details / Terms). Every number
 * still comes from the already-computed Invoice object — nothing here
 * recalculates anything, it only lays the same figures out differently.
 */
export function NewInvoiceTemplate({ invoice, labels }: InvoicePdfTemplateProps) {
  const locale = invoice.pdfLanguage === "de" ? "de-DE" : "en-US";
  const visibility = resolvePdfVisibility(invoice.pdfVisibility);
  const company = invoice.company;
  const client = invoice.client;
  const fmt = (cents: number) => formatMoney(cents, invoice.currency, locale);

  const hasVatRate = invoice.taxSettings.mode === "standard" || invoice.taxSettings.mode === "custom";
  const nonStandardLabel = invoice.taxSettings.mode !== "standard" ? taxModeLabel(invoice, labels) : "";

  const hasBankBlock = visibility.showBankDetails && invoice.paymentDetails.bankDetails;
  const hasPaymentTerms = !!invoice.paymentDetails.paymentTermsText;
  const hasNotes = visibility.showNotes && !!invoice.note;
  const showClosingRow = hasBankBlock || hasPaymentTerms || hasNotes;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.bannerWrapper} fixed>
          <Svg style={styles.bannerGradient} viewBox="0 0 1 1" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="bannerGradient" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={NAVY} />
                <Stop offset="1" stopColor={NAVY_LIGHT} />
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={1} height={1} fill="url(#bannerGradient)" />
          </Svg>
          <View style={styles.banner}>
            <View style={styles.bannerLeft}>
              {visibility.showCompanyLogo && company.logoDataUrl ? (
                <View style={styles.logoChip}>
                  <Image src={company.logoDataUrl} style={styles.logo} />
                </View>
              ) : null}
              <View>
                <Text style={styles.companyName}>{company.name}</Text>
                <Text style={styles.companyLine}>
                  {company.addressLine1}, {company.postalCode} {company.city}
                </Text>
                {visibility.showCompanyPhone && company.phone ? <Text style={styles.companyLine}>{company.phone}</Text> : null}
                {visibility.showCompanyEmail && company.email ? <Text style={styles.companyLine}>{company.email}</Text> : null}
                {visibility.showCompanyVatId && company.vatId ? (
                  <Text style={styles.companyLine}>
                    {labels.vatId}: {company.vatId}
                  </Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.invoiceTitle}>{labels.invoiceTitle}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.billTo}</Text>
              <Text style={styles.clientName}>{getClientDisplayName(client)}</Text>
              <Text style={styles.clientLine}>{client.addressLine1}</Text>
              <Text style={styles.clientLine}>
                {client.postalCode} {client.city}, {client.country}
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{labels.invoiceDetails}</Text>
              <View style={styles.detailRowFirst}>
                <Text style={styles.detailLabel}>{labels.invoiceNumber}</Text>
                <Text style={styles.detailValue}>{invoice.invoiceNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{labels.createdDate}</Text>
                <Text style={styles.detailValue}>{invoice.createdDate}</Text>
              </View>
              {visibility.showServiceDate && invoice.serviceDate ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{labels.serviceDate}</Text>
                  <Text style={styles.detailValue}>{invoice.serviceDate}</Text>
                </View>
              ) : null}
              {visibility.showDueDate && invoice.dueDate ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{labels.dueDate}</Text>
                  <Text style={styles.detailValue}>{invoice.dueDate}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <InvoiceItemsTable invoice={invoice} labels={labels} accentColor={NAVY} locale={locale} variant="zebra" />

          <View style={styles.totalsWrapper}>
            <View style={styles.totalsLine}>
              <Text>{labels.subtotal}</Text>
              <Text>{fmt(invoice.subtotalCents)}</Text>
            </View>
            {invoice.discountCents > 0 ? (
              <View style={styles.totalsLine}>
                <Text>
                  {labels.discount}
                  {invoice.discount?.type === "percent" ? ` (${invoice.discount.value}%)` : ""}
                </Text>
                <Text>-{fmt(invoice.discountCents)}</Text>
              </View>
            ) : null}
            {hasVatRate ? (
              <View style={styles.totalsLine}>
                <Text>
                  {labels.vatTotal} ({invoice.taxSettings.ratePercent ?? 0}%)
                </Text>
                <Text>{fmt(invoice.vatCents)}</Text>
              </View>
            ) : nonStandardLabel ? (
              <View style={styles.totalsLine}>
                <Text>{nonStandardLabel}</Text>
                <Text>{fmt(0)}</Text>
              </View>
            ) : null}
            <View style={styles.totalBar}>
              <Text style={styles.totalBarLabel}>{labels.total}</Text>
              <Text style={styles.totalBarValue}>{fmt(invoice.totalCents)}</Text>
            </View>
            {invoice.paidAmountCents > 0 ? (
              <>
                <View style={[styles.totalsLine, { marginTop: 6 }]}>
                  <Text>{labels.paid}</Text>
                  <Text>{fmt(invoice.paidAmountCents)}</Text>
                </View>
                <View style={styles.totalsLine}>
                  <Text>{labels.remaining}</Text>
                  <Text>{fmt(invoice.remainingAmountCents)}</Text>
                </View>
              </>
            ) : null}
          </View>

          {showClosingRow ? (
            <View style={styles.cardRow}>
              {hasBankBlock ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{labels.bankDetails}</Text>
                  {invoice.paymentDetails.bankDetails!.accountHolder ? (
                    <Text style={styles.cardText}>
                      <Text style={styles.cardTextLabel}>{labels.accountHolder}: </Text>
                      {invoice.paymentDetails.bankDetails!.accountHolder}
                    </Text>
                  ) : null}
                  {invoice.paymentDetails.bankDetails!.bankName ? (
                    <Text style={styles.cardText}>
                      <Text style={styles.cardTextLabel}>{labels.bankName}: </Text>
                      {invoice.paymentDetails.bankDetails!.bankName}
                    </Text>
                  ) : null}
                  {invoice.paymentDetails.bankDetails!.iban ? (
                    <Text style={styles.cardText}>
                      <Text style={styles.cardTextLabel}>IBAN: </Text>
                      {invoice.paymentDetails.bankDetails!.iban}
                    </Text>
                  ) : null}
                  {invoice.paymentDetails.bankDetails!.bic ? (
                    <Text style={styles.cardText}>
                      <Text style={styles.cardTextLabel}>BIC: </Text>
                      {invoice.paymentDetails.bankDetails!.bic}
                    </Text>
                  ) : null}
                </View>
              ) : null}
              {hasPaymentTerms || hasNotes ? (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{labels.terms}</Text>
                  {hasPaymentTerms ? <Text style={styles.cardText}>{invoice.paymentDetails.paymentTermsText}</Text> : null}
                  {hasNotes ? <Text style={styles.cardText}>{invoice.note}</Text> : null}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${labels.page} ${pageNumber} ${labels.of} ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
