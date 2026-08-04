import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { settingsFormSchema, type AppSettingsFormValues } from "@/schemas";
import type { AppSettings } from "@/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const TEMPLATES = ["classic", "modern", "compact", "minimal"] as const;

interface SettingsFormProps {
  settings: AppSettings;
  onSubmit: (values: AppSettingsFormValues) => Promise<void>;
}

export function SettingsForm({ settings, onSubmit }: SettingsFormProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AppSettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      interfaceLanguage: settings.interfaceLanguage,
      defaultInvoiceTemplateId: settings.defaultInvoiceTemplateId,
      defaultInvoiceLanguage: settings.defaultInvoiceLanguage,
      defaultCurrency: settings.defaultCurrency,
      invoiceNumberFormat: settings.invoiceNumberFormat,
      nextInvoiceSequence: settings.nextInvoiceSequence
    }
  });

  const interfaceLanguage = watch("interfaceLanguage");
  const defaultInvoiceLanguage = watch("defaultInvoiceLanguage");

  function err(key: keyof AppSettingsFormValues) {
    const message = errors[key]?.message;
    return message ? t(`validation.${message}`) : undefined;
  }

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
        <Select id="defaultInvoiceTemplateId" {...register("defaultInvoiceTemplateId")}>
          {TEMPLATES.map((template) => (
            <option key={template} value={template}>
              {t(`invoice:form.templates.${template}`)}
            </option>
          ))}
        </Select>
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

      <FormField label={t("settings.defaultCurrency")} htmlFor="defaultCurrency" error={err("defaultCurrency")} hint={t("settings.defaultCurrencyHint")}>
        <Input id="defaultCurrency" maxLength={3} className="uppercase" invalid={!!errors.defaultCurrency} {...register("defaultCurrency")} />
      </FormField>

      <FormField
        label={t("settings.invoiceNumberFormat")}
        htmlFor="invoiceNumberFormat"
        error={err("invoiceNumberFormat")}
        hint={t("settings.invoiceNumberFormatHint")}
      >
        <Input id="invoiceNumberFormat" invalid={!!errors.invoiceNumberFormat} {...register("invoiceNumberFormat")} />
      </FormField>

      <FormField
        label={t("settings.nextInvoiceSequence")}
        htmlFor="nextInvoiceSequence"
        error={err("nextInvoiceSequence")}
        hint={t("settings.nextInvoiceSequenceHint")}
      >
        <Input id="nextInvoiceSequence" type="number" min="1" step="1" invalid={!!errors.nextInvoiceSequence} {...register("nextInvoiceSequence")} />
      </FormField>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("actions.saving") : t("actions.save")}
      </Button>
    </form>
  );
}
