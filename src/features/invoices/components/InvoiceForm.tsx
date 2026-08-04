import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { invoiceFormSchema, type InvoiceFormValues } from "@/schemas";
import type { AppSettings, Client, Invoice, ProductOrService } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { todayDateOnly } from "@/utils/date";
import { blankInvoiceFormItem, invoiceToFormValues } from "@/utils/invoiceFormMapping";
import { ClientPicker } from "./ClientPicker";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { TaxSettingsEditor } from "./TaxSettingsEditor";
import { DiscountEditor } from "./DiscountEditor";
import { InvoiceTotalsPreview } from "./InvoiceTotalsPreview";

const STATUSES = ["draft", "sent", "paid", "partiallyPaid", "overdue", "cancelled"] as const;
const TEMPLATES = ["classic", "modern", "compact", "minimal"] as const;
const PAYMENT_METHODS = ["bankTransfer", "cash", "paypal", "other"] as const;

interface InvoiceFormProps {
  invoice?: Invoice;
  clients: Client[];
  products: ProductOrService[];
  settings: AppSettings;
  suggestedInvoiceNumber?: string;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  onClientCreated: (client: Client) => void;
}

function addDays(dateOnly: string, days: number): string {
  const date = new Date(dateOnly);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toDefaultValues(invoice: Invoice | undefined, settings: AppSettings, suggestedInvoiceNumber: string | undefined): InvoiceFormValues {
  if (invoice) return invoiceToFormValues(invoice);

  const today = todayDateOnly();
  return {
    invoiceNumber: suggestedInvoiceNumber ?? "",
    createdDate: today,
    serviceDate: today,
    dueDate: addDays(today, 14),
    clientId: "",
    items: [blankInvoiceFormItem(19)],
    taxMode: "standard",
    taxRatePercent: 19,
    taxExplanationText: "",
    discountType: "none",
    discountValue: undefined,
    currency: settings.defaultCurrency,
    paidAmount: 0,
    note: "",
    paymentMethod: "bankTransfer",
    paymentTermsText: "",
    status: "draft",
    templateId: settings.defaultInvoiceTemplateId,
    pdfLanguage: settings.defaultInvoiceLanguage
  };
}

export function InvoiceForm({ invoice, clients, products, settings, suggestedInvoiceNumber, onSubmit, onClientCreated }: InvoiceFormProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const [clientList, setClientList] = useState(clients);

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: toDefaultValues(invoice, settings, suggestedInvoiceNumber)
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = methods;

  function err(key: keyof InvoiceFormValues) {
    const message = errors[key]?.message as string | undefined;
    return message ? t(`validation.${message}`) : undefined;
  }

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6 pb-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <FormField label={t("invoice:fields.invoiceNumber", { ns: "invoice" })} htmlFor="invoiceNumber" required error={err("invoiceNumber")}>
          <Input id="invoiceNumber" invalid={!!errors.invoiceNumber} {...register("invoiceNumber")} />
        </FormField>

        <div className="grid grid-cols-3 gap-2">
          <FormField label={t("invoice:fields.createdDate", { ns: "invoice" })} htmlFor="createdDate" error={err("createdDate")}>
            <Input id="createdDate" type="date" {...register("createdDate")} />
          </FormField>
          <FormField label={t("invoice:fields.serviceDate", { ns: "invoice" })} htmlFor="serviceDate" error={err("serviceDate")}>
            <Input id="serviceDate" type="date" {...register("serviceDate")} />
          </FormField>
          <FormField label={t("invoice:fields.dueDate", { ns: "invoice" })} htmlFor="dueDate" error={err("dueDate")}>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </FormField>
        </div>

        <ClientPicker
          clients={clientList}
          onClientCreated={(client) => {
            setClientList((prev) => [...prev, client]);
            onClientCreated(client);
          }}
        />

        <InvoiceItemsEditor products={products} />

        <TaxSettingsEditor />
        <DiscountEditor />

        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("invoice:form.currency")} htmlFor="currency" error={err("currency")}>
            <Input id="currency" maxLength={3} className="uppercase" {...register("currency")} />
          </FormField>
          <FormField label={t("invoice:form.paidAmount")} htmlFor="paidAmount">
            <Input id="paidAmount" type="number" step="0.01" min="0" inputMode="decimal" {...register("paidAmount")} />
          </FormField>
        </div>

        <div className="space-y-3 rounded-lg border border-line p-4">
          <p className="text-sm font-medium text-ink">{t("invoice:form.paymentDetails")}</p>
          <FormField label={t("invoice:form.paymentMethod")} htmlFor="paymentMethod">
            <Select id="paymentMethod" {...register("paymentMethod")}>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {t(`invoice:form.paymentMethods.${method}`)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t("invoice:form.paymentTermsText")} htmlFor="paymentTermsText">
            <Textarea id="paymentTermsText" {...register("paymentTermsText")} />
          </FormField>
        </div>

        <FormField label={t("invoice:form.note")} htmlFor="note">
          <Textarea id="note" {...register("note")} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("invoice:form.template")} htmlFor="templateId">
            <Select id="templateId" {...register("templateId")}>
              {TEMPLATES.map((template) => (
                <option key={template} value={template}>
                  {t(`invoice:form.templates.${template}`)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label={t("invoice:form.pdfLanguage")} htmlFor="pdfLanguage">
            <Select id="pdfLanguage" {...register("pdfLanguage")}>
              <option value="de">{t("languages.de")}</option>
              <option value="en">{t("languages.en")}</option>
            </Select>
          </FormField>
        </div>

        <FormField label={t("invoice:form.status")} htmlFor="status">
          <Select id="status" {...register("status")}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`invoice:status.${status}`)}
              </option>
            ))}
          </Select>
        </FormField>

        <InvoiceTotalsPreview />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("actions.saving") : t("actions.save")}
        </Button>
      </form>
    </FormProvider>
  );
}
