import type { InvoiceTemplateId, InvoiceTemplateMeta } from "@/types";
import type { InvoicePdfTemplateComponent } from "./types";
// Registers the Georgian-capable PDF font as a side effect, before any
// template ever renders.
import "./fonts";
import { ClassicInvoiceTemplate } from "./templates/ClassicInvoiceTemplate";
import { ModernInvoiceTemplate } from "./templates/ModernInvoiceTemplate";
import { CompactInvoiceTemplate } from "./templates/CompactInvoiceTemplate";
import { MinimalInvoiceTemplate } from "./templates/MinimalInvoiceTemplate";

interface TemplateRegistryEntry {
  meta: InvoiceTemplateMeta;
  Component: InvoicePdfTemplateComponent;
}

/**
 * The one and only place that maps a template id to its renderer.
 * Adding a new design = write TemplateFive.tsx + add one entry here.
 * Nothing else in the app should ever branch on templateId directly.
 */
export const templateRegistry: Record<InvoiceTemplateId, TemplateRegistryEntry> = {
  classic: {
    meta: {
      id: "classic",
      name: "Classic",
      description: "Traditional business invoice with a formal, official layout."
    },
    Component: ClassicInvoiceTemplate
  },
  modern: {
    meta: {
      id: "modern",
      name: "Modern",
      description: "Clean contemporary layout with a prominent total and number."
    },
    Component: ModernInvoiceTemplate
  },
  compact: {
    meta: {
      id: "compact",
      name: "Compact",
      description: "Dense, information-first layout for invoices with many line items."
    },
    Component: CompactInvoiceTemplate
  },
  minimal: {
    meta: {
      id: "minimal",
      name: "Minimal",
      description: "Light, decoration-free layout for short, simple invoices."
    },
    Component: MinimalInvoiceTemplate
  }
};

export function getTemplate(id: InvoiceTemplateId): TemplateRegistryEntry {
  return templateRegistry[id];
}

export function listTemplates(): InvoiceTemplateMeta[] {
  return Object.values(templateRegistry).map((entry) => entry.meta);
}
