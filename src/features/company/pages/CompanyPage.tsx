import { useTranslation } from "react-i18next";
import { useCompany } from "@/features/company/hooks/useCompany";
import { CompanyForm } from "@/features/company/components/CompanyForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { useToast } from "@/components/ui/toast";
import type { CompanyFormValues } from "@/schemas";

export function CompanyPage() {
  const { t } = useTranslation();
  const { company, status, save } = useCompany();
  const toast = useToast();

  async function handleSubmit(values: CompanyFormValues) {
    try {
      await save(values);
      toast.success(t("company.saveSuccess"));
    } catch {
      toast.error(t("company.saveError"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.company")}</h1>

      {status === "loading" ? <LoadingSpinner label={t("company.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("company.loadError")} description={t("company.loadErrorHint")} />
      ) : null}

      {status === "ready" ? <CompanyForm company={company} onSubmit={handleSubmit} /> : null}
    </div>
  );
}
