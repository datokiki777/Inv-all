import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import deCommon from "./locales/de/common.json";
import enInvoice from "./locales/en/invoice.json";
import deInvoice from "./locales/de/invoice.json";

/**
 * Interface strings only. PDF text is a fully separate translation set
 * (pdf/ templates read their own dictionaries) so the app's UI language
 * and a given invoice's PDF language can differ without any coupling.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, invoice: enInvoice },
      de: { common: deCommon, invoice: deInvoice }
    },
    fallbackLng: "en",
    supportedLngs: ["en", "de"],
    defaultNS: "common",
    ns: ["common", "invoice"],
    interpolation: { escapeValue: false }
  });

export default i18n;
