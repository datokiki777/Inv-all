import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";

// Stage 1 skeleton — list, search, and filters are wired up once
// invoiceRepository + the invoice form exist (later stage).
export function InvoicesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("pages.invoices")}</h1>
        <Link to="/invoices/new">
          <Button size="sm">
            <Plus size={16} /> {t("actions.add")}
          </Button>
        </Link>
      </div>
      <EmptyState title={t("empty.invoices")} description={t("empty.invoicesHint")} />
    </div>
  );
}
