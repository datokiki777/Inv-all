/** IDs of built-in PDF templates. New designs extend this union + the registry — nothing else. */
export type InvoiceTemplateId = "classic" | "modern" | "compact" | "minimal";

export interface InvoiceTemplateMeta {
  id: InvoiceTemplateId;
  name: string;
  description: string;
}
