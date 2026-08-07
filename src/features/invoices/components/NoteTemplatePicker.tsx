import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import type { InvoiceFormValues } from "@/schemas";

const TEMPLATE_IDS = ["thankYou", "thankYouFollowUp", "paymentReference", "lateReminder", "partialPayment"] as const;

/**
 * Quick-insert dropdown for common Notes wording (thank-you, payment
 * reference, late-payment reminder, partial-payment note) — picking one
 * replaces the Notes text so it doesn't need retyping every time. The
 * picker itself always shows its placeholder again after a pick (it's a
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
    />
  );
}
