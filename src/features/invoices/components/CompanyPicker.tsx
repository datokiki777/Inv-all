import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { CompanyForm } from "@/features/company/components/CompanyForm";
import { companyService } from "@/features/company/services/companyService";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { useToast } from "@/components/ui/toast";
import type { Company } from "@/types";
import type { CompanyFormValues, InvoiceFormValues } from "@/schemas";

interface CompanyPickerProps {
  companies: Company[];
  /** Only re-suggest the invoice number on company change while creating — an already-saved invoice's number never changes just because you look at a different company. */
  isNewInvoice: boolean;
  onCompanyCreated: (company: Company) => void;
}

/**
 * Company <select> (bound via form context) plus a "+" quick-add reusing
 * the full CompanyForm in a dialog — same pattern as ClientPicker.
 * Switching companies on a new (unsaved) invoice also re-suggests the
 * invoice number, since numbering is per-company — otherwise the number
 * shown would still belong to whichever company was selected first.
 */
export function CompanyPicker({ companies, isNewInvoice, onCompanyCreated }: CompanyPickerProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const toast = useToast();
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext<InvoiceFormValues>();
  const [addOpen, setAddOpen] = useState(false);

  async function resuggestInvoiceNumber(companyId: string) {
    if (!isNewInvoice) return;
    const suggested = await invoiceService.suggestNextInvoiceNumber(companyId);
    setValue("invoiceNumber", suggested, { shouldDirty: true });
  }

  async function handleQuickAdd(values: CompanyFormValues) {
    try {
      const created = await companyService.create(values);
      onCompanyCreated(created);
      setValue("companyId", created.id, { shouldValidate: true, shouldDirty: true });
      await resuggestInvoiceNumber(created.id);
      setAddOpen(false);
      toast.success(t("company.saveSuccess"));
    } catch {
      toast.error(t("company.saveError"));
    }
  }

  const error = errors.companyId?.message ? t(`validation.${errors.companyId.message}`) : undefined;

  return (
    <>
      <FormField label={t("invoice:form.company")} htmlFor="companyId" required error={error}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Controller
              control={control}
              name="companyId"
              render={({ field }) => (
                <Select
                  id="companyId"
                  invalid={!!error}
                  value={field.value}
                  onChange={(companyId) => {
                    field.onChange(companyId);
                    resuggestInvoiceNumber(companyId);
                  }}
                  placeholder={t("invoice:form.selectCompany")}
                  options={companies.map((company) => ({ value: company.id, label: company.name }))}
                />
              )}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={() => setAddOpen(true)}
            aria-label={t("company.addTitle")}
          >
            <Plus size={18} />
          </Button>
        </div>
      </FormField>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent title={t("company.addTitle")}>
          <CompanyForm onSubmit={handleQuickAdd} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
