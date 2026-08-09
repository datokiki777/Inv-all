import { z } from "zod";
import { pdfVisibilitySchema } from "./invoice.schema";

export const appSettingsSchema = z.object({
  id: z.literal("app-settings"),
  interfaceLanguage: z.enum(["de", "en"]),
  defaultInvoiceTemplateId: z.enum(["classic", "modern", "compact", "minimal"]),
  defaultInvoiceLanguage: z.enum(["de", "en"]),
  defaultCurrency: z.string().length(3, "invalidCurrencyCode"),
  lastUsedCompanyId: z.string().optional(),
  lastInvoicePdfVisibility: pdfVisibilitySchema.optional(),
  lastNoteText: z.string().optional(),
  updatedAt: z.string()
});

/** Input schema for the Settings form — everything except id/updatedAt/lastUsedCompanyId/lastInvoicePdfVisibility/lastNoteText, which the app owns automatically. */
export const settingsFormSchema = appSettingsSchema.omit({
  id: true,
  updatedAt: true,
  lastUsedCompanyId: true,
  lastInvoicePdfVisibility: true,
  lastNoteText: true
});

export type AppSettingsFormValues = z.infer<typeof settingsFormSchema>;
