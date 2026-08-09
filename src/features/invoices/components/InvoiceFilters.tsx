import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { InvoiceFilters as Filters } from "@/utils/invoiceSearch";
import { defaultInvoiceFilters } from "@/utils/invoiceSearch";
import type { InvoiceStatus } from "@/types";

const STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "partiallyPaid", "overdue", "cancelled"];

interface InvoiceFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  clientOptions: { id: string; name: string }[];
}

export function InvoiceFilters({ filters, onChange, clientOptions }: InvoiceFiltersProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const [expanded, setExpanded] = useState(false);

  const activeCount = [
    filters.status !== "all",
    filters.clientId !== "all",
    filters.companyId !== "all",
    filters.dateFrom,
    filters.dateTo
  ].filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            placeholder={t("invoice:list.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <Button type="button" variant={activeCount > 0 ? "primary" : "secondary"} onClick={() => setExpanded((v) => !v)} aria-label={t("invoice:list.filters")}>
          <SlidersHorizontal size={16} />
          {activeCount > 0 ? activeCount : ""}
        </Button>
      </div>

      {expanded ? (
        <div className="space-y-2.5 rounded-lg border border-line bg-surface-raised p-3.5">
          <Select
            value={filters.status}
            onChange={(value) => onChange({ ...filters, status: value as Filters["status"] })}
            options={[
              { value: "all", label: t("invoice:list.allStatuses") },
              ...STATUSES.map((status) => ({ value: status, label: t(`invoice:status.${status}`) }))
            ]}
          />

          {clientOptions.length > 0 ? (
            <Select
              value={filters.clientId}
              onChange={(value) => onChange({ ...filters, clientId: value })}
              options={[
                { value: "all", label: t("invoice:list.allClients") },
                ...clientOptions.map((client) => ({ value: client.id, label: client.name }))
              ]}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={filters.dateFrom} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })} aria-label={t("invoice:list.dateFrom")} />
            <Input type="date" value={filters.dateTo} onChange={(e) => onChange({ ...filters, dateTo: e.target.value })} aria-label={t("invoice:list.dateTo")} />
          </div>

          {activeCount > 0 ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(defaultInvoiceFilters)}>
              {t("invoice:list.clearFilters")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
