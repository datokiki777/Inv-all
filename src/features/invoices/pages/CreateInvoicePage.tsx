import { useTranslation } from "react-i18next";

// Stage 1 skeleton. The real form (React Hook Form + Zod, item rows,
// template picker) is a later stage per the phased plan.
export function CreateInvoicePage() {
  const { t } = useTranslation();
  return <h1 className="font-display text-2xl text-ink">{t("pages.createInvoice")}</h1>;
}
