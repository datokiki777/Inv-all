/**
 * Curated currency list for the company/invoice currency picker — not
 * the full ISO 4217 list (which would make the dropdown unwieldy), just
 * the ones actually relevant to this app's users. Add more here if
 * needed; nothing else needs to change since every consumer maps over
 * this list.
 */
export const CURRENCIES = [
  { code: "EUR", name: "Euro" },
  { code: "USD", name: "US Dollar" },
  { code: "GBP", name: "British Pound" },
  { code: "GEL", name: "Georgian Lari" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "UAH", name: "Ukrainian Hryvnia" }
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
