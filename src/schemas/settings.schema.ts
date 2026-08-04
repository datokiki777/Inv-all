import { z } from "zod";
import { pdfVisibilitySchema } from "./invoice.schema";

export const appSettingsSchema = z.object({
  id: z.literal("app-settings"),
  interfaceLanguage: z.enum(["de", "en"]),
  defaultInvoiceTemplateId: z.enum(["classic", "modern", "compact", "minimal"]),
  defaultInvoiceLanguage: z.enum(["de", "en"]),
  defaultCurrency: z.string().length(3, "invalidCurrencyCode"),
  invoiceNumberFormat: z.string().min(1, "invoiceNumberFormatRequired"),
  nextInvoiceSequence: z.coerce.number().int().min(1, "sequenceMustBePositive"),
  lastInvoicePdfVisibility: pdfVisibilitySchema.optional(),
  updatedAt: z.string()
});

/** Input schema for the Settings form — everything except id/updatedAt/lastInvoicePdfVisibility, which the app owns automatically. */
export const settingsFormSchema = appSettingsSchema.omit({ id: true, updatedAt: true, lastInvoicePdfVisibility: true });

export type AppSettingsFormValues = z.infer<typeof settingsFormSchema>;
