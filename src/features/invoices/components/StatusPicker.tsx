import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";
import { INVOICE_STATUS_COLORS, INVOICE_STATUSES } from "@/utils/invoiceStatusColors";
import type { InvoiceStatus } from "@/types";

interface StatusPickerProps {
  status: InvoiceStatus;
  onChange: (status: InvoiceStatus) => void;
}

/**
 * A custom in-app dropdown (Radix Select) styled to look like the
 * colored StatusBadge pill, so a person can change an invoice's status
 * right from the Dashboard or Invoices list without opening the full
 * edit form or leaving the app's own UI for the OS picker. Always render
 * this OUTSIDE any wrapping <Link> — its trigger is a <button>, and a
 * click on it could still bubble up and trigger the link's navigation
 * on some mobile browsers.
 */
export function StatusPicker({ status, onChange }: StatusPickerProps) {
  const { t } = useTranslation("invoice");

  return (
    <RadixSelect.Root value={status} onValueChange={(value) => onChange(value as InvoiceStatus)}>
      <RadixSelect.Trigger
        onClick={(e) => e.stopPropagation()}
        aria-label={t("form.status")}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
          "focus:outline-none focus:ring-1 focus:ring-accent",
          INVOICE_STATUS_COLORS[status]
        )}
      >
        <RadixSelect.Value>{t(`status.${status}`)}</RadixSelect.Value>
        <RadixSelect.Icon>
          <ChevronDown size={12} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          onClick={(e) => e.stopPropagation()}
          className="z-[70] overflow-hidden rounded-lg border border-line bg-surface-raised shadow-xl"
        >
          <RadixSelect.Viewport className="p-1">
            {INVOICE_STATUSES.map((s) => (
              <RadixSelect.Item
                key={s}
                value={s}
                className={cn(
                  "relative flex h-10 cursor-pointer select-none items-center rounded px-3 pr-8 text-sm text-ink outline-none",
                  "data-[highlighted]:bg-surface-sunken data-[state=checked]:text-accent"
                )}
              >
                <RadixSelect.ItemText>{t(`status.${s}`)}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute right-3 flex items-center">
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
