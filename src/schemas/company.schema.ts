import { z } from "zod";

export const bankDetailsSchema = z.object({
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
  otherReference: z.string().optional()
});

export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "companyNameRequired"),
  addressLine1: z.string().min(1, "addressRequired"),
  addressLine2: z.string().optional(),
  postalCode: z.string().min(1, "postalCodeRequired"),
  city: z.string().min(1, "cityRequired"),
  country: z.string().min(1, "countryRequired"),
  email: z.string().email("invalidEmail").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().optional(),
  vatId: z.string().optional(),
  taxNumber: z.string().optional(),
  logoDataUrl: z.string().optional(),
  bankDetails: bankDetailsSchema.optional(),
  defaultInvoiceLanguage: z.enum(["de", "en"]),
  createdAt: z.string(),
  updatedAt: z.string()
});

/**
 * Input schema used by the Company form. Excludes id/createdAt/updatedAt,
 * which are assigned by companyService, never typed by the user.
 */
export const companyFormSchema = companySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
