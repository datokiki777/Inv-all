import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { clientService } from "@/features/clients/services/clientService";
import { generateId } from "@/utils/id";
import type { InvoiceFormValues } from "@/schemas";
import type { Client, ClientItemTemplateRow } from "@/types";

type Slot = "empty" | "1" | "2";

interface ClientItemTemplatePickerProps {
  client: Client | undefined;
  /** From the SAME useFieldArray instance InvoiceItemsEditor already owns — a second independent useFieldArray on the same "items" name can desync its `fields` list from the first one's re-renders. */
  replace: ReturnType<typeof useFieldArray<InvoiceFormValues, "items">>["replace"];
  onClientUpdated: (client: Client) => void;
}

/**
 * One dropdown (Empty / Template 1 / Template 2) plus a Save button, right
 * next to the Items list. Picking a template REPLACES the current items
 * with whatever was saved there (a no-op if that slot is empty, so
 * accidentally selecting an unused slot never wipes out real data). Save
 * always writes into whichever slot is currently selected in the dropdown
 * — there's no separate "which slot" prompt. Templates hold item fields
 * only (name/description/quantity/unit/price); VAT is invoice-level and
 * gets synced to the current rate automatically once items land in the form.
 */
export function ClientItemTemplatePicker({ client, replace, onClientUpdated }: ClientItemTemplatePickerProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const toast = useToast();
  const { control, getValues } = useFormContext<InvoiceFormValues>();
  const taxRatePercent = useWatch({ control, name: "taxRatePercent" });
  const [slot, setSlot] = useState<Slot>("empty");

  if (!client) return null;

  function applyTemplate(rows: ClientItemTemplateRow[] | undefined) {
    if (!rows || rows.length === 0) return;
    replace(
      rows.map((row) => ({
        rowId: generateId(),
        productId: undefined,
        name: row.name,
        description: row.description ?? "",
        quantity: row.quantity,
        unit: row.unit,
        unitPrice: row.unitPrice,
        discountType: "none" as const,
        discountValue: undefined,
        vatPercent: taxRatePercent ?? 19
      }))
    );
  }

  function handleSlotChange(value: string) {
    const nextSlot = value as Slot;
    setSlot(nextSlot);
    if (!client) return;
    if (nextSlot === "1") applyTemplate(client.itemTemplate1);
    if (nextSlot === "2") applyTemplate(client.itemTemplate2);
  }

  async function handleSave() {
    if (!client || slot === "empty") return;
    const rows: ClientItemTemplateRow[] = getValues("items").map((item) => ({
      name: item.name,
      description: item.description || undefined,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice
    }));
    try {
      const updated = await clientService.saveItemTemplate(client.id, slot === "1" ? 1 : 2, rows);
      onClientUpdated(updated);
      toast.success(t("invoice:form.itemTemplateSaveSuccess", { slot }));
    } catch {
      toast.error(t("invoice:form.itemTemplateSaveError"));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select
          aria-label={t("invoice:form.itemTemplate")}
          value={slot}
          onChange={handleSlotChange}
          options={[
            { value: "empty", label: t("invoice:form.itemTemplateEmpty") },
            { value: "1", label: t("invoice:form.itemTemplate1") },
            { value: "2", label: t("invoice:form.itemTemplate2") }
          ]}
        />
      </div>
      <Button type="button" variant="secondary" onClick={handleSave} disabled={slot === "empty"} aria-label={t("invoice:form.itemTemplateSave")}>
        <Save size={16} />
      </Button>
    </div>
  );
}
