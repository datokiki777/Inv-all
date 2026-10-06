import type { InvoicePdfVisibility } from "./invoice";

/**
 * The app's own UI language — deliberately a separate type from
 * InvoiceLanguage (PDF text), which stays "de" | "en" only. A PDF is a
 * business document with its own convention; the app's UI is free to
 * support more languages (Georgian) without that implying anything about
 * what languages invoices themselves can be written in.
 */
export type UiLanguage = "de" | "en" | "ka";

export interface AppSettings {
  id: "app-settings";
  interfaceLanguage: UiLanguage;
  /**
   * The most recently used company — new invoices default to this one
   * instead of always falling back to "the first company", so multi-company
   * use feels like it "remembers where you left off". Not shown in the
   * Settings form; invoiceService updates it automatically on save.
   */
  lastUsedCompanyId?: string;
  /**
   * The company chip currently selected in the Dashboard/Invoices list
   * filter — "all" or a specific company id. Shared between both screens
   * (switching it on either one moves the other) and persists across app
   * restarts, so you stay on the company you were looking at instead of
   * resetting to "All" every time.
   */
  lastCompanyFilterId?: string;
  /**
   * The "Show in PDF" switch state last used on any saved invoice — new
   * invoices start from this instead of always resetting to all-visible,
   * so a preference like "hide my phone number" sticks around. Not shown
   * in the Settings form; invoiceService updates it automatically on save.
   */
  lastInvoicePdfVisibility?: InvoicePdfVisibility;
  /** Last note text used on a saved invoice — new invoices start from this so a recurring note doesn't need retyping. */
  lastNoteText?: string;
  updatedAt: string;
}
