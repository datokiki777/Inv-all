import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { settingsFormSchema, type AppSettingsFormValues } from "@/schemas";
import type { AppSettings } from "@/types";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface SettingsFormProps {
  settings: AppSettings;
  onSubmit: (values: AppSettingsFormValues) => Promise<void>;
}

/**
 * Just the app-wide UI language now — default PDF design/language and
 * default currency moved to each Company (they're really that company's
 * identity/branding, not a single app-wide setting), with per-company
 * invoice numbering already living there too.
 */
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
      interfaceLanguage: settings.interfaceLanguage
    }
  });

  const interfaceLanguage = watch("interfaceLanguage");

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

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t("actions.saving") : t("actions.save")}
      </Button>
    </form>
  );
}
