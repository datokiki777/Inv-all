/**
 * Deliberately country-agnostic: a VAT rate is just a percentage plus an
 * optional label, and "no tax" is represented explicitly rather than by
 * absence, so a Reverse Charge or tax-free invoice is never ambiguous.
 */
export type TaxMode = "standard" | "reverseCharge" | "taxFree" | "custom";

export interface TaxSettings {
  mode: TaxMode;
  /** Percentage as e.g. 19 for 19%. Ignored when mode is reverseCharge/taxFree. */
  ratePercent?: number;
  /** Free-text explanation shown on the PDF, e.g. a §-reference or reverse-charge note. */
  explanationText?: string;
}
