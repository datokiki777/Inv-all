import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { companyFormSchema, type CompanyFormValues } from "@/schemas";
import type { Company } from "@/types";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LogoUploader } from "./LogoUploader";

interface CompanyFormProps {
  company?: Company;
  onSubmit: (values: CompanyFormValues) => Promise<void>;
  onCancel: () => void;
}

function toDefaultValues(company: Company | undefined): CompanyFormValues {
  return {
    name: company?.name ?? "",
    addressLine1: company?.addressLine1 ?? "",
    addressLine2: company?.addressLine2 ?? "",
    postalCode: company?.postalCode ?? "",
    city: company?.city ?? "",
    country: company?.country ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
    website: company?.website ?? "",
    vatId: company?.vatId ?? "",
    taxNumber: company?.taxNumber ?? "",
    logoDataUrl: company?.logoDataUrl,
    bankDetails: {
      bankName: company?.bankDetails?.bankName ?? "",
      accountHolder: company?.bankDetails?.accountHolder ?? "",
      iban: company?.bankDetails?.iban ?? "",
      bic: company?.bankDetails?.bic ?? ""
    },
    defaultInvoiceLanguage: company?.defaultInvoiceLanguage ?? "en",
    invoiceNumberFormat: company?.invoiceNumberFormat ?? "INV-{YYYY}-{seq:4}",
    nextInvoiceSequence: company?.nextInvoiceSequence ?? 1
  };
}

/** Add/edit form for one company — rendered inside a Dialog by CompaniesPage, same pattern as ClientForm. */
export function CompanyForm({ company, onSubmit, onCancel }: CompanyFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: toDefaultValues(company)
  });

  const logoDataUrl = watch("logoDataUrl");
  const invoiceLanguage = watch("defaultInvoiceLanguage");

  function fieldError(
    key:
      | keyof CompanyFormValues
      | "bankDetails.iban"
      | "bankDetails.bic"
      | "bankDetails.bankName"
      | "bankDetails.accountHolder"
  ) {
    const message = key.startsWith("bankDetails.")
      ? errors.bankDetails?.[key.split(".")[1] as "iban"]?.message
      : errors[key as keyof CompanyFormValues]?.message;
    return message ? t(`validation.${message}`) : undefined;
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <FormField label={t("company.logo")} htmlFor="logo">
        <LogoUploader value={logoDataUrl} onChange={(v) => setValue("logoDataUrl", v, { shouldDirty: true })} />
      </FormField>

      <FormField label={t("company.name")} htmlFor="name" required error={fieldError("name")}>
        <Input id="name" invalid={!!errors.name} {...register("name")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("company.phone")} htmlFor="phone" error={fieldError("phone")}>
          <Input id="phone" type="tel" {...register("phone")} />
        </FormField>
        <FormField label={t("company.email")} htmlFor="email" error={fieldError("email")}>
          <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
        </FormField>
      </div>

      <FormField label={t("company.addressLine1")} htmlFor="addressLine1" required error={fieldError("addressLine1")}>
        <Input id="addressLine1" invalid={!!errors.addressLine1} {...register("addressLine1")} />
      </FormField>
      <FormField label={t("company.addressLine2")} htmlFor="addressLine2">
        <Input id="addressLine2" {...register("addressLine2")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("company.postalCode")} htmlFor="postalCode" required error={fieldError("postalCode")}>
          <Input id="postalCode" invalid={!!errors.postalCode} {...register("postalCode")} />
        </FormField>
        <FormField label={t("company.city")} htmlFor="city" required error={fieldError("city")}>
          <Input id="city" invalid={!!errors.city} {...register("city")} />
        </FormField>
      </div>
      <FormField label={t("company.country")} htmlFor="country" required error={fieldError("country")}>
        <Input id="country" invalid={!!errors.country} {...register("country")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("company.vatId")} htmlFor="vatId">
          <Input id="vatId" {...register("vatId")} />
        </FormField>
        <FormField label={t("company.taxNumber")} htmlFor="taxNumber">
          <Input id="taxNumber" {...register("taxNumber")} />
        </FormField>
      </div>

      <FormField label={t("company.website")} htmlFor="website">
        <Input id="website" {...register("website")} />
      </FormField>

      <div className="space-y-3 rounded-lg border border-line p-4">
        <p className="text-sm font-medium text-ink">{t("company.bankDetails")}</p>
        <FormField label={t("company.bankName")} htmlFor="bankName">
          <Input id="bankName" {...register("bankDetails.bankName")} />
        </FormField>
        <FormField label={t("company.accountHolder")} htmlFor="accountHolder">
          <Input id="accountHolder" {...register("bankDetails.accountHolder")} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("company.iban")} htmlFor="iban">
            <Input id="iban" {...register("bankDetails.iban")} />
          </FormField>
          <FormField label={t("company.bic")} htmlFor="bic">
            <Input id="bic" {...register("bankDetails.bic")} />
          </FormField>
        </div>
      </div>

      <FormField label={t("company.defaultInvoiceLanguage")} htmlFor="defaultInvoiceLanguage">
        <SegmentedControl
          value={invoiceLanguage}
          onChange={(v) => setValue("defaultInvoiceLanguage", v, { shouldDirty: true })}
          options={[
            { value: "de", label: t("languages.de") },
            { value: "en", label: t("languages.en") }
          ]}
        />
      </FormField>

      <div className="space-y-3 rounded-lg border border-line p-4">
        <p className="text-sm font-medium text-ink">{t("company.invoiceNumbering")}</p>
        <FormField
          label={t("company.invoiceNumberFormat")}
          htmlFor="invoiceNumberFormat"
          hint={t("company.invoiceNumberFormatHint")}
          error={fieldError("invoiceNumberFormat")}
        >
          <Input id="invoiceNumberFormat" invalid={!!errors.invoiceNumberFormat} {...register("invoiceNumberFormat")} />
        </FormField>
        <FormField
          label={t("company.nextInvoiceSequence")}
          htmlFor="nextInvoiceSequence"
          hint={t("company.nextInvoiceSequenceHint")}
          error={fieldError("nextInvoiceSequence")}
        >
          <Input
            id="nextInvoiceSequence"
            type="number"
            min="1"
            invalid={!!errors.nextInvoiceSequence}
            {...register("nextInvoiceSequence")}
          />
        </FormField>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          {t("actions.cancel")}
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? t("actions.saving") : t("actions.save")}
        </Button>
      </div>
    </form>
  );
}
