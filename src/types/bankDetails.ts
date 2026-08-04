export interface BankDetails {
  bankName?: string;
  accountHolder?: string;
  iban?: string;
  bic?: string;
  /** Free-form fallback for banking systems that don't use IBAN/BIC. */
  otherReference?: string;
}
