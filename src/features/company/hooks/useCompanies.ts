import { useCallback, useEffect, useState } from "react";
import { companyService } from "@/features/company/services/companyService";
import type { Company } from "@/types";
import type { CompanyFormValues } from "@/schemas";

type Status = "loading" | "ready" | "error";

/** Loads all companies, exposes create/update/remove mutators — same shape as useClients. */
export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState<Status>("loading");

  const reload = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await companyService.list();
      setCompanies(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (values: CompanyFormValues) => {
    const created = await companyService.create(values);
    setCompanies((prev) => [...prev, created]);
    return created;
  }, []);

  const update = useCallback(async (existing: Company, values: CompanyFormValues) => {
    const updated = await companyService.update(existing, values);
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await companyService.remove(id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { companies, status, create, update, remove, reload };
}
