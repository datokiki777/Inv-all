import { useEffect, useState, lazy, Suspense } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { invoiceFormSchema, type InvoiceFormValues } from "@/schemas";
import { cn } from "@/utils/cn";
import type { AppSettings, Client, Company, Invoice, ProductOrService, TaxSettings } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { todayDateOnly, formatDate } from "@/utils/date";
import { blankInvoiceFormItem, invoiceToFormValues } from "@/utils/invoiceFormMapping";
import { defaultPdfVisibility } from "@/utils/invoicePdfVisibility";
import { CURRENCIES } from "@/utils/currencies";
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

const TEMPLATES = ["classic", "modern", "compact", "minimal", "new"] as const;
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
  /** activeCompany's own last-used tax settings (if it has prior invoices) — a new invoice starts from these instead of always Standard 19%. */
  lastTaxSettings?: TaxSettings;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  onClientCreated: (client: Client) => void;
  onCompanyCreated: (company: Company) => void;
}

function toDefaultValues(
  invoice: Invoice | undefined,
  settings: AppSettings,
  suggestedInvoiceNumber: string | undefined,
  activeCompany: Company | undefined,
  lastTaxSettings: TaxSettings | undefined
): InvoiceFormValues {
  if (invoice) return invoiceToFormValues(invoice);

  const today = todayDateOnly();
  const taxMode = lastTaxSettings?.mode ?? "standard";
  const taxRatePercent = taxMode === "standard" || taxMode === "custom" ? (lastTaxSettings?.ratePercent ?? 19) : undefined;
  return {
    invoiceNumber: suggestedInvoiceNumber ?? "",
    createdDate: today,
    serviceDate: "",
    dueDate: "",
    companyId: activeCompany?.id ?? "",
    clientId: "",
    items: [blankInvoiceFormItem(taxRatePercent ?? 19)],
    taxMode,
    taxRatePercent,
    taxExplanationText: lastTaxSettings?.explanationText ?? "",
    discountType: "none",
    discountValue: undefined,
    currency: activeCompany?.defaultCurrency ?? "EUR",
    paidAmount: 0,
    note: settings.lastNoteText ?? "",
    paymentMethod: "bankTransfer",
    paymentTermsText: "",
    status: "draft",
    templateId: activeCompany?.defaultInvoiceTemplateId ?? "modern",
    pdfLanguage: activeCompany?.defaultInvoiceLanguage ?? "en",
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
  lastTaxSettings,
  onSubmit,
  onClientCreated,
  onCompanyCreated
}: InvoiceFormProps) {
  const { t, i18n } = useTranslation(["common", "invoice"]);
  const [clientList, setClientList] = useState(clients);
  const [companyList, setCompanyList] = useState(companies);
  const [draftFound, setDraftFound] = useState<InvoiceDraftSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<InvoiceFormTab>("edit");
  // Preview is lazy-mounted on its FIRST visit only (so a session that
  // never opens it never pays for generating/rendering the PDF at all),
  // but once shown, it then stays mounted for the rest of the session.
  const [previewEverShown, setPreviewEverShown] = useState(false);
  useEffect(() => {
    if (activeTab === "preview") setPreviewEverShown(true);
  }, [activeTab]);

  // Three increasingly careful attempts at sharing ONE scroll position
  // between Edit and Preview (a single requestAnimationFrame, then
  // polling for a stable scrollHeight, then a ResizeObserver covering
  // every plausible scroll root — main/documentElement/body/
  // scrollingElement) all still failed on a real device. That last one
  // should have been robust against any timing or target-identification
  // problem, which means the premise itself — moving one shared scroll
  // position between two different pieces of content — was the fragile
  // part, not the mechanism used to do it. Each tab now has its own
  // permanent, independently-scrolling box instead (see the fixed-
  // position wrappers below), so there is nothing left to capture or
  // restore: neither box is ever unmounted, so the browser's own,
  // completely ordinary per-element scroll memory just handles it.
  function handleTabChange(nextTab: InvoiceFormTab) {
    setActiveTab(nextTab);
  }

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: toDefaultValues(
      invoice,
      settings,
      suggestedInvoiceNumber,
      companies.find((c) => c.id === activeCompanyId),
      lastTaxSettings
    )
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
        <InvoiceFormTabs active={activeTab} onChange={handleTabChange} />
      </div>

      {/* Each tab now owns its own independent, self-contained scroll
          region (position: fixed, its own overflow-y-auto) instead of
          both sharing <main>'s scroll and relying on JS to capture/
          restore a single shared scrollTop across the switch. Three
          increasingly careful attempts at that shared-scroll approach —
          a single requestAnimationFrame, then polling for a stable
          scrollHeight, then a ResizeObserver reacting to the browser's
          own verified resize signal, even covering every plausible
          alternate scroll root (documentElement/body/scrollingElement)
          — all still failed on a real device. That ResizeObserver
          version in particular should have been robust against any
          timing or target-identification problem, so its failure
          pointed at the premise itself being wrong: trying to move ONE
          shared scroll position between two different pieces of content
          is inherently fragile. Giving each tab its own permanent,
          independently-scrolling box sidesteps the whole problem — since
          neither box is ever unmounted (still just hidden/shown via
          `hidden`), the browser's own, completely ordinary per-element
          scroll memory does this for free, with no custom restore logic
          of any kind needed. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-[4.75rem] z-20 mx-auto max-w-md overflow-y-auto px-4 pb-24",
          activeTab === "edit" ? "" : "hidden"
        )}
      >
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

        <InvoiceItemsEditor
          products={products}
          client={selectedClient}
          onClientUpdated={(updated) => setClientList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))}
        />

        <TaxSettingsEditor />
        <DiscountEditor />

        <FormField label={t("invoice:form.currency")} htmlFor="currency" error={err("currency")}>
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Select
                id="currency"
                invalid={!!errors.currency}
                value={field.value}
                onChange={field.onChange}
                options={CURRENCIES.map((currency) => ({ value: currency.code, label: `${currency.code} — ${currency.name}` }))}
              />
            )}
          />
        </FormField>

        <div className="space-y-3 rounded-lg border border-line p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-medium text-ink">{t("invoice:form.paymentDetails")}</p>
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
      </div>
      {previewEverShown ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 top-[4.75rem] z-20 mx-auto max-w-md overflow-y-auto px-4 pb-24",
            activeTab === "preview" ? "" : "hidden"
          )}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {selectedCompany ? <InvoiceLivePreview company={selectedCompany} client={selectedClient} /> : null}
          </Suspense>
        </div>
      ) : null}
    </FormProvider>
  );
}
