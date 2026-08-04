import { z } from "zod";
import { companySchema } from "./company.schema";
import { clientSchema } from "./client.schema";
import { productSchema } from "./product.schema";
import { invoiceSchema } from "./invoice.schema";
import { appSettingsSchema } from "./settings.schema";

export const CURRENT_BACKUP_VERSION = 1;

/**
 * Every array reuses the exact same entity schema the repositories already
 * validate against — a backup file can never describe data the app itself
 * wouldn't consider valid.
 */
export const backupSchema = z.object({
  version: z.number().int().positive(),
  exportedAt: z.string(),
  data: z.object({
    companies: z.array(companySchema),
    clients: z.array(clientSchema),
    products: z.array(productSchema),
    invoices: z.array(invoiceSchema),
    settings: appSettingsSchema
  })
});

export type Backup = z.infer<typeof backupSchema>;
