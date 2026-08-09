import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/toast";
import { useCompanies } from "@/features/company/hooks/useCompanies";
import { CompanyForm } from "@/features/company/components/CompanyForm";
import { CompanyListItem } from "@/features/company/components/CompanyListItem";
import { DeleteCompanyDialog } from "@/features/company/components/DeleteCompanyDialog";
import type { Company } from "@/types";
import type { CompanyFormValues } from "@/schemas";

/**
 * Manage every company that can issue invoices — each with its own
 * details and its own invoice numbering. Picking which one a given
 * invoice is issued from happens on the Invoice form itself; this page
 * is just the list (add/edit/delete), same pattern as ClientsPage.
 */
export function CompaniesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { companies, status, create, update, remove } = useCompanies();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>();
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  function openCreate() {
    setEditingCompany(undefined);
    setFormOpen(true);
  }

  function openEdit(company: Company) {
    setEditingCompany(company);
    setFormOpen(true);
  }

  async function handleSubmit(values: CompanyFormValues) {
    try {
      if (editingCompany) {
        await update(editingCompany, values);
      } else {
        await create(values);
      }
      setFormOpen(false);
      toast.success(t("company.saveSuccess"));
    } catch {
      toast.error(t("company.saveError"));
    }
  }

  async function handleDelete() {
    if (!deletingCompany || companies.length <= 1) return;
    try {
      await remove(deletingCompany.id);
      toast.success(t("company.deleteSuccess"));
    } catch {
      toast.error(t("company.deleteError"));
    } finally {
      setDeletingCompany(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">{t("pages.company")}</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} /> {t("actions.add")}
        </Button>
      </div>

      {status === "loading" ? <LoadingSpinner label={t("company.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("company.loadError")} description={t("company.loadErrorHint")} />
      ) : null}

      {status === "ready" && companies.length === 0 ? (
        <EmptyState title={t("empty.company")} description={t("empty.companyHint")} action={<Button onClick={openCreate}>{t("actions.add")}</Button>} />
      ) : null}

      {status === "ready" && companies.length > 0 ? (
        <div className="space-y-2">
          {companies.map((company) => (
            <CompanyListItem
              key={company.id}
              company={company}
              onEdit={() => openEdit(company)}
              onDelete={() => setDeletingCompany(company)}
            />
          ))}
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent title={editingCompany ? t("company.editTitle") : t("company.addTitle")}>
          <CompanyForm company={editingCompany} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <DeleteCompanyDialog
        company={deletingCompany}
        isLast={companies.length <= 1}
        onOpenChange={(open) => !open && setDeletingCompany(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
