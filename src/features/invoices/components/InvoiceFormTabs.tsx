import { Pencil, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

export type InvoiceFormTab = "edit" | "preview";

interface InvoiceFormTabsProps {
  active: InvoiceFormTab;
  onChange: (tab: InvoiceFormTab) => void;
}

/**
 * Sticky Edit/Preview switcher pinned to the top of the Invoice form, so
 * a person can check how the PDF looks at any point while filling it in
 * — without saving first. Rendered by InvoiceForm inside a `sticky top-0`
 * wrapper; this component itself is just the pill control.
 */
export function InvoiceFormTabs({ active, onChange }: InvoiceFormTabsProps) {
  const { t } = useTranslation(["common", "invoice"]);

  return (
    <div className="flex gap-1 rounded-lg border border-line bg-surface-sunken p-1">
      <button
        type="button"
        onClick={() => onChange("edit")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors",
          active === "edit" ? "bg-surface-raised text-ink shadow-sm" : "text-ink-faint"
        )}
      >
        <Pencil size={15} /> {t("invoice:form.editTab")}
      </button>
      <button
        type="button"
        onClick={() => onChange("preview")}
        className={cn(
          "flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors",
          active === "preview" ? "bg-surface-raised text-ink shadow-sm" : "text-ink-faint"
        )}
      >
        <FileText size={15} /> {t("invoice:form.previewTab")}
      </button>
    </div>
  );
}
