import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { invoiceFormSchema, type InvoiceFormValues } from "@/schemas";
import type { AppSettings, Client, Company, Invoice, ProductOrService } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { todayDateOnly, formatDate } from "@/utils/date";
import { blankInvoiceFormItem, invoiceToFormValues } from "@/utils/invoiceFormMapping";
import { defaultPdfVisibility } from "@/utils/invoicePdfVisibility";
import { useInvoiceDraftAutosave, loadInvoiceDraft, clearInvoiceDraft, type InvoiceDraftSnapshot } from "@/features/invoices/hooks/useInvoiceDraft";
import { ClientPicker } from "./ClientPicker";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { TaxSettingsEditor } from "./TaxSettingsEditor";
import { DiscountEditor } from "./DiscountEditor";
import { CompanyPdfSummary } from "./CompanyPdfSummary";
import { ClientPdfSummary } from "./ClientPdfSummary";
import { PdfVisibilitySwitch } from "./PdfVisibilitySwitch";
import { InvoiceTotalsPreview } from "./InvoiceTotalsPreview";

const TEMPLATES = ["classic", "modern", "compact", "minimal"] as const;
const PAYMENT_METHODS = ["bankTransfer", "cash", "paypal", "other"] as const;

interface InvoiceFormProps {
  /** "new" for the create page, the invoice id for the edit page — scopes autosave/restore to this form. */
  draftKey: string;
  invoice?: Invoice;
  company: Company;
  clients: Client[];
  products: ProductOrService[];
  settings: AppSettings;
  suggestedInvoiceNumber?: string;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  onClientCreated: (client: Client) => void;
}

function toDefaultValues(invoice: Invoice | undefined, settings: AppSettings, suggestedInvoiceNumber: string | undefined): InvoiceFormValues {
  if (invoice) return invoiceToFormValues(invoice);

  const today = todayDateOnly();
  return {
    invoiceNumber: suggestedInvoiceNumber ?? "",
    createdDate: today,
    serviceDate: "",
    dueDate: "",
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
    pdfLanguage: settings.defaultInvoiceLanguage,
    pdfVisibility: settings.lastInvoicePdfVisibility ?? defaultPdfVisibility
  };
}

export function InvoiceForm({ draftKey, invoice, company, clients, products, settings, suggestedInvoiceNumber, onSubmit, onClientCreated }: InvoiceFormProps) {
  const { t, i18n } = useTranslation(["common", "invoice"]);
  const [clientList, setClientList] = useState(clients);
  const [draftFound, setDraftFound] = useState<InvoiceDraftSnapshot | null>(null);

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: toDefaultValues(invoice, settings, suggestedInvoiceNumber)
  });
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = methods;

  const selectedClientId = watch("clientId");
  const selectedClient = clientList.find((c) => c.id === selectedClientId);

  // Offer to restore an autosaved draft once, right after mount.
  useEffect(() => {
    let cancelled = false;
    loadInvoiceDraft(draftKey).then((snapshot) => {
      if (!cancelled && snapshot) setDraftFound(snapshot);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useInvoiceDraftAutosave(draftKey, watch, true);

  function restoreDraft() {
    if (!draftFound) return;
    reset(draftFound.values);
    setDraftFound(null);
  }

  function discardDraft() {
    clearInvoiceDraft(draftKey);
    setDraftFound(null);
  }

  function err(key: keyof InvoiceFormValues) {
    const message = errors[key]?.message as string | undefined;
    return message ? t(`validation.${message}`) : undefined;
  }

  return (
    <FormProvider {...methods}>
      {draftFound ? (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent/10 p-3.5 text-sm">
          <p className="text-ink">
            {t("invoice:form.draftFound", { date: formatDate(draftFound.savedAt, i18n.language === "de" ? "de-DE" : "en-US") })}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={discardDraft}>
              {t("invoice:form.discardDraft")}
            </Button>
            <Button type="button" size="sm" onClick={restoreDraft}>
              {t("invoice:form.restoreDraft")}
            </Button>
          </div>
        </div>
      ) : null}

      <form
        className="space-y-6 pb-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          await clearInvoiceDraft(draftKey);
        })}
      >
        <FormField label={t("invoice:fields.invoiceNumber", { ns: "invoice" })} htmlFor="invoiceNumber" required error={err("invoiceNumber")}>
          <Input id="invoiceNumber" invalid={!!errors.invoiceNumber} {...register("invoiceNumber")} />
        </FormField>

        <FormField label={t("invoice:fields.createdDate", { ns: "invoice" })} htmlFor="createdDate" error={err("createdDate")}>
          <Input id="createdDate" type="date" {...register("createdDate")} />
        </FormField>

        <FormField
          label={t("invoice:fields.serviceDate", { ns: "invoice" })}
          htmlFor="serviceDate"
          error={err("serviceDate")}
          headerRight={<PdfVisibilitySwitch visKey="showServiceDate" />}
        >
          <Input id="serviceDate" type="date" {...register("serviceDate")} />
        </FormField>

        <FormField
          label={t("invoice:fields.dueDate", { ns: "invoice" })}
          htmlFor="dueDate"
          error={err("dueDate")}
          headerRight={<PdfVisibilitySwitch visKey="showDueDate" />}
        >
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </FormField>

        <CompanyPdfSummary company={company} />

        <ClientPicker
          clients={clientList}
          onClientCreated={(client) => {
            setClientList((prev) => [...prev, client]);
            onClientCreated(client);
          }}
        />

        <ClientPdfSummary client={selectedClient} />

        <InvoiceItemsEditor products={products} />

        <TaxSettingsEditor />
        <DiscountEditor />

        <FormField label={t("invoice:form.currency")} htmlFor="currency" error={err("currency")}>
          <Input id="currency" maxLength={3} className="uppercase" {...register("currency")} />
        </FormField>

        <div className="space-y-3 rounded-lg border border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">{t("invoice:form.paymentDetails")}</p>
            {company.bankDetails ? <PdfVisibilitySwitch visKey="showBankDetails" /> : null}
          </div>
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

        <FormField
          label={t("invoice:form.note")}
          htmlFor="note"
          headerRight={<PdfVisibilitySwitch visKey="showNotes" />}
        >
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

        <InvoiceTotalsPreview />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("actions.saving") : t("actions.save")}
        </Button>
      </form>
    </FormProvider>
  );
}
