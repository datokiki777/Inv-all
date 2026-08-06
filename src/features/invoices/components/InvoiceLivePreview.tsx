import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { pdf } from "@react-pdf/renderer";
import { getTemplate } from "@/pdf/templateRegistry";
import { getPdfLabels } from "@/pdf/labels";
import { PdfCanvasPreview } from "@/pdf/PdfCanvasPreview";
import { buildInvoiceFromForm } from "@/utils/invoiceFormMapping";
import { nowIso } from "@/utils/date";
import { EmptyState } from "@/components/common/EmptyState";
import type { InvoiceFormValues } from "@/schemas";
import type { Client, Company } from "@/types";

const PREVIEW_DEBOUNCE_MS = 500;

interface InvoiceLivePreviewProps {
  company: Company;
  client: Client | undefined;
}

/**
 * Renders a live PDF preview of the invoice as it's being filled in —
 * before it's ever saved. Built from the exact same buildInvoiceFromForm()
 * + template + PdfCanvasPreview pipeline used for a saved invoice's real
 * preview/download, so nothing here can visually drift from what actually
 * gets produced once you hit Save. Regenerated on a short debounce (not
 * every keystroke) since building a PDF has real cost.
 */
export function InvoiceLivePreview({ company, client }: InvoiceLivePreviewProps) {
  const { t } = useTranslation(["common", "invoice"]);
  const { control } = useFormContext<InvoiceFormValues>();
  const values = useWatch({ control });

  const [blob, setBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const previewCreatedAt = useRef(nowIso());

  useEffect(() => {
    if (!client) return;
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const invoice = buildInvoiceFromForm(
          values as InvoiceFormValues,
          { id: "preview", createdAt: previewCreatedAt.current },
          company,
          client,
          nowIso()
        );
        const { Component } = getTemplate(invoice.templateId);
        const labels = getPdfLabels(invoice.pdfLanguage);
        const generated = await pdf(<Component invoice={invoice} labels={labels} />).toBlob();
        if (!cancelled) {
          setBlob(generated);
          setStatus("idle");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values), company, client]);

  if (!client) {
    return <EmptyState title={t("invoice:form.previewNeedsClient")} />;
  }

  if (status === "error") {
    return <EmptyState title={t("invoice:preview.loadError")} />;
  }

  return (
    <div className="h-[calc(100vh-16rem)] overflow-hidden rounded-lg border border-line">
      <PdfCanvasPreview blob={blob} loadErrorLabel={t("invoice:preview.loadError")} />
    </div>
  );
}
