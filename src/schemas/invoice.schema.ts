import { z } from "zod";
import { companySchema } from "./company.schema";
import { clientSnapshotBaseSchema } from "./client.schema";
import { unitSchema } from "./product.schema";

const clientSnapshotSchema = clientSnapshotBaseSchema;

const discountSchema = z.object({
  type: z.enum(["percent", "fixed"]),
  value: z.number().min(0)
});

const taxSettingsSchema = z.object({
  mode: z.enum(["standard", "reverseCharge", "taxFree", "custom"]),
  ratePercent: z.number().min(0).max(100).optional(),
  explanationText: z.string().optional()
});

const paymentDetailsSchema = z.object({
  method: z.enum(["bankTransfer", "cash", "paypal", "other"]),
  bankDetails: z
    .object({
      bankName: z.string().optional(),
      accountHolder: z.string().optional(),
      iban: z.string().optional(),
      bic: z.string().optional(),
      otherReference: z.string().optional()
    })
    .optional(),
  paymentTermsText: z.string().optional()
});

export const pdfVisibilitySchema = z.object({
  showServiceDate: z.boolean(),
  showDueDate: z.boolean(),
  showCompanyEmail: z.boolean(),
  showCompanyPhone: z.boolean(),
  showCompanyWebsite: z.boolean(),
  showCompanyLogo: z.boolean(),
  showCompanyVatId: z.boolean(),
  showCompanyTaxNumber: z.boolean(),
  showClientEmail: z.boolean(),
  showClientPhone: z.boolean(),
  showClientVatId: z.boolean(),
  showClientTaxNumber: z.boolean(),
  showNotes: z.boolean(),
  showBankDetails: z.boolean(),
  showItemUnitColumn: z.boolean(),
  showVatSummaryTable: z.boolean()
});

export const invoiceItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid().optional(),
  name: z.string().min(1, "itemNameRequired"),
  description: z.string().optional(),
  quantity: z.number().positive("quantityMustBePositive"),
  unit: unitSchema,
  unitPriceCents: z.number().int().min(0),
  discount: discountSchema.optional(),
  vatPercent: z.number().min(0).max(100)
});

export const invoiceSchema = z.object({
  id: z.string().uuid(),
  invoiceNumber: z.string().min(1, "invoiceNumberRequired"),
  createdDate: z.string(),
  serviceDate: z.string(),
  dueDate: z.string(),
  company: companySchema,
  client: clientSnapshotSchema,
  items: z.array(invoiceItemSchema).min(1, "atLeastOneItemRequired"),
  taxSettings: taxSettingsSchema,
  discount: discountSchema.optional(),
  currency: z.string().length(3, "invalidCurrencyCode"),
  subtotalCents: z.number().int(),
  discountCents: z.number().int(),
  taxableAmountCents: z.number().int(),
  vatCents: z.number().int(),
  totalCents: z.number().int(),
  paidAmountCents: z.number().int().min(0),
  remainingAmountCents: z.number().int(),
  note: z.string().optional(),
  paymentDetails: paymentDetailsSchema,
  status: z.enum(["draft", "sent", "paid", "partiallyPaid", "overdue", "cancelled"]),
  templateId: z.enum(["classic", "modern", "compact", "minimal"]),
  pdfLanguage: z.enum(["de", "en"]),
  pdfVisibility: pdfVisibilitySchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

/**
 * ---- Form-input schemas (Stage 4) ----
 *
 * The persisted `invoiceSchema` above needs a fully-resolved Company
 * snapshot, ready-computed totals, etc. — none of that is what the user
 * types. The form only collects raw inputs; invoiceService is the single
 * place that resolves the client snapshot, converts decimal amounts to
 * cents, applies the tax mode, and runs computeInvoiceTotals().
 */

const discountTypeFormSchema = z.enum(["none", "percent", "fixed"]);

export const invoiceItemFormSchema = z.object({
  /** Client-generated row key; also becomes the persisted InvoiceItem.id. */
  rowId: z.string().uuid(),
  productId: z.string().uuid().optional(),
  name: z.string().min(1, "itemNameRequired"),
  description: z.string().optional(),
  quantity: z.coerce.number({ invalid_type_error: "quantityInvalid" }).positive("quantityMustBePositive"),
  unit: unitSchema,
  /** Decimal major-currency amount, e.g. 45.5 — converted to cents in invoiceService. */
  unitPrice: z.coerce.number({ invalid_type_error: "priceInvalid" }).min(0, "priceInvalid"),
  discountType: discountTypeFormSchema,
  discountValue: z.coerce.number().min(0).optional(),
  vatPercent: z.coerce.number().min(0, "vatPercentInvalid").max(100, "vatPercentInvalid")
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "invoiceNumberRequired"),
  createdDate: z.string().min(1, "dateRequired"),
  serviceDate: z.string().optional(),
  dueDate: z.string().optional(),
  clientId: z.string().min(1, "clientRequired"),
  items: z.array(invoiceItemFormSchema).min(1, "atLeastOneItemRequired"),
  taxMode: z.enum(["standard", "reverseCharge", "taxFree", "custom"]),
  /** Convenience "overall rate" used to prefill new item rows; each item still keeps its own vatPercent. */
  taxRatePercent: z.coerce.number().min(0).max(100).optional(),
  taxExplanationText: z.string().optional(),
  discountType: discountTypeFormSchema,
  discountValue: z.coerce.number().min(0).optional(),
  currency: z.string().length(3, "invalidCurrencyCode"),
  paidAmount: z.coerce.number().min(0).default(0),
  note: z.string().optional(),
  paymentMethod: z.enum(["bankTransfer", "cash", "paypal", "other"]),
  paymentTermsText: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "partiallyPaid", "overdue", "cancelled"]),
  templateId: z.enum(["classic", "modern", "compact", "minimal"]),
  pdfLanguage: z.enum(["de", "en"]),
  pdfVisibility: pdfVisibilitySchema
});

export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
