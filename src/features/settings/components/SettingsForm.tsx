import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { settingsFormSchema, type AppSettingsFormValues } from "@/schemas";
import type { AppSettings } from "@/types";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const TEMPLATES = ["classic", "modern", "compact", "minimal", "new"] as const;

interface SettingsFormProps {
  settings: AppSettings;
  onSubmit: (values: AppSettingsFormValues) => Promise<void>;
}

export function SettingsForm({ settings, onSubmit }: SettingsFormProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting }
  } = useForm<AppSettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      interfaceLanguage: settings.interfaceLanguage,
      defaultInvoiceTemplateId: settings.defaultInvoiceTemplateId,
      defaultInvoiceLanguage: settings.defaultInvoiceLanguage
    }
  });

  const interfaceLanguage = watch("interfaceLanguage");
  const defaultInvoiceLanguage = watch("defaultInvoiceLanguage");
  const defaultInvoiceTemplateId = watch("defaultInvoiceTemplateId");

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <FormField label={t("settings.interfaceLanguage")} htmlFor="interfaceLanguage">
        <SegmentedControl
          value={interfaceLanguage}
          onChange={(v) => setValue("interfaceLanguage", v, { shouldDirty: true })}
          options={[
            { value: "de", label: t("languages.de") },
            { value: "en", label: t("languages.en") }
          ]}
        />
      </FormField>

      <FormField label={t("settings.defaultInvoiceTemplateId")} htmlFor="defaultInvoiceTemplateId">
        <Select
          id="defaultInvoiceTemplateId"
          value={defaultInvoiceTemplateId}
          onChange={(v) => setValue("defaultInvoiceTemplateId", v as AppSettingsFormValues["defaultInvoiceTemplateId"], { shouldDirty: true })}
          options={TEMPLATES.map((template) => ({ value: template, label: t(`invoice:form.templates.${template}`) }))}
        />
      </FormField>

      <FormField label={t("settings.defaultInvoiceLanguage")} htmlFor="defaultInvoiceLanguage">
        <SegmentedControl
          value={defaultInvoiceLanguage}
          onChange={(v) => setValue("defaultInvoiceLanguage", v, { shouldDirty: true })}
          options={[
            { value: "de", label: t("languages.de") },
            { value: "en", label: t("languages.en") }
          ]}
        />
      </FormField>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("actions.saving") : t("actions.save")}
      </Button>
    </form>
  );
}
