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
  createdAt: z.string(),
  updatedAt: z.string()
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
