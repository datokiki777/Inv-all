import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import type { InvoiceFormValues } from "@/schemas";

const TEMPLATE_IDS = [
  "thankYou",
  "thankYouFollowUp",
  "paymentDue15Days",
  "paymentReference",
  "lateReminder",
  "partialPayment"
] as const;

/**
 * Quick-insert dropdown for common Notes wording (thank-you, payment
 * terms, payment reference, late-payment reminder, partial-payment note)
 * — picking one replaces the Notes text so it doesn't need retyping every
 * time. Rendered as a borderless footer strip inside the same box as the
 * Notes textarea (see InvoiceForm) so the two read as one merged field
 * rather than a textarea with an unrelated dropdown floating below it.
 * The picker always shows its placeholder again after a pick (it's a
 * one-shot insert, not a persistent selection) — whatever text the note
 * ends up with, template or hand-typed, becomes the default for the next
 * new invoice once this one is saved (see invoiceService.rememberFormDefaults).
 *
 * The template WORDING follows this invoice's own "PDF language" field
 * (not the app's UI language) — via i18n.getFixedT, which reads the
 * already-loaded en/de resource bundles for a specific language regardless
 * of what's currently active for the rest of the UI. Both "de" content on
 * an English-UI session and "en" content on a German-UI session work
 * correctly, since the two are intentionally decoupled (see i18n/index.ts).
 * Only the picker's own chrome (the "Insert a template…" label) stays in
 * the UI language, matching the rest of the form around it.
 */
export function NoteTemplatePicker() {
  const { t, i18n } = useTranslation(["common", "invoice"]);
  const { control, setValue } = useFormContext<InvoiceFormValues>();
  const [picked, setPicked] = useState("");

  const pdfLanguage = useWatch({ control, name: "pdfLanguage" }) || "en";
  const tPdf = i18n.getFixedT(pdfLanguage, "invoice");

  return (
    <Select
      aria-label={t("invoice:form.insertTemplate")}
      placeholder={t("invoice:form.insertTemplate")}
      value={picked}
      onChange={(templateId) => {
        setValue("note", tPdf(`form.noteTemplates.${templateId}`), { shouldDirty: true });
        setPicked("");
      }}
      options={TEMPLATE_IDS.map((id) => ({ value: id, label: tPdf(`form.noteTemplates.${id}`) }))}
      triggerClassName="h-9 rounded-none border-0 border-t border-line bg-transparent px-3 text-ink-muted text-xs focus:ring-0"
    />
  );
}
