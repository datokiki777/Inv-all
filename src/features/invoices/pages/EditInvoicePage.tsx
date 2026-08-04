import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useInvoiceFormData } from "@/features/invoices/hooks/useInvoiceFormData";
import { InvoiceForm } from "@/features/invoices/components/InvoiceForm";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import type { InvoiceFormValues } from "@/schemas";

export function EditInvoicePage() {
  const { t } = useTranslation(["common", "invoice"]);
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { status, company, clients, products, settings, invoice } = useInvoiceFormData(invoiceId);

  async function handleSubmit(values: InvoiceFormValues) {
    if (!company || !invoice) return;
    const client = clients.find((c) => c.id === values.clientId);
    if (!client) return;
    try {
      await invoiceService.update(invoice, values, { company, client });
      toast.success(t("invoice:form.saveSuccess"));
      navigate("/invoices");
    } catch {
      toast.error(t("invoice:form.saveError"));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">{t("pages.editInvoice")}</h1>

      {status === "loading" ? <LoadingSpinner label={t("invoice:form.loading")} /> : null}

      {status === "error" ? (
        <EmptyState title={t("invoice:form.loadError")} description={t("invoice:form.loadErrorHint")} />
      ) : null}

      {status === "ready" && !invoice ? <EmptyState title={t("invoice:form.notFound")} /> : null}

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

      {status === "ready" && company && settings && invoice ? (
        <InvoiceForm
          invoice={invoice}
          clients={clients}
          products={products}
          settings={settings}
          onSubmit={handleSubmit}
          onClientCreated={() => {}}
        />
      ) : null}
    </div>
  );
}
