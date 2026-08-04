import { useCallback, useEffect, useState } from "react";
import { companyService } from "@/features/company/services/companyService";
import type { Company } from "@/types";
import type { CompanyFormValues } from "@/schemas";

type Status = "loading" | "ready" | "error";

/** Loads the single active Company record and exposes a save() mutator. */
export function useCompany() {
  const [company, setCompany] = useState<Company | undefined>();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    companyService
      .load()
      .then((loaded) => {
        if (cancelled) return;
        setCompany(loaded);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (values: CompanyFormValues) => {
      const saved = await companyService.save(company, values);
      setCompany(saved);
      return saved;
    },
    [company]
  );

  return { company, status, save };
}
