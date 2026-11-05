import type { InvoiceTemplateId } from "@/types";
import classic from "./classic.png";
import modern from "./modern.png";
import compact from "./compact.png";
import minimal from "./minimal.png";
import newTemplate from "./new.png";

/**
 * Static previews of each PDF design, rendered from the REAL template
 * components with a neutral sample invoice by tools/generate-template-
 * thumbnails.mjs — they are images, so they do NOT update themselves:
 * re-run that script whenever a template's look changes.
 *
 * Deliberately imports nothing from src/pdf — that would drag the whole
 * PDF renderer into the main bundle just to show a picture.
 */
export const TEMPLATE_IDS = ["classic", "modern", "compact", "minimal", "new"] as const satisfies readonly InvoiceTemplateId[];

export const TEMPLATE_THUMBNAILS: Record<InvoiceTemplateId, string> = {
  classic,
  modern,
  compact,
  minimal,
  new: newTemplate
};
