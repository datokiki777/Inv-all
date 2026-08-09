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
  companies: Company[];
  /** The company a new invoice should default to: last-used, else the first one. Undefined only when the list is empty. */
  activeCompany?: Company;
  clients: Client[];
  products: ProductOrService[];
  settings?: AppSettings;
  /** Only populated in edit mode. */
  invoice?: Invoice;
  /** Only populated in create mode (non-reserved, prefill only) — suggested against activeCompany. */
  suggestedInvoiceNumber?: string;
  refreshClients: () => Promise<void>;
}

/**
 * Loads every piece of read-only context the Invoice form needs in one
 * place: every Company (invoices can't be created without at least one),
 * the Client and Product lists for pickers, AppSettings for defaults, and
 * — in edit mode — the existing Invoice.
 */
export function useInvoiceFormData(invoiceId?: string): InvoiceFormData {
  const [status, setStatus] = useState<Status>("loading");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | undefined>();
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
        const [loadedCompanies, loadedClients, loadedProducts, loadedSettings, loadedInvoice] = await Promise.all([
          companyService.list(),
          clientService.list(),
          productService.list(),
          settingsRepository.get(),
          invoiceId ? invoiceService.getById(invoiceId) : Promise.resolve(undefined)
        ]);

        if (cancelled) return;

        // In edit mode, the invoice's OWN company (frozen at creation) is
        // the relevant default if it still exists in the list; otherwise
        // fall back to the same last-used/first resolution as a new invoice.
        const editingCompany = loadedInvoice
          ? loadedCompanies.find((c) => c.id === loadedInvoice.company.id)
          : undefined;
        const lastUsed = loadedSettings.lastUsedCompanyId
          ? loadedCompanies.find((c) => c.id === loadedSettings.lastUsedCompanyId)
          : undefined;
        const resolvedActive = editingCompany ?? lastUsed ?? loadedCompanies[0];

        setCompanies(loadedCompanies);
        setActiveCompany(resolvedActive);
        setClients(loadedClients);
        setProducts(loadedProducts);
        setSettings(loadedSettings);
        setInvoice(loadedInvoice);

        if (!invoiceId && resolvedActive) {
          setSuggestedInvoiceNumber(await invoiceService.suggestNextInvoiceNumber(resolvedActive.id));
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

  return { status, companies, activeCompany, clients, products, settings, invoice, suggestedInvoiceNumber, refreshClients };
}
