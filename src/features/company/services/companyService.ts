import { companyRepository } from "@/storage/repositories";
import { generateId } from "@/utils/id";
import { nowIso } from "@/utils/date";
import type { Company } from "@/types";
import type { CompanyFormValues } from "@/schemas";

/**
 * Orchestration layer between the Company form and the repository: assigns
 * id/timestamps. UI components never import companyRepository directly.
 */
export const companyService = {
  async load(): Promise<Company | undefined> {
    return companyRepository.get();
  },

  async save(existing: Company | undefined, values: CompanyFormValues): Promise<Company> {
    const now = nowIso();
    const company: Company = {
      ...values,
      id: existing?.id ?? generateId(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await companyRepository.save(company);
    return company;
  }
};
