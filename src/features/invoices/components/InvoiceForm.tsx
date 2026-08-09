import { useEffect, useState, lazy, Suspense } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { invoiceFormSchema, type InvoiceFormValues } from "@/schemas";
import type { AppSettings, Client, Company, Invoice, ProductOrService } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { todayDateOnly, formatDate } from "@/utils/date";
import { blankInvoiceFormItem, invoiceToFormValues } from "@/utils/invoiceFormMapping";
import { defaultPdfVisibility } from "@/utils/invoicePdfVisibility";
import { useInvoiceDraftAutosave, loadInvoiceDraft, clearInvoiceDraft, type InvoiceDraftSnapshot } from "@/features/invoices/hooks/useInvoiceDraft";
import { ClientPicker } from "./ClientPicker";
import { CompanyPicker } from "./CompanyPicker";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { TaxSettingsEditor } from "./TaxSettingsEditor";
import { DiscountEditor } from "./DiscountEditor";
import { CompanyPdfSummary } from "./CompanyPdfSummary";
import { ClientPdfSummary } from "./ClientPdfSummary";
import { PdfVisibilitySwitch } from "./PdfVisibilitySwitch";
import { NoteTemplatePicker } from "./NoteTemplatePicker";
import { InvoiceTotalsPreview } from "./InvoiceTotalsPreview";
import { InvoiceFormTabs, type InvoiceFormTab } from "./InvoiceFormTabs";

// @react-pdf/renderer + pdf.js are large — this keeps them out of the main
// app bundle entirely. They only download once the Preview tab is actually
// opened, exactly like the saved-invoice InvoicePreviewPage already does.
const InvoiceLivePreview = lazy(() =>
  import("./InvoiceLivePreview").then((m) => ({ default: m.InvoiceLivePreview }))
);

const TEMPLATES = ["classic", "modern", "compact", "minimal"] as const;
const PAYMENT_METHODS = ["bankTransfer", "cash", "paypal", "other"] as const;

interface InvoiceFormProps {
  /** "new" for the create page, the invoice id for the edit page — scopes autosave/restore to this form. */
  draftKey: string;
  invoice?: Invoice;
  companies: Company[];
  /** Which company a NEW invoice should start on (edit mode ignores this — invoiceToFormValues already carries the invoice's own companyId). */
  activeCompanyId?: string;
  clients: Client[];
  products: ProductOrService[];
  settings: AppSettings;
  suggestedInvoiceNumber?: string;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  onClientCreated: (client: Client) => void;
  onCompanyCreated: (company: Company) => void;
}

function toDefaultValues(
  invoice: Invoice | undefined,
  settings: AppSettings,
  suggestedInvoiceNumber: string | undefined,
  activeCompanyId: string | undefined
): InvoiceFormValues {
  if (invoice) return invoiceToFormValues(invoice);

  const today = todayDateOnly();
  return {
    invoiceNumber: suggestedInvoiceNumber ?? "",
    createdDate: today,
    serviceDate: "",
    dueDate: "",
    companyId: activeCompanyId ?? "",
    clientId: "",
    items: [blankInvoiceFormItem(19)],
    taxMode: "standard",
    taxRatePercent: 19,
    taxExplanationText: "",
    discountType: "none",
    discountValue: undefined,
    currency: settings.defaultCurrency,
    paidAmount: 0,
    note: settings.lastNoteText ?? "",
    paymentMethod: "bankTransfer",
    paymentTermsText: "",
    status: "draft",
    templateId: settings.defaultInvoiceTemplateId,
    pdfLanguage: settings.defaultInvoiceLanguage,
    pdfVisibility: settings.lastInvoicePdfVisibility ?? defaultPdfVisibility
  };
}

export function InvoiceForm({
  draftKey,
  invoice,
  companies,
  activeCompanyId,
  clients,
  products,
  settings,
  suggestedInvoiceNumber,
  onSubmit,
  onClientCreated,
  onCompanyCreated
}: InvoiceFormProps) {
  const { t, i18n } = useTranslation(["common", "invoice"]);
  const [clientList, setClientList] = useState(clients);
  const [companyList, setCompanyList] = useState(companies);
  const [draftFound, setDraftFound] = useState<InvoiceDraftSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<InvoiceFormTab>("edit");

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: toDefaultValues(invoice, settings, suggestedInvoiceNumber, activeCompanyId)
  });
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = methods;

  const selectedClientId = watch("clientId");
  const selectedClient = clientList.find((c) => c.id === selectedClientId);
  const selectedCompanyId = watch("companyId");
  const selectedCompany = companyList.find((c) => c.id === selectedCompanyId) ?? companyList[0];

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
      {/* position: fixed instead of sticky — with CreateInvoicePage/EditInvoicePage
          wrapping this in their own space-y-6 container above an <h1>, sticky's
          "stuck" region depends on that ancestor's box and browser-specific
          containing-block quirks with the -mx-4 bleed trick. Fixed sidesteps all
          of that: it's pinned to the viewport unconditionally, like a native
          header. The pt-[4.75rem] spacer below reserves exactly its height so
          content never starts underneath it. */}
      <div className="fixed inset-x-0 top-0 z-30 mx-auto max-w-md bg-surface px-4 pb-3 pt-4">
        <InvoiceFormTabs active={activeTab} onChange={setActiveTab} />
      </div>
      <div className="pt-[4.75rem]" />

      {activeTab === "edit" ? (
        <>
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

        <CompanyPicker
          companies={companyList}
          isNewInvoice={!invoice}
          onCompanyCreated={(newCompany) => {
            setCompanyList((prev) => [...prev, newCompany]);
            onCompanyCreated(newCompany);
          }}
        />

        <CompanyPdfSummary company={selectedCompany} />

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
            {selectedCompany?.bankDetails ? <PdfVisibilitySwitch visKey="showBankDetails" /> : null}
          </div>
          <FormField label={t("invoice:form.paymentMethod")} htmlFor="paymentMethod">
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <Select
                  id="paymentMethod"
                  value={field.value}
                  onChange={field.onChange}
                  options={PAYMENT_METHODS.map((method) => ({ value: method, label: t(`invoice:form.paymentMethods.${method}`) }))}
                />
              )}
            />
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
          <div className="overflow-hidden rounded border border-line bg-surface-sunken focus-within:ring-1 focus-within:ring-accent">
            <Textarea id="note" className="rounded-none border-0 bg-transparent focus:ring-0" {...register("note")} />
            <NoteTemplatePicker />
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("invoice:form.template")} htmlFor="templateId">
            <Controller
              control={control}
              name="templateId"
              render={({ field }) => (
                <Select
                  id="templateId"
                  value={field.value}
                  onChange={field.onChange}
                  options={TEMPLATES.map((template) => ({ value: template, label: t(`invoice:form.templates.${template}`) }))}
                />
              )}
            />
          </FormField>
          <FormField label={t("invoice:form.pdfLanguage")} htmlFor="pdfLanguage">
            <Controller
              control={control}
              name="pdfLanguage"
              render={({ field }) => (
                <Select
                  id="pdfLanguage"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "de", label: t("languages.de") },
                    { value: "en", label: t("languages.en") }
                  ]}
                />
              )}
            />
          </FormField>
        </div>

        <InvoiceTotalsPreview />

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("actions.saving") : t("actions.save")}
        </Button>
          </form>
        </>
      ) : (
        <Suspense fallback={<LoadingSpinner />}>
          {selectedCompany ? <InvoiceLivePreview company={selectedCompany} client={selectedClient} /> : null}
        </Suspense>
      )}
    </FormProvider>
  );
}
