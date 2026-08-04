import { z } from "zod";

export const appSettingsSchema = z.object({
  id: z.literal("app-settings"),
  interfaceLanguage: z.enum(["de", "en"]),
  defaultInvoiceTemplateId: z.enum(["classic", "modern", "compact", "minimal"]),
  defaultInvoiceLanguage: z.enum(["de", "en"]),
  defaultCurrency: z.string().length(3),
  invoiceNumberFormat: z.string().min(1),
  nextInvoiceSequence: z.number().int().min(1),
  updatedAt: z.string()
});

export type AppSettingsFormValues = z.infer<typeof appSettingsSchema>;
