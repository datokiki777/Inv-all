import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface CompanyOption {
  id: string;
  name: string;
}

interface CompanyFilterChipsProps {
  companies: CompanyOption[];
  value: string;
  onChange: (companyId: string) => void;
}

/**
 * Horizontal, always-visible pill row for jumping straight to one
 * company's invoices — deliberately not tucked inside a collapsible
 * filter panel, since "which company" is the first thing worth narrowing
 * down once there's more than one. Renders nothing at all when there's
 * only zero or one company (nothing to choose between). Shared between
 * the Invoices list and the Dashboard so both offer the same shortcut.
 */
export function CompanyFilterChips({ companies, value, onChange }: CompanyFilterChipsProps) {
  const { t } = useTranslation(["common", "invoice"]);
  if (companies.length <= 1) return null;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
          value === "all" ? "border-accent bg-accent/15 text-accent" : "border-line text-ink-muted"
        )}
      >
        {t("invoice:list.allCompanies")}
      </button>
      {companies.map((company) => (
        <button
          key={company.id}
          type="button"
          onClick={() => onChange(company.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            value === company.id ? "border-accent bg-accent/15 text-accent" : "border-line text-ink-muted"
          )}
        >
          <Building2 size={12} />
          {company.name}
        </button>
      ))}
    </div>
  );
}
