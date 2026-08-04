import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFormContext } from "react-hook-form";
import { Plus } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { ClientForm } from "@/features/clients/components/ClientForm";
import { clientService } from "@/features/clients/services/clientService";
import { useToast } from "@/components/ui/toast";
import { getClientDisplayName } from "@/utils/clientDisplayName";
import type { Client } from "@/types";
import type { ClientFormValues, InvoiceFormValues } from "@/schemas";

interface ClientPickerProps {
  clients: Client[];
  onClientCreated: (client: Client) => void;
}

/** Client <select> (bound via form context) plus a "+" quick-add reusing the full ClientForm in a dialog. */
export function ClientPicker({ clients, onClientCreated }: ClientPickerProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const toast = useToast();
  const {
    control,
    setValue,
    formState: { errors }
  } = useFormContext<InvoiceFormValues>();
  const [addOpen, setAddOpen] = useState(false);

  async function handleQuickAdd(values: ClientFormValues) {
    try {
      const created = await clientService.create(values);
      onClientCreated(created);
      setValue("clientId", created.id, { shouldValidate: true, shouldDirty: true });
      setAddOpen(false);
      toast.success(t("clients.saveSuccess"));
    } catch {
      toast.error(t("clients.saveError"));
    }
  }

  const error = errors.clientId?.message ? t(`validation.${errors.clientId.message}`) : undefined;

  return (
    <>
      <FormField label={t("invoice:form.client")} htmlFor="clientId" required error={error}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Controller
              control={control}
              name="clientId"
              render={({ field }) => (
                <Select
                  id="clientId"
                  invalid={!!error}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("invoice:form.selectClient")}
                  options={clients.map((client) => ({ value: client.id, label: getClientDisplayName(client) }))}
                />
              )}
            />
          </div>
          <Button type="button" variant="secondary" size="default" onClick={() => setAddOpen(true)} aria-label={t("clients.addTitle")}>
            <Plus size={18} />
          </Button>
        </div>
      </FormField>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent title={t("clients.addTitle")}>
          <ClientForm onSubmit={handleQuickAdd} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
