import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import deCommon from "./locales/de/common.json";
import kaCommon from "./locales/ka/common.json";
import enInvoice from "./locales/en/invoice.json";
import deInvoice from "./locales/de/invoice.json";
import kaInvoice from "./locales/ka/invoice.json";

/**
 * Interface strings only. PDF text is a fully separate translation set
 * (pdf/ templates read their own dictionaries) so the app's UI language
 * and a given invoice's PDF language can differ without any coupling —
 * e.g. "ka" (Georgian) is supported here for the app's own UI, but is
 * deliberately NOT one of invoice.pdfLanguage's options (still "de" | "en"
 * only), since a PDF is a business document with its own convention.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, invoice: enInvoice },
      de: { common: deCommon, invoice: deInvoice },
      ka: { common: kaCommon, invoice: kaInvoice }
    },
    fallbackLng: "en",
    supportedLngs: ["en", "de", "ka"],
    defaultNS: "common",
    ns: ["common", "invoice"],
    interpolation: { escapeValue: false }
  });

export default i18n;
