import { useEffect, useState } from "react";
import { companyService } from "@/features/company/services/companyService";
import { clientService } from "@/features/clients/services/clientService";
import { productService } from "@/features/products/services/productService";
import { invoiceService } from "@/features/invoices/services/invoiceService";
import { settingsRepository } from "@/storage/repositories";
import type { Company, Client, ProductOrService, Invoice, AppSettings } from "@/types";

type Status = "loading" | "ready" | "error";

interface InvoiceFormData {
  status: Status;
  company?: Company;
  clients: Client[];
  products: ProductOrService[];
  settings?: AppSettings;
  /** Only populated in edit mode. */
  invoice?: Invoice;
  /** Only populated in create mode (non-reserved, prefill only). */
  suggestedInvoiceNumber?: string;
  refreshClients: () => Promise<void>;
}

/**
 * Loads every piece of read-only context the Invoice form needs in one
 * place: the active Company (required — invoices can't be created
 * without one), the Client and Product lists for pickers, AppSettings for
 * defaults, and — in edit mode — the existing Invoice.
 */
export function useInvoiceFormData(invoiceId?: string): InvoiceFormData {
  const [status, setStatus] = useState<Status>("loading");
  const [company, setCompany] = useState<Company | undefined>();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<ProductOrService[]>([]);
  const [settings, setSettings] = useState<AppSettings | undefined>();
  const [invoice, setInvoice] = useState<Invoice | undefined>();
  const [suggestedInvoiceNumber, setSuggestedInvoiceNumber] = useState<string | undefined>();

  async function refreshClients() {
    setClients(await clientService.list());
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      try {
        const [loadedCompany, loadedClients, loadedProducts, loadedSettings, loadedInvoice] = await Promise.all([
          companyService.load(),
          clientService.list(),
          productService.list(),
          settingsRepository.get(),
          invoiceId ? invoiceService.getById(invoiceId) : Promise.resolve(undefined)
        ]);

        if (cancelled) return;

        setCompany(loadedCompany);
        setClients(loadedClients);
        setProducts(loadedProducts);
        setSettings(loadedSettings);
        setInvoice(loadedInvoice);

        if (!invoiceId) {
          setSuggestedInvoiceNumber(await invoiceService.suggestNextInvoiceNumber());
        }

        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  return { status, company, clients, products, settings, invoice, suggestedInvoiceNumber, refreshClients };
}
