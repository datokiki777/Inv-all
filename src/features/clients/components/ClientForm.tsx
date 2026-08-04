import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { clientFormSchema, type ClientFormValues } from "@/schemas";
import type { Client } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface ClientFormProps {
  client?: Client;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  onCancel: () => void;
}

function toDefaultValues(client: Client | undefined): ClientFormValues {
  return {
    type: client?.type ?? "company",
    companyName: client?.companyName ?? "",
    firstName: client?.firstName ?? "",
    lastName: client?.lastName ?? "",
    addressLine1: client?.addressLine1 ?? "",
    addressLine2: client?.addressLine2 ?? "",
    postalCode: client?.postalCode ?? "",
    city: client?.city ?? "",
    country: client?.country ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    vatId: client?.vatId ?? "",
    taxNumber: client?.taxNumber ?? "",
    notes: client?.notes ?? ""
  };
}

export function ClientForm({ client, onSubmit, onCancel }: ClientFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: toDefaultValues(client)
  });

  const type = watch("type");

  function err(key: keyof ClientFormValues) {
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
      <FormField label={t("clients.type")} htmlFor="type">
        <SegmentedControl
          value={type}
          onChange={(v) => setValue("type", v, { shouldValidate: true })}
          options={[
            { value: "company", label: t("clients.typeCompany") },
            { value: "individual", label: t("clients.typeIndividual") }
          ]}
        />
      </FormField>

      {type === "company" ? (
        <FormField label={t("clients.companyName")} htmlFor="companyName" required error={err("companyName")}>
          <Input id="companyName" invalid={!!errors.companyName} {...register("companyName")} />
        </FormField>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("clients.firstName")} htmlFor="firstName" required error={err("firstName")}>
            <Input id="firstName" invalid={!!errors.firstName} {...register("firstName")} />
          </FormField>
          <FormField label={t("clients.lastName")} htmlFor="lastName" required error={err("lastName")}>
            <Input id="lastName" invalid={!!errors.lastName} {...register("lastName")} />
          </FormField>
        </div>
      )}

      <FormField label={t("clients.addressLine1")} htmlFor="addressLine1" required error={err("addressLine1")}>
        <Input id="addressLine1" invalid={!!errors.addressLine1} {...register("addressLine1")} />
      </FormField>
      <FormField label={t("clients.addressLine2")} htmlFor="addressLine2">
        <Input id="addressLine2" {...register("addressLine2")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("clients.postalCode")} htmlFor="postalCode" required error={err("postalCode")}>
          <Input id="postalCode" invalid={!!errors.postalCode} {...register("postalCode")} />
        </FormField>
        <FormField label={t("clients.city")} htmlFor="city" required error={err("city")}>
          <Input id="city" invalid={!!errors.city} {...register("city")} />
        </FormField>
      </div>
      <FormField label={t("clients.country")} htmlFor="country" required error={err("country")}>
        <Input id="country" invalid={!!errors.country} {...register("country")} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label={t("clients.email")} htmlFor="email" error={err("email")}>
          <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label={t("clients.phone")} htmlFor="phone">
          <Input id="phone" type="tel" {...register("phone")} />
        </FormField>
      </div>

      {type === "company" ? (
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("clients.vatId")} htmlFor="vatId">
            <Input id="vatId" {...register("vatId")} />
          </FormField>
          <FormField label={t("clients.taxNumber")} htmlFor="taxNumber">
            <Input id="taxNumber" {...register("taxNumber")} />
          </FormField>
        </div>
      ) : null}

      <FormField label={t("clients.notes")} htmlFor="notes">
        <Textarea id="notes" {...register("notes")} />
      </FormField>

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
