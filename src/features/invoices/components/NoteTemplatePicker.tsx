import { useState } from "react";
import { useFormContext } from "react-hook-form";
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
 */
export function NoteTemplatePicker() {
  const { t } = useTranslation(["common", "invoice"]);
  const { setValue } = useFormContext<InvoiceFormValues>();
  const [picked, setPicked] = useState("");

  return (
    <Select
      aria-label={t("invoice:form.insertTemplate")}
      placeholder={t("invoice:form.insertTemplate")}
      value={picked}
      onChange={(templateId) => {
        setValue("note", t(`invoice:form.noteTemplates.${templateId}`), { shouldDirty: true });
        setPicked("");
      }}
      options={TEMPLATE_IDS.map((id) => ({ value: id, label: t(`invoice:form.noteTemplates.${id}`) }))}
      triggerClassName="h-9 rounded-none border-0 border-t border-line bg-transparent px-3 text-ink-muted text-xs focus:ring-0"
    />
  );
}
