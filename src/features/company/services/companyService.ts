import { companyRepository, settingsRepository } from "@/storage/repositories";
import { generateId } from "@/utils/id";
import { nowIso } from "@/utils/date";
import type { Company } from "@/types";
import type { CompanyFormValues } from "@/schemas";

const DEFAULT_INVOICE_NUMBER_FORMAT = "INV-{YYYY}-{seq:4}";

/**
 * Backward-compat, one-time: companies created before per-company invoice
 * numbering existed don't have invoiceNumberFormat/nextInvoiceSequence in
 * storage at all. The very first time such a company is loaded, backfill
 * those two fields from the old shared AppSettings values (so an existing
 * user's in-progress sequence — "I'm already at #6" — carries over exactly,
 * instead of silently resetting to #1) and persist the fix so this only
 * ever runs once per company.
 */
async function migrateLegacyNumbering(company: Company): Promise<Company> {
  if (company.invoiceNumberFormat && company.nextInvoiceSequence) return company;

  // Old settings records may still physically have these fields even though
  // the current AppSettings type no longer declares them.
  const legacySettings = (await settingsRepository.get()) as unknown as {
    invoiceNumberFormat?: string;
    nextInvoiceSequence?: number;
  };

  const migrated: Company = {
    ...company,
    invoiceNumberFormat: company.invoiceNumberFormat ?? legacySettings.invoiceNumberFormat ?? DEFAULT_INVOICE_NUMBER_FORMAT,
    nextInvoiceSequence: company.nextInvoiceSequence ?? legacySettings.nextInvoiceSequence ?? 1,
    updatedAt: nowIso()
  };
  await companyRepository.save(migrated);
  return migrated;
}

/**
 * Orchestration layer between the Company UI and the repository. Company
 * is a genuine list now (multiple companies, each with its own invoice
 * numbering) — companyRepository was already list-shaped from the start,
 * so no storage changes were needed, only this service and the UI above it.
 */
export const companyService = {
  async list(): Promise<Company[]> {
    const companies = await companyRepository.getAll();
    return Promise.all(companies.map(migrateLegacyNumbering));
  },

  async getById(id: string): Promise<Company | undefined> {
    const company = await companyRepository.getById(id);
    return company ? migrateLegacyNumbering(company) : undefined;
  },

  /**
   * Resolves which company a new invoice should default to: the
   * last-used one (if it still exists), otherwise the first company in
   * the list, otherwise undefined (no company set up yet).
   */
  async getActive(): Promise<Company | undefined> {
    const [companies, settings] = await Promise.all([this.list(), settingsRepository.get()]);
    if (companies.length === 0) return undefined;
    const lastUsed = settings.lastUsedCompanyId ? companies.find((c) => c.id === settings.lastUsedCompanyId) : undefined;
    return lastUsed ?? companies[0];
  },

  async create(values: CompanyFormValues): Promise<Company> {
    const now = nowIso();
    const company: Company = { ...values, id: generateId(), createdAt: now, updatedAt: now };
    await companyRepository.save(company);
    return company;
  },

  async update(existing: Company, values: CompanyFormValues): Promise<Company> {
    const company: Company = { ...values, id: existing.id, createdAt: existing.createdAt, updatedAt: nowIso() };
    await companyRepository.save(company);
    return company;
  },

  async remove(id: string): Promise<void> {
    await companyRepository.remove(id);
  }
};
