import type { InvoiceLanguage } from "@/types";
import type { InvoicePdfLabels } from "./types";

/**
 * PDF text lives in its own dictionary, separate from the UI's i18next
 * setup, because a PDF's language is chosen per-invoice and must never
 * shift just because the app's interface language changes later.
 */
const dictionaries: Record<InvoiceLanguage, InvoicePdfLabels> = {
  en: {
    invoiceNumber: "Invoice No.",
    createdDate: "Date",
    serviceDate: "Service date",
    dueDate: "Due date",
    billTo: "Bill to",
    description: "Description",
    quantity: "Qty",
    unit: "Unit",
    unitPrice: "Unit price",
    vat: "VAT",
    lineTotal: "Total",
    subtotal: "Subtotal",
    discount: "Discount",
    discountFixedLabel: "fixed amount",
    vatTotal: "VAT",
    total: "Total",
    paid: "Paid",
    remaining: "Remaining",
    paymentDetails: "Payment details",
    paymentMethod: "Payment method",
    paymentMethods: {
      bankTransfer: "Bank transfer",
      cash: "Cash",
      paypal: "PayPal",
      other: "Other"
    },
    paymentTerms: "Payment terms",
    bankName: "Bank name",
    accountHolder: "Account holder",
    notes: "Notes",
    page: "Page",
    of: "of",
    reverseChargeNote: "Reverse charge: VAT liability is transferred to the recipient.",
    email: "Email",
    phone: "Phone",
    vatId: "VAT ID",
    taxNumber: "Tax number",
    vatSummaryTitle: "VAT summary",
    vatSummaryRate: "VAT rate",
    vatSummaryNet: "Net",
    vatSummaryVat: "VAT",
    vatSummaryTotal: "Total",
    units: {
      hour: "hour",
      day: "day",
      piece: "piece",
      kg: "kg",
      unit: "unit",
      flatRate: "flat rate"
    }
  },
  de: {
    invoiceNumber: "Rechnungsnr.",
    createdDate: "Datum",
    serviceDate: "Leistungsdatum",
    dueDate: "Fälligkeitsdatum",
    billTo: "Rechnungsempfänger",
    description: "Beschreibung",
    quantity: "Menge",
    unit: "Einheit",
    unitPrice: "Einzelpreis",
    vat: "MwSt.",
    lineTotal: "Gesamt",
    subtotal: "Zwischensumme",
    discount: "Rabatt",
    discountFixedLabel: "Festbetrag",
    vatTotal: "MwSt.",
    total: "Gesamtbetrag",
    paid: "Bezahlt",
    remaining: "Offener Betrag",
    paymentDetails: "Zahlungsdetails",
    paymentMethod: "Zahlungsart",
    paymentMethods: {
      bankTransfer: "Überweisung",
      cash: "Bar",
      paypal: "PayPal",
      other: "Sonstige"
    },
    paymentTerms: "Zahlungsbedingungen",
    bankName: "Bank",
    accountHolder: "Kontoinhaber",
    notes: "Anmerkungen",
    page: "Seite",
    of: "von",
    reverseChargeNote: "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge).",
    email: "E-Mail",
    phone: "Telefon",
    vatId: "USt-IdNr.",
    taxNumber: "Steuernummer",
    vatSummaryTitle: "MwSt.-Übersicht",
    vatSummaryRate: "MwSt.-Satz",
    vatSummaryNet: "Netto",
    vatSummaryVat: "MwSt.",
    vatSummaryTotal: "Gesamt",
    units: {
      hour: "Stunde",
      day: "Tag",
      piece: "Stück",
      kg: "Kilogramm",
      unit: "Einheit",
      flatRate: "Pauschale"
    }
  }
};

export function getPdfLabels(language: InvoiceLanguage): InvoicePdfLabels {
  return dictionaries[language];
}
