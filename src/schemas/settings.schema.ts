import { z } from "zod";

export const appSettingsSchema = z.object({
  id: z.literal("app-settings"),
  interfaceLanguage: z.enum(["de", "en"]),
  defaultInvoiceTemplateId: z.enum(["classic", "modern", "compact", "minimal"]),
  defaultInvoiceLanguage: z.enum(["de", "en"]),
  defaultCurrency: z.string().length(3, "invalidCurrencyCode"),
  invoiceNumberFormat: z.string().min(1, "invoiceNumberFormatRequired"),
  nextInvoiceSequence: z.coerce.number().int().min(1, "sequenceMustBePositive"),
  updatedAt: z.string()
});

/** Input schema for the Settings form — everything except id/updatedAt, which settingsService owns. */
export const settingsFormSchema = appSettingsSchema.omit({ id: true, updatedAt: true });

export type AppSettingsFormValues = z.infer<typeof settingsFormSchema>;
