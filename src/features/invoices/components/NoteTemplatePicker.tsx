import { useEffect, useRef, useState } from "react";
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

const NOTE_LANGUAGES = ["en", "de"] as const;

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
  const { control, setValue, getValues } = useFormContext<InvoiceFormValues>();
  const [picked, setPicked] = useState("");

  const pdfLanguage = useWatch({ control, name: "pdfLanguage" }) || "en";
  const tPdf = i18n.getFixedT(pdfLanguage, "invoice");
  const previousLanguageRef = useRef(pdfLanguage);

  // If the Notes field currently holds one of OUR OWN templates verbatim
  // (inserted via this picker, in either language — not something the
  // person typed themselves), switching the invoice's PDF language
  // re-translates it in place instead of leaving it in the old language.
  // A match requires the text to be byte-identical to a known template in
  // SOME language, so free-typed text (including text a person edited
  // after inserting a template) is never touched — only an unmodified
  // template swap is safe to do automatically.
  useEffect(() => {
    if (previousLanguageRef.current === pdfLanguage) return;
    previousLanguageRef.current = pdfLanguage;

    const currentNote = getValues("note");
    if (!currentNote) return;

    for (const templateId of TEMPLATE_IDS) {
      for (const lang of NOTE_LANGUAGES) {
        const textInThatLanguage = i18n.getFixedT(lang, "invoice")(`form.noteTemplates.${templateId}`);
        if (currentNote === textInThatLanguage) {
          setValue("note", tPdf(`form.noteTemplates.${templateId}`), { shouldDirty: true });
          return;
        }
      }
    }
  }, [pdfLanguage, getValues, setValue, i18n, tPdf]);

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
