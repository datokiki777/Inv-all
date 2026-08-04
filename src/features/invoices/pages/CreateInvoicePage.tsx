import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useInvoiceFormData } from "@/features/invoices/hooks/useInvoiceFormData";
import { InvoiceForm } from "@/features/invoices/components/InvoiceForm";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import type { InvoiceFormValues } from "@/schemas";

export function CreateInvoicePage() {
  const { t } = useTranslation(["common", "invoice"]);
  const navigate = useNavigate();
  const toast = useToast();
  const { status, company, clients, products, settings, suggestedInvoiceNumber } = useInvoiceFormData();

  async function handleSubmit(values: InvoiceFormValues) {
    if (!company) return;
    const client = clients.find((c) => c.id === values.clientId);
    if (!client) return;
    try {
      await invoiceService.create(values, { company, client });
      toast.success(t("invoice:form.saveSuccess"));
      navigate("/invoices");
    } catch {
      toast.error(t("invoice:form.saveError"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.createInvoice")}</h1>

      {status === "loading" ? <LoadingSpinner label={t("invoice:form.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("invoice:form.loadError")} description={t("invoice:form.loadErrorHint")} />
      ) : null}

      {status === "ready" && !company ? (
        <EmptyState
          title={t("invoice:form.companyMissing")}
          description={t("invoice:form.companyMissingHint")}
          action={
            <Link to="/company">
              <Button size="sm">{t("pages.company")}</Button>
            </Link>
          }
        />
      ) : null}

      {status === "ready" && company && settings ? (
        <InvoiceForm
          draftKey="new"
          clients={clients}
          products={products}
          settings={settings}
          suggestedInvoiceNumber={suggestedInvoiceNumber}
          onSubmit={handleSubmit}
          onClientCreated={() => {}}
        />
      ) : null}
    </div>
  );
}
