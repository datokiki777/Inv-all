import type { InvoicePdfVisibility } from "@/types";

/** Everything visible by default — matches how the app behaved before these toggles existed. */
export const defaultPdfVisibility: InvoicePdfVisibility = {
  showCompanyEmail: true,
  showCompanyPhone: true,
  showCompanyVatId: true,
  showCompanyTaxNumber: true,
  showClientEmail: true,
  showClientPhone: true,
  showClientVatId: true,
  showClientTaxNumber: true,
  showNotes: true,
  showBankDetails: true,
  showItemUnitColumn: true,
  showVatSummaryTable: true
};

/** Fills in `true` for any flag missing on an older saved invoice. */
export function resolvePdfVisibility(visibility: Partial<InvoicePdfVisibility> | undefined): InvoicePdfVisibility {
  return { ...defaultPdfVisibility, ...visibility };
}
